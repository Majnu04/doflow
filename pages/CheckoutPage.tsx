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
              color: '#E06438'
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
      <div className="min-h-[calc(100vh-80px)] bg-light-bg px-4 pb-12 pt-24">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" hover={false} className="mx-auto max-w-3xl py-20 text-center">
            <h2 className="mb-4 text-3xl font-display font-bold text-light-text">Your cart is empty</h2>
            <p className="mb-8 text-light-textSecondary">Add some courses to checkout</p>
            <Button
              variant="primary"
              className="rounded-xl"
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
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-light-bg px-4 pb-12 pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-14 top-12 h-72 w-72 rounded-full bg-brand-primary/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.1] grid-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.hash = '/cart'}
            icon={<FiArrowLeft />}
            className="mb-4 rounded-xl"
          >
            Back to Cart
          </Button>
          <h1 className="mb-2 text-4xl font-display font-bold text-light-text">
            Checkout
          </h1>
          <p className="text-light-textSecondary">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Info */}
          <div className="lg:col-span-2">
            <Card variant="glass" hover={false} className="p-8 border border-white/70">
              <div className="flex items-center gap-2 mb-6">
                <FiLock className="text-brand-primary" />
                <span className="text-sm font-medium text-light-textSecondary">Secure Payment with Razorpay</span>
              </div>

              {/* Payment Info */}
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-display font-bold text-light-text">Payment Details</h3>
                <p className="mb-4 text-light-textSecondary leading-relaxed">
                  Complete your purchase securely with Razorpay. All payment methods including Credit/Debit Cards, Net Banking, UPI, and Wallets are supported.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-light-card px-3 py-2 text-light-text">
                    <FiCreditCard className="text-brand-primary" />
                    <span className="text-sm font-medium">Cards</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-light-card px-3 py-2 text-light-text">
                    <span className="text-lg">📱</span>
                    <span className="text-sm font-medium">UPI</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-light-card px-3 py-2 text-light-text">
                    <span className="text-lg">🏦</span>
                    <span className="text-sm font-medium">Net Banking</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-light-card px-3 py-2 text-light-text">
                    <span className="text-lg">👛</span>
                    <span className="text-sm font-medium">Wallets</span>
                  </div>
                </div>
              </div>

              {/* Courses List */}
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-display font-bold text-light-text">Courses in Cart</h3>
                <div className="space-y-3">
                  {items.map((course) => {
                    const coursePrice = resolveCoursePrice(course);
                    const hasDiscount = typeof course.discountPrice === 'number' && course.discountPrice < course.price;

                    return (
                      <div key={course._id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-light-cardAlt/70 p-3">
                      <img
                        src={course.thumbnail || COURSE_PLACEHOLDER}
                        alt={course.title}
                        className="h-14 w-20 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="line-clamp-1 text-sm font-semibold text-light-text">{course.title}</h4>
                        <p className="text-xs text-light-textMuted">
                          By {typeof course.instructor === 'object' ? course.instructor?.name : course.instructor}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-primary">₹{coursePrice}</div>
                        {hasDiscount && (
                          <div className="text-xs text-light-textMuted line-through">₹{course.price}</div>
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
                className="w-full rounded-xl"
                disabled={isProcessing || (requiresPaymentGateway && !razorpayLoaded)}
                onClick={handlePayment}
                icon={isProcessing || !requiresPaymentGateway ? undefined : <FiCreditCard />}
              >
                {ctaLabel}
              </Button>

              {!requiresPaymentGateway && (
                <p className="mt-3 text-center text-sm text-brand-primary">
                  All courses in your cart are free right now. We&apos;ll enroll you instantly—no payment step required.
                </p>
              )}

              <div className="mt-6 rounded-xl border border-brand-primary/20 bg-brand-accentSoft/45 p-4">
                <div className="flex items-start gap-3">
                  <FiLock className="mt-1 flex-shrink-0 text-brand-primary" />
                  <div className="text-sm text-light-textSecondary">
                    <strong className="text-light-text">Secure Payment:</strong> Your payment information is encrypted and secure. We never store your card details.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="glass" hover={false} className="sticky top-24 border border-white/70 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 p-6">
              <h3 className="mb-6 text-2xl font-display font-bold text-light-text">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((course) => {
                  const coursePrice = resolveCoursePrice(course);
                  return (
                    <div key={course._id} className="flex justify-between text-sm">
                      <span className="flex-1 line-clamp-1 text-light-textSecondary">{course.title}</span>
                      <span className="ml-2 font-medium text-light-text">
                        ₹{coursePrice}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-border-subtle pt-4">
                <div className="flex justify-between text-light-textSecondary">
                  <span>Subtotal:</span>
                  <span>₹{originalTotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-brand-primary">
                    <span>Discount:</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-light-textSecondary">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>

                <div className="border-t border-border-subtle pt-3">
                  <div className="flex justify-between text-xl font-bold text-light-text">
                    <span>Total:</span>
                    <span className="text-brand-primary">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                  <FiCheck className="text-brand-primary" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                  <FiCheck className="text-brand-primary" />
                  <span>All future updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                  <FiCheck className="text-brand-primary" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                  <FiCheck className="text-brand-primary" />
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
