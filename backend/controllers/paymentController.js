import Razorpay from 'razorpay';
import crypto from 'crypto';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Initialize Razorpay lazily (will be initialized when first needed)
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    logger.info('Razorpay initialized successfully');
  }
  return razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const razorpayInstance = getRazorpayInstance();
    
    if (!razorpayInstance) {
      logger.error('Razorpay not configured properly');
      return res.status(503).json({ message: 'Payment service not configured. Please contact administrator.' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      'paymentInfo.status': 'completed'
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const amount = Number(course.discountPrice ?? course.price ?? 0);

    if (Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid course pricing configuration. Please contact support.' });
    }

    if (amount <= 0) {
      const session = await Enrollment.startSession();
      await session.startTransaction();

      try {
        let enrollment = await Enrollment.findOne({
          user: req.user._id,
          course: courseId
        }).session(session);

        const previousStatus = enrollment?.paymentInfo?.status;
        const isNewEnrollment = previousStatus !== 'completed';

        if (enrollment) {
          if (!enrollment.paymentInfo) {
            enrollment.paymentInfo = {};
          }

          enrollment.paymentInfo.razorpayOrderId = enrollment.paymentInfo.razorpayOrderId || `FREE-${Date.now()}`;
          enrollment.paymentInfo.amount = 0;
          enrollment.paymentInfo.currency = 'INR';
          enrollment.paymentInfo.status = 'completed';
          await enrollment.save({ session });
        } else {
          const [newEnrollment] = await Enrollment.create([{
            user: req.user._id,
            course: courseId,
            paymentInfo: {
              razorpayOrderId: `FREE-${Date.now()}`,
              amount: 0,
              currency: 'INR',
              status: 'completed'
            }
          }], { session });
          enrollment = newEnrollment;
        }

        if (isNewEnrollment) {
          await Course.findByIdAndUpdate(
            courseId,
            { $inc: { enrollmentCount: 1 } },
            { session }
          );
        }

        await User.findByIdAndUpdate(
          req.user._id,
          { $pull: { cart: courseId } },
          { session }
        );

        await session.commitTransaction();

        return res.json({
          skipPayment: true,
          enrollmentId: enrollment._id,
          message: 'Course is free. Enrollment completed without payment.'
        });
      } catch (txError) {
        await session.abortTransaction();
        throw txError;
      } finally {
        session.endSession();
      }
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: req.user._id.toString(),
        courseTitle: course.title
      }
    };

    let order;
    try {
      order = await razorpayInstance.orders.create(options);
    } catch (error) {
      logger.error('Razorpay order creation failed', { error: error?.error || error?.message });
      const gatewayMessage = error?.error?.description || error?.message || 'Unable to reach Razorpay gateway.';
      const statusCode = Number(error?.statusCode) >= 400 && Number(error?.statusCode) < 600
        ? Number(error.statusCode)
        : 502;
      return res.status(statusCode).json({
        message: `Payment gateway error: ${gatewayMessage}`,
      });
    }

    // Check if pending enrollment exists, update it; otherwise create new
    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      'paymentInfo.status': 'pending'
    });

    if (enrollment) {
      // Update existing pending enrollment
      enrollment.paymentInfo.razorpayOrderId = order.id;
      enrollment.paymentInfo.amount = amount;
      await enrollment.save();
    } else {
      // Create new enrollment with pending status
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: courseId,
        paymentInfo: {
          razorpayOrderId: order.id,
          amount: amount,
          currency: 'INR',
          status: 'pending'
        }
      });
    }

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      enrollmentId: enrollment._id
    });
  } catch (error) {
    logger.error('Create order error', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const session = await Enrollment.startSession();
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, enrollmentId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Start atomic transaction
      await session.startTransaction();

      try {
        // Payment verified successfully
        const enrollment = await Enrollment.findById(enrollmentId).session(session);

        if (!enrollment) {
          await session.abortTransaction();
          return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Check for duplicate payment processing
        if (enrollment.paymentInfo.razorpayPaymentId === razorpay_payment_id) {
          await session.abortTransaction();
          return res.json({
            success: true,
            message: 'Payment already processed',
            enrollment
          });
        }

        enrollment.paymentInfo.razorpayPaymentId = razorpay_payment_id;
        enrollment.paymentInfo.razorpaySignature = razorpay_signature;
        enrollment.paymentInfo.status = 'completed';
        await enrollment.save({ session });

        // Update course enrollment count
        await Course.findByIdAndUpdate(
          enrollment.course,
          { $inc: { enrollmentCount: 1 } },
          { session }
        );

        // Remove course from user's cart (atomic)
        await User.findByIdAndUpdate(
          req.user._id,
          { $pull: { cart: enrollment.course } },
          { session }
        );

        // Commit all changes atomically
        await session.commitTransaction();

        res.json({
          success: true,
          message: 'Payment verified successfully',
          enrollment
        });
      } catch (txError) {
        await session.abortTransaction();
        throw txError;
      }
    } else {
      // Payment verification failed
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        'paymentInfo.status': 'failed'
      });

      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    logger.error('Verify payment error', { error: error.message });
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Razorpay Webhook Handler (for live mode)
// @route   POST /api/payment/webhook
// @access  Public (but verified with webhook secret)
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.error('Webhook secret not configured');
      return res.status(500).json({ message: 'Webhook not configured' });
    }

    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature attempt');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    logger.info('Webhook received', { event: event, paymentId: payload.id });

    // Handle different events
    switch (event) {
      case 'payment.authorized':
      case 'payment.captured':
        // Find enrollment by order ID
        const enrollment = await Enrollment.findOne({
          'paymentInfo.razorpayOrderId': payload.order_id
        });

        if (enrollment) {
          // Idempotency check: skip if already processed
          if (enrollment.paymentInfo.razorpayPaymentId === payload.id && 
              enrollment.paymentInfo.status === 'completed') {
            logger.warn('Webhook already processed', { paymentId: payload.id });
            break;
          }

          const session = await Enrollment.startSession();
          await session.startTransaction();

          try {
            const wasCompleted = enrollment.paymentInfo.status === 'completed';

            enrollment.paymentInfo.razorpayPaymentId = payload.id;
            enrollment.paymentInfo.status = 'completed';
            enrollment.paymentInfo.capturedAt = new Date();
            await enrollment.save({ session });

            // Only increment count if this is the first completion
            if (!wasCompleted) {
              await Course.findByIdAndUpdate(
                enrollment.course,
                { $inc: { enrollmentCount: 1 } },
                { session }
              );

              // Remove course from user's cart
              await User.findByIdAndUpdate(
                enrollment.user,
                { $pull: { cart: enrollment.course } },
                { session }
              );
            }

            await session.commitTransaction();
            logger.info('Payment completed via webhook', { paymentId: payload.id });
          } catch (txError) {
            await session.abortTransaction();
            logger.error('Webhook transaction failed', { error: txError.message });
          } finally {
            session.endSession();
          }
        }
        break;

      case 'payment.failed':
        // Mark enrollment as failed
        await Enrollment.findOneAndUpdate(
          { 'paymentInfo.razorpayOrderId': payload.order_id },
          {
            'paymentInfo.status': 'failed',
            'paymentInfo.failureReason': payload.error_description
          }
        );
        logger.warn('Payment failed via webhook', { paymentId: payload.id });
        break;

      default:
        logger.info('Unhandled webhook event', { event: event });
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook error', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user enrollments
// @route   GET /api/payment/enrollments
// @access  Private
export const getUserEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      'paymentInfo.status': 'completed'
    })
      .populate('course')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
