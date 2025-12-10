import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getCart } from '../src/store/slices/cartSlice';
import { FiCreditCard, FiLock, FiCheck, FiArrowLeft, FiShield, FiAward, FiRefreshCw } from 'react-icons/fi';
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
      <div className="min-h-screen bg-white pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-lg p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some courses to checkout</p>
            <button
              onClick={() => window.location.hash = '/courses'}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.location.hash = '/cart'}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Cart</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Order Items ({items.length})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((course) => {
                  const coursePrice = resolveCoursePrice(course);
                  const hasDiscount = typeof course.discountPrice === 'number' && course.discountPrice < course.price;

                  return (
                    <div key={course._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={course.thumbnail || COURSE_PLACEHOLDER}
                        alt={course.title}
                        className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-gray-500">By {course.instructor?.name || 'Gowri Shankar'}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹{coursePrice}</div>
                        {hasDiscount && (
                          <div className="text-sm text-gray-400 line-through">₹{course.price}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiShield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Secured by <strong className="text-gray-900">Razorpay</strong></span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <FiCreditCard className="w-6 h-6 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Cards</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-2xl">📱</span>
                    <span className="text-sm font-medium text-gray-700">UPI</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-2xl">🏦</span>
                    <span className="text-sm font-medium text-gray-700">Net Banking</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-2xl">💳</span>
                    <span className="text-sm font-medium text-gray-700">Wallets</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Click the button below to proceed. You'll be redirected to Razorpay's secure payment gateway.
                </p>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <FiLock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800">
                  <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6">
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">₹{originalTotal}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600 font-medium">-₹{savings}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">₹0</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-500">₹{total}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || (requiresPaymentGateway && !razorpayLoaded)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4" />
                      {ctaLabel}
                    </>
                  )}
                </button>

                {!requiresPaymentGateway && (
                  <p className="text-center text-sm text-green-600 mt-3">
                    All courses are free! Click to enroll instantly.
                  </p>
                )}

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">All future updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiAward className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiRefreshCw className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
