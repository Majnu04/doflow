import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getCart } from '../src/store/slices/cartSlice';
import { FiCreditCard, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { Button, Card } from '../src/components/ui';
import api from '../src/utils/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COURSE_PLACEHOLDER = '/images/course-placeholder.svg';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const resolveCoursePrice = (course: { discountPrice?: number | null; price: number }) => (
    course.discountPrice ?? course.price
  );

  const total = items.reduce((sum, item) => sum + resolveCoursePrice(item), 0);
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
  const savings = originalTotal - total;
  const requiresPaymentGateway = items.some((item) => resolveCoursePrice(item) > 0);
  const ctaLabel = isProcessing
    ? 'Processing...'
    : requiresPaymentGateway
      ? (!razorpayLoaded ? 'Loading Payment...' : `Pay ₹${total}`)
      : 'Complete Enrollment';

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (requiresPaymentGateway && !razorpayLoaded) {
      toast.error('Payment system is loading. Please wait...');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      window.location.hash = '/auth';
      return;
    }

    setIsProcessing(true);

    try {
      let successfulPayments = 0;
      const totalCourses = items.length;

      // Process each course payment separately
      for (const item of items) {
        // Create Razorpay order
        const orderResponse = await api.post('/payment/create-order', {
          courseId: item._id
        });

        const { skipPayment, message, orderId, amount, currency, keyId, enrollmentId } = orderResponse.data;

        if (skipPayment) {
          successfulPayments++;
          toast.success(message || `Successfully enrolled in ${item.title}!`);
          continue;
        }

        // Create a promise to track payment completion
        const paymentPromise = new Promise((resolve, reject) => {
          const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'DoFlow Learning',
            description: `Payment for ${item.title}`,
            order_id: orderId,
            handler: async function (response: any) {
              try {
                // Verify payment
                const verifyResponse = await api.post('/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  enrollmentId: enrollmentId
                });

                if (verifyResponse.data.success) {
                  successfulPayments++;
                  toast.success(`Successfully enrolled in ${item.title}!`);
                  resolve(true);
                } else {
                  reject(new Error('Payment verification failed'));
                }
              } catch (error: any) {
                toast.error('Payment verification failed');
                console.error('Payment verification error:', error);
                reject(error);
              }
            },
            prefill: {
              name: user.name,
              email: user.email
            },
            theme: {
              color: '#6366f1'
            },
            modal: {
              ondismiss: function() {
                reject(new Error('Payment cancelled by user'));
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });

        // Wait for this payment to complete
        try {
          await paymentPromise;
        } catch (error) {
          console.error('Payment failed for course:', item.title);
          // Continue to next course even if this one fails
        }
      }

      // Refresh cart and redirect only if at least one payment was successful
      if (successfulPayments > 0) {
        // Refresh cart from backend (backend already removed paid courses)
        await dispatch(getCart());
        toast.success(`Successfully purchased ${successfulPayments} course(s)!`);
        setTimeout(() => {
          window.location.hash = '/dashboard';
        }, 1500);
      } else {
        toast.error('No payments were completed');
      }

      setIsProcessing(false);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card variant="default" className="text-center py-20 backdrop-blur-sm bg-gray-900/50">
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some courses to checkout</p>
            <Button
              variant="primary"
              onClick={() => window.location.hash = '/courses'}
            >
              Browse Courses
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-elite-navy">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.hash = '/cart'}
            icon={<FiArrowLeft />}
            className="mb-4"
          >
            Back to Cart
          </Button>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Checkout
          </h1>
          <p className="text-gray-400">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Info */}
          <div className="lg:col-span-2">
            <Card variant="default" className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <FiLock className="text-green-400" />
                <span className="text-sm text-gray-400">Secure Payment with Razorpay</span>
              </div>

              {/* Payment Info */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Payment Details</h3>
                <p className="text-gray-400 mb-4">
                  Complete your purchase securely with Razorpay. All payment methods including Credit/Debit Cards, Net Banking, UPI, and Wallets are supported.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded">
                    <FiCreditCard className="text-elite-purple" />
                    <span className="text-sm">Cards</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded">
                    <span className="text-lg">📱</span>
                    <span className="text-sm">UPI</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded">
                    <span className="text-lg">🏦</span>
                    <span className="text-sm">Net Banking</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded">
                    <span className="text-lg">�</span>
                    <span className="text-sm">Wallets</span>
                  </div>
                </div>
              </div>

              {/* Courses List */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Courses in Cart</h3>
                <div className="space-y-3">
                  {items.map((course) => {
                    const coursePrice = resolveCoursePrice(course);
                    const hasDiscount = typeof course.discountPrice === 'number' && course.discountPrice < course.price;

                    return (
                      <div key={course._id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <img
                        src={course.thumbnail || COURSE_PLACEHOLDER}
                        alt={course.title}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-1">{course.title}</h4>
                        <p className="text-xs text-gray-400">
                          By {typeof course.instructor === 'object' ? course.instructor?.name : course.instructor}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-elite-gold">₹{coursePrice}</div>
                        {hasDiscount && (
                          <div className="text-xs text-gray-500 line-through">₹{course.price}</div>
                        )}
                      </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isProcessing || (requiresPaymentGateway && !razorpayLoaded)}
                onClick={handlePayment}
                icon={isProcessing || !requiresPaymentGateway ? undefined : <FiCreditCard />}
              >
                {ctaLabel}
              </Button>

              {!requiresPaymentGateway && (
                <p className="text-center text-sm text-green-400 mt-3">
                  All courses in your cart are free right now. We&apos;ll enroll you instantly—no payment step required.
                </p>
              )}

              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiLock className="text-green-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Secure Payment:</strong> Your payment information is encrypted and secure. We never store your card details.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="default" className="p-6 sticky top-24 bg-gradient-to-br from-elite-purple/20 to-elite-gold/20">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((course) => {
                  const coursePrice = resolveCoursePrice(course);
                  return (
                    <div key={course._id} className="flex justify-between text-sm">
                      <span className="text-gray-300 flex-1 line-clamp-1">{course.title}</span>
                      <span className="text-white ml-2">
                        ₹{coursePrice}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>₹{originalTotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="gradient-text">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>All future updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
