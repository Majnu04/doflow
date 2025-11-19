import Razorpay from 'razorpay';
import crypto from 'crypto';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!razorpay) {
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

    const amount = course.discountPrice || course.price;

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

    const order = await razorpay.orders.create(options);

    // Create enrollment with pending status
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      paymentInfo: {
        razorpayOrderId: order.id,
        amount: amount,
        currency: 'INR',
        status: 'pending'
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      enrollmentId: enrollment._id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, enrollmentId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      enrollment.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      enrollment.paymentInfo.razorpaySignature = razorpay_signature;
      enrollment.paymentInfo.status = 'completed';

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(enrollment.course, {
        $inc: { enrollmentCount: 1 }
      });

      // Add course to user's enrolled courses
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          enrolledCourses: {
            course: enrollment.course,
            enrolledAt: new Date()
          }
        }
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        enrollment
      });
    } else {
      // Payment verification failed
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        'paymentInfo.status': 'failed'
      });

      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
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
