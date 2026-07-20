import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getCart } from '../src/store/slices/cartSlice';
import {
  FiCreditCard, FiLock, FiCheck, FiArrowLeft, FiShield, FiAward, FiRefreshCw,
  FiSmartphone, FiHome, FiChevronRight, FiShoppingCart, FiStar, FiClock,
  FiBookOpen, FiLayers, FiUsers, FiGlobe, FiBarChart2, FiCalendar,
  FiZap, FiGift, FiChevronDown, FiInfo, FiDollarSign, FiTrendingUp
} from 'react-icons/fi';
import api from '../src/utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const COURSE_PLACEHOLDER = '/images/course-placeholder.svg';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const payBtnRef = useRef<HTMLButtonElement>(null);

  const analyticsSessionId = React.useMemo(() => {
    const key = 'doflow_session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, newId);
    return newId;
  }, []);

  const resolveCoursePrice = (course: { discountPrice?: number | null; price: number }) => (
    course.discountPrice ?? course.price
  );

  const total = items.reduce((sum, item) => sum + resolveCoursePrice(item), 0);
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
  const savings = originalTotal - total;
  const finalTotal = Math.max(0, total - couponDiscount);
  const requiresPaymentGateway = items.some((item) => resolveCoursePrice(item) > 0);
  const ctaLabel = isProcessing
    ? 'Processing...'
    : requiresPaymentGateway
      ? (!razorpayLoaded ? 'Loading Payment...' : `Pay Securely \u20B9${finalTotal}`)
      : 'Complete Enrollment';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponState('loading');
    setTimeout(() => {
      if (couponCode.trim().toLowerCase() === 'save20') {
        const disc = Math.round(total * 0.2);
        setCouponDiscount(disc);
        setCouponState('success');
        toast.success(`Coupon applied! You saved \u20B9${disc}`);
      } else {
        setCouponError('Invalid coupon code');
        setCouponState('error');
        setTimeout(() => setCouponState('idle'), 2500);
      }
    }, 800);
  };

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
      for (const item of items) {
        api.post('/analytics/event', {
          eventType: 'checkout_start', courseId: item._id, sessionId: analyticsSessionId
        }).catch(() => undefined);

        const orderResponse = await api.post('/payment/create-order', { courseId: item._id });
        const { skipPayment, message, orderId, amount, currency, keyId, enrollmentId } = orderResponse.data;

        if (skipPayment) {
          successfulPayments++;
          toast.success(message || `Successfully enrolled in ${item.title}!`);
          api.post('/analytics/event', {
            eventType: 'purchase_completed', courseId: item._id,
            sessionId: analyticsSessionId, metadata: { amount: 0, currency: 'INR', mode: 'free' }
          }).catch(() => undefined);
          continue;
        }

        await new Promise((resolve, reject) => {
          const options = {
            key: keyId, amount, currency,
            name: 'DoFlow Learning',
            description: `Payment for ${item.title}`,
            order_id: orderId,
            handler: async (response: any) => {
              try {
                const verifyResponse = await api.post('/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  enrollmentId
                });
                if (verifyResponse.data.success) {
                  successfulPayments++;
                  toast.success(`Successfully enrolled in ${item.title}!`);
                  api.post('/analytics/event', {
                    eventType: 'purchase_completed', courseId: item._id,
                    sessionId: analyticsSessionId, metadata: { amount: amount / 100, currency }
                  }).catch(() => undefined);
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
            prefill: { name: user.name, email: user.email },
            theme: { color: '#E06438' },
            modal: { ondismiss: () => reject(new Error('Payment cancelled by user')) }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }
      if (successfulPayments > 0) {
        await dispatch(getCart());
        toast.success(`Successfully purchased ${successfulPayments} course(s)!`);
        setTimeout(() => { window.location.hash = '/dashboard'; }, 1500);
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
      <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
        <div className="max-w-lg mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center rounded-3xl border border-[var(--page-border)] bg-[var(--page-card)] p-12 shadow-sm"
          >
            <div className="w-20 h-20 rounded-2xl bg-[var(--page-accent-soft)] flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="w-9 h-9 text-[var(--page-accent)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--page-text)] mb-3">Your cart is empty</h2>
            <p className="text-[var(--page-text-muted)] mb-8">Looks like you haven't added any courses yet.</p>
            <button
              onClick={() => window.location.hash = '/courses'}
              className="px-8 py-3 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[var(--page-accent)]/20 inline-flex items-center gap-2"
            >
              Browse Courses
              <FiArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const course = items[0];
  const minutes = course.totalDuration || 0;
  const hours = Math.round(minutes / 60);
  const hasDiscount = typeof course.discountPrice === 'number' && course.discountPrice < course.price;
  const discountPercent = hasDiscount ? Math.round((1 - course.discountPrice / course.price) * 100) : 0;

  const paymentMethods = [
    { id: 'card', icon: FiCreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'upi', icon: FiSmartphone, label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', icon: FiGlobe, label: 'Net Banking', desc: 'All major banks' },
    { id: 'wallet', icon: FiDollarSign, label: 'Wallet', desc: 'Paytm, Mobikwik, Freecharge' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[var(--page-text-muted)] mb-6"
          aria-label="Breadcrumb"
        >
          <a href="/#/" className="hover:text-[var(--page-accent)] transition-colors" aria-label="Home">
            <FiHome className="w-4 h-4" />
          </a>
          <FiChevronRight className="w-3 h-3 text-[var(--page-text-muted)]/40" />
          <a href="/#/cart" className="hover:text-[var(--page-accent)] transition-colors">Cart</a>
          <FiChevronRight className="w-3 h-3 text-[var(--page-text-muted)]/40" />
          <span className="text-[var(--page-text)] font-semibold">Checkout</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-md">
              <FiLock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--page-text)] tracking-tight">Secure Checkout</h1>
              <p className="text-sm text-[var(--page-text-muted)] mt-0.5">Complete your enrollment securely</p>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 xl:gap-10">
          {/* ──────────── LEFT: Course Summary ──────────── */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="lg:col-span-3 space-y-5"
          >
            {/* Premium Course Card */}
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                    <img
                      src={course.thumbnail || COURSE_PLACEHOLDER}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1">
                        <FiZap className="w-3 h-3" />
                        {discountPercent}% OFF
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                      {course.ratings?.average > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                          <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-gray-900">{course.ratings.average}</span>
                          <span className="text-[10px] text-gray-500">({course.ratings?.count || 0})</span>
                        </div>
                      )}
                      {course.enrollmentCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                          <FiUsers className="w-3 h-3 text-[var(--page-accent)]" />
                          <span className="text-xs font-medium text-gray-700">{(course.enrollmentCount || 0).toLocaleString()} students</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--page-text)] leading-tight">{course.title}</h2>
                    {course.instructor?.name && (
                      <p className="text-sm text-[var(--page-text-muted)] mt-1">by <span className="font-medium text-[var(--page-text)]">{course.instructor.name}</span></p>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {course.level && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                          <FiBarChart2 className="w-4 h-4 text-[var(--page-accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Level</div>
                          <div className="text-sm font-medium text-[var(--page-text)] capitalize">{course.level}</div>
                        </div>
                      </div>
                    )}
                    {course.language && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                          <FiGlobe className="w-4 h-4 text-[var(--page-accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Language</div>
                          <div className="text-sm font-medium text-[var(--page-text)]">{course.language}</div>
                        </div>
                      </div>
                    )}
                    {hours > 0 && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                          <FiClock className="w-4 h-4 text-[var(--page-accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Duration</div>
                          <div className="text-sm font-medium text-[var(--page-text)]">{hours} hours</div>
                        </div>
                      </div>
                    )}
                    {course.sections?.length > 0 && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                          <FiLayers className="w-4 h-4 text-[var(--page-accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Modules</div>
                          <div className="text-sm font-medium text-[var(--page-text)]">{course.sections.length} modules</div>
                        </div>
                      </div>
                    )}
                    {course.totalLessons > 0 && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                          <FiBookOpen className="w-4 h-4 text-[var(--page-accent)]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Lessons</div>
                          <div className="text-sm font-medium text-[var(--page-text)]">{course.totalLessons} lessons</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                      <div className="w-8 h-8 rounded-lg bg-[var(--page-accent-soft)] flex items-center justify-center">
                        <FiAward className="w-4 h-4 text-[var(--page-accent)]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-[var(--page-text-muted)] uppercase tracking-wider">Access</div>
                        <div className="text-sm font-medium text-[var(--page-text)]">Lifetime</div>
                      </div>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/30">
                      <FiCheck className="w-3 h-3" /> Lifetime Access
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800/30">
                      <FiAward className="w-3 h-3" /> Certificate
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800/30">
                      <FiRefreshCw className="w-3 h-3" /> 30-Day Refund
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[var(--page-text)] mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedPayment === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-[var(--page-accent)] bg-[var(--page-accent-soft)] shadow-sm shadow-[var(--page-accent)]/10'
                            : 'border-[var(--page-border)] bg-[var(--page-section)] hover:border-[var(--page-border)]/60 hover:shadow-sm'
                        }`}
                        aria-label={method.label}
                        aria-pressed={isSelected}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--page-accent)] flex items-center justify-center">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[var(--page-accent)]' : 'text-[var(--page-text-muted)]'}`} />
                        <div className={`text-sm font-semibold ${isSelected ? 'text-[var(--page-text)]' : 'text-[var(--page-text-muted)]'}`}>
                          {method.label}
                        </div>
                        <div className="text-[10px] text-[var(--page-text-muted)] mt-0.5">{method.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 text-xs">
                  <FiShield className="w-4 h-4 flex-shrink-0" />
                  <span>Secured by <strong>Razorpay</strong> — your payment info is encrypted</span>
                </div>
              </div>
            </motion.div>

            {/* Coupon */}
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-5 sm:p-6 shadow-sm">
                <button
                  onClick={() => {
                    const el = document.getElementById('coupon-section');
                    if (el) el.classList.toggle('hidden');
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--page-text-muted)] hover:text-[var(--page-text)] transition-colors"
                  aria-expanded="false"
                  aria-controls="coupon-section"
                >
                  <FiGift className="w-4 h-4 text-[var(--page-accent)]" />
                  Have a coupon?
                  <FiChevronDown className="w-3.5 h-3.5 ml-auto transition-transform" />
                </button>
                <div id="coupon-section" className="hidden mt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="w-full px-4 py-2.5 bg-[var(--page-section)] border border-[var(--page-border)] rounded-xl text-sm text-[var(--page-text)] placeholder-[var(--page-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-accent)]/30 focus:border-[var(--page-accent)] transition-all"
                        aria-label="Coupon code"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponState === 'loading'}
                      className="px-5 py-2.5 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-semibold rounded-xl text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {couponState === 'loading' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : 'Apply'}
                    </button>
                  </div>
                  <AnimatePresence>
                    {couponState === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="mt-2 flex items-center gap-2 text-sm text-emerald-600"
                      >
                        <FiCheck className="w-4 h-4" />
                        Coupon applied! You saved <strong>\u20B9{couponDiscount}</strong>
                      </motion.div>
                    )}
                    {couponState === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-2 text-sm text-red-500"
                      >
                        {couponError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Trust Section */}
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--page-text)] mb-4 flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-[var(--page-accent)]" />
                  What's Included
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: FiAward, text: 'Certificate of Completion' },
                    { icon: FiLock, text: 'Lifetime Access' },
                    { icon: FiRefreshCw, text: '30-Day Money-Back Guarantee' },
                    { icon: FiShield, text: 'Secure Payments' },
                    { icon: FiSmartphone, text: 'Mobile + Desktop Access' },
                    { icon: FiTrendingUp, text: 'All Future Updates' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-[var(--page-text)]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ──────────── RIGHT: Order Summary ──────────── */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-2"
          >
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Order Summary Card */}
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)]/90 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-sm">
                      <FiShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--page-text)]">Order Summary</h2>
                      <p className="text-xs text-[var(--page-text-muted)]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--page-text-muted)]">Subtotal</span>
                      <span className="text-[var(--page-text)] font-medium">\u20B9{originalTotal.toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">Discount</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">-\u20B9{savings.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">Coupon ({couponCode.toUpperCase()})</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">-\u20B9{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--page-text-muted)]">Tax</span>
                      <span className="text-[var(--page-text)] font-medium">\u20B90</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--page-border)]" />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-[var(--page-text)]">Total</span>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-bold text-[var(--page-accent)]">\u20B9{finalTotal.toLocaleString()}</span>
                      {(savings > 0 || couponDiscount > 0) && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          You save \u20B9{(savings + couponDiscount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    ref={payBtnRef}
                    onClick={handlePayment}
                    disabled={isProcessing || (requiresPaymentGateway && !razorpayLoaded)}
                    className="relative w-full py-4 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-bold rounded-xl text-base hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--page-accent)]/20 hover:shadow-xl hover:shadow-[var(--page-accent)]/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 overflow-hidden group"
                    aria-label={ctaLabel}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      All courses are free — click to enroll instantly!
                    </p>
                  )}

                  {/* Payment Partners */}
                  <div className="flex items-center justify-center gap-4 text-[10px] text-[var(--page-text-muted)] pt-2">
                    <div className="flex items-center gap-1.5">
                      <FiLock className="w-3 h-3" />
                      SSL Secure
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiShield className="w-3 h-3" />
                      Powered by Razorpay
                    </div>
                  </div>
                </div>
              </div>

              {/* Money-Back Guarantee */}
              <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm flex-shrink-0">
                    <FiRefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">30-Day Money-Back Guarantee</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1 leading-relaxed">
                      Not satisfied? Get a full refund within 30 days of purchase. No questions asked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card */}
              <div className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-5 shadow-sm">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--page-text)] leading-relaxed italic">
                  "Excellent platform with in-depth courses. The instructors are knowledgeable and the content is well-structured."
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center text-white text-[10px] font-bold">
                    RK
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--page-text)]">Rahul K.</div>
                    <div className="text-[10px] text-[var(--page-text-muted)]">Verified Student</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
