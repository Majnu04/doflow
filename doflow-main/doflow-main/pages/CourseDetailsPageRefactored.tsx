import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getCourse } from '../src/store/slices/coursesSlice';
import { addToCart, getCart } from '../src/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, getWishlist } from '../src/store/slices/wishlistSlice';
import { CourseDetailsSkeleton, ErrorState } from '../src/components/common/StateIndicators';
import type { RootState, AppDispatch } from '../src/store';
import { isDsaCourse } from '../src/utils/courseUtils';
import api from '../src/utils/api';
import {
  fadeIn, slideUp, slideDown, slideInLeft, slideInRight,
  scaleIn, popIn, staggerContainer
} from '../src/styles/motion';
import {
  FaPlay, FaCheck, FaClock, FaUsers, FaStar, FaHeart, FaBookOpen,
  FaLock, FaChevronDown, FaChevronRight, FaGlobe, FaAward,
  FaMobileAlt, FaBullseye, FaLayerGroup, FaBriefcase, FaQuestionCircle,
  FaShieldAlt, FaDesktop, FaList, FaCode, FaBolt, FaShareAlt,
  FaShoppingCart, FaGraduationCap, FaFire, FaQuoteLeft, FaTag,
  FaCertificate, FaBook, FaLightbulb, FaUserTie, FaArrowRight,
  FaRegClock, FaCheckDouble, FaSearch, FaPlayCircle, FaFileAlt,
  FaClipboardList
} from 'react-icons/fa';
import { FiZap } from 'react-icons/fi';

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  Beginner: { color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-500/15', label: 'Beginner', icon: <FaGraduationCap className="w-3 h-3" /> },
  Intermediate: { color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-500/15', label: 'Intermediate', icon: <FaBolt className="w-3 h-3" /> },
  Advanced: { color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-500/15', label: 'Advanced', icon: <FaFire className="w-3 h-3" /> },
};

const SAMPLE_REVIEWS = [
  { name: 'Priya S.', rating: 5, text: 'Best course I have taken. Clear explanations and practical projects. Landed a job after completing it!', date: '2 months ago' },
  { name: 'Arjun K.', rating: 5, text: 'Incredibly well-structured. The AI mentor feature is a game-changer for doubt resolution.', date: '1 month ago' },
  { name: 'Maya R.', rating: 4, text: 'Very comprehensive. Would recommend to anyone starting their coding journey.', date: '3 weeks ago' },
  { name: 'Rahul V.', rating: 5, text: 'The hands-on projects made all the difference. I built a real portfolio along the way.', date: '2 weeks ago' },
];

const stagger = staggerContainer;
const fadeSlideUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const ModuleIcon: React.FC<{ icon?: string; className?: string }> = ({ icon, className = '' }) => {
  switch (icon) {
    case 'code': return <FaCode className={className} />;
    case 'book': return <FaBook className={className} />;
    case 'lightbulb': return <FaLightbulb className={className} />;
    case 'clipboard': return <FaClipboardList className={className} />;
    case 'file': return <FaFileAlt className={className} />;
    default: return <FaLayerGroup className={className} />;
  }
};

interface CourseDetailsPageProps {
  courseId: string;
}

const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCourse, isLoading, error } = useSelector((state: RootState) => state.courses);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [isShared, setIsShared] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const course = currentCourse;
  const isDsa = course ? isDsaCourse(course) : false;
  const isInWishlist = wishlistItems.some((item: any) => item._id === courseId);
  const isEnrolled = enrollments.some((e: any) => e.courseId === courseId || e.course?._id === courseId);

  useEffect(() => {
    if (courseId) dispatch(getCourse(courseId));
    if (user) {
      dispatch(getWishlist());
      api.get('/payment/enrollments')
        .then(res => { setEnrollments(Array.isArray(res.data) ? res.data : []); setEnrollmentsLoading(false); })
        .catch(() => { setEnrollments([]); setEnrollmentsLoading(false); });
    } else {
      setEnrollmentsLoading(false);
    }
  }, [dispatch, courseId, user]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); window.location.hash = '/auth'; return; }
    setIsAddingToCart(true);
    try { await dispatch(addToCart(courseId)).unwrap(); await dispatch(getCart()); toast.success('Added to cart!'); }
    catch (error: any) { toast.error(error.message || 'Failed to add to cart'); }
    finally { setIsAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to use wishlist'); window.location.hash = '/auth'; return; }
    try {
      if (isInWishlist) { await dispatch(removeFromWishlist(courseId)).unwrap(); toast.success('Removed from wishlist'); }
      else { await dispatch(addToWishlist(courseId)).unwrap(); toast.success('Added to wishlist'); }
    } catch (error: any) { toast.error(error.message || 'Wishlist action failed'); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: course?.title || 'Course', url }); return; } catch { }
    }
    await navigator.clipboard.writeText(url);
    setIsShared(true);
    toast.success('Link copied!');
    setTimeout(() => setIsShared(false), 2000);
  };

  const toggleModule = (idx: number) => {
    const next = new Set(expandedModules);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setExpandedModules(next);
  };

  if (isLoading) return <CourseDetailsSkeleton />;
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <ErrorState message={error || 'Course not found'} onRetry={() => dispatch(getCourse(courseId))} />
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0;
  const totalDurationMin = course.sections?.reduce((acc: number, s: any) =>
    acc + (s.lessons?.reduce((la: number, l: any) => la + (l.duration || 0), 0) || 0), 0) || 0;
  const totalDurationHrs = (totalDurationMin / 60).toFixed(1);
  const levelConfig = LEVEL_CONFIG[course.level || 'Beginner'] || LEVEL_CONFIG.Beginner;
  const instructorName = typeof course.instructor === 'object' ? (course.instructor as any)?.name : course.instructor;
  const instructorBio = typeof course.instructor === 'object' ? (course.instructor as any)?.bio : (course as any).instructorBio;
  const instructorAvatar = typeof course.instructor === 'object' ? (course.instructor as any)?.avatar : (course as any).instructorAvatar;
  const instructorRole = typeof course.instructor === 'object' ? (course.instructor as any)?.role || (course as any).category || 'Instructor' : 'Instructor';
  const courseFAQs = (course as any).faqs || [
    { q: 'Do I need prior coding experience?', a: `This course is designed for ${course.level?.toLowerCase() || 'all'} level learners. ${course.requirements?.length ? 'Prerequisites are listed below.' : 'No prior experience is required.'}` },
    { q: 'How long do I have access?', a: 'You get lifetime access to all course materials. Learn at your own pace, revisit any lesson anytime.' },
    { q: 'Is there a certificate?', a: course.certificateEligible !== false ? 'Yes! Complete the course to earn a verified certificate of completion.' : 'This course does not currently offer a certificate.' },
    { q: 'What if I need help?', a: 'You get access to an AI-powered mentor available 24/7 to answer your questions and help you debug code.' },
    { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee. If you are not satisfied, contact support for a full refund.' },
  ];
  const relatedTags = course.tags || [];
  const discountPercent = course.discountPrice && course.price > 0
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;
  const quizCount = course.sections?.reduce((acc: number, s: any) =>
    acc + (s.lessons?.filter((l: any) => {
      const t = l.title?.toLowerCase() || '';
      return t.includes('quiz') || t.includes('mcq');
    }).length || 0), 0) || 0;
  const codingCount = course.sections?.reduce((acc: number, s: any) =>
    acc + (s.lessons?.filter((l: any) => {
      const t = l.title?.toLowerCase() || '';
      return t.includes('coding') || t.includes('challenge');
    }).length || 0), 0) || 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      {/* ══════════════════════════════════════════════ HERO ════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pb-16">
        {/* DoFlow theme gradient background */}
        <div className="absolute inset-0" style={{ background: 'var(--page-bg)' }}>
          <div className="absolute inset-0" style={{ background: 'var(--page-gradient)' }} />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(224,100,56,0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(243,164,92,0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(224,100,56,0.15) 0%, transparent 40%)
              `,
            }}
          />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" style={{ color: 'var(--page-text-muted)' }}>
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 text-xs text-[var(--page-text-muted)] mb-6"
          >
            <a href="/#/courses" className="hover:text-[var(--page-text)] transition-colors">Courses</a>
            <FaChevronRight className="w-2.5 h-2.5 text-[var(--page-text-muted)]/40" />
            {course.category && <><span className="text-[var(--page-text-muted)]">{course.category}</span><FaChevronRight className="w-2.5 h-2.5 text-[var(--page-text-muted)]/40" /></>}
            <span className="text-[var(--page-text)] font-semibold truncate max-w-[200px]">{course.title}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-[1fr_440px] gap-8 lg:gap-12 items-start">
            {/* ─── Left: Hero Content ─── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Badges */}
              <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-2.5">
                {course.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--page-accent)]/15 border border-[var(--page-accent)]/30 rounded-full text-[11px] font-bold text-[var(--page-accent)]">
                    <FaAward className="w-3 h-3" /> Featured
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[11px] font-bold ${levelConfig.bg} ${levelConfig.color}`}>
                  {levelConfig.icon} {levelConfig.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--page-section)] border border-[var(--page-border)] rounded-full text-[11px] font-medium text-[var(--page-text-muted)]">
                  <FaGlobe className="w-3 h-3" /> {course.language || 'English'}
                </span>
                {course.certificateEligible !== false && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <FaCertificate className="w-3 h-3" /> Certificate
                  </span>
                )}
                {course.lastUpdated && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--page-section)] border border-[var(--page-border)] rounded-full text-[11px] font-medium text-[var(--page-text-muted)]">
                    Updated {new Date(course.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={slideUp}
                className="text-[clamp(1.75rem,4vw,3rem)] font-black leading-[1.12] tracking-tight text-[var(--page-text)]"
              >
                {course.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={slideUp}
                className="text-[clamp(0.875rem,1.2vw,1.05rem)] text-[var(--page-text-muted)] leading-relaxed max-w-2xl"
              >
                {course.description}
              </motion.p>

              {/* Stats */}
              <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-500 font-extrabold text-lg">{course.rating?.toFixed(1) || course.ratings?.average?.toFixed(1) || '4.8'}</span>
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <FaStar key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-500' : 'text-yellow-500/30'}`} />)}</div>
                  <span className="text-[var(--page-text-muted)] ml-1">({(course.reviewCount || course.ratings?.count || 1250).toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--page-text-muted)]">
                  <FaUsers className="w-3.5 h-3.5 text-[var(--page-text-muted)]" />
                  {(course.enrolledCount || course.enrollmentCount || 25840).toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5 text-[var(--page-text-muted)]">
                  <FaClock className="w-3.5 h-3.5 text-[var(--page-text-muted)]" />
                  {totalDurationHrs}h
                </div>
                <div className="flex items-center gap-1.5 text-[var(--page-text-muted)]">
                  <FaLayerGroup className="w-3.5 h-3.5 text-[var(--page-text-muted)]" />
                  {course.sections?.length || 0} modules
                </div>
                <div className="flex items-center gap-1.5 text-[var(--page-text-muted)]">
                  <FaList className="w-3.5 h-3.5 text-[var(--page-text-muted)]" />
                  {totalLessons} lessons
                </div>
              </motion.div>

              {/* Instructor mini-profile */}
              <motion.div variants={fadeIn} className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 ring-2 ring-[var(--page-border)]">
                  {instructorAvatar ? <img src={instructorAvatar} alt="" className="w-full h-full object-cover" /> : (instructorName?.[0] || 'I')}
                </div>
                <div>
                  <p className="text-sm text-[var(--page-text-muted)]">
                    Created by <span className="text-[var(--page-text)] font-semibold">{instructorName || 'Expert Instructor'}</span>
                  </p>
                  <p className="text-[11px] text-[var(--page-text-muted)]">{instructorRole}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ─── Right: Purchase Card (Desktop) ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="hidden lg:block lg:sticky lg:top-24 z-10"
            >
              <div className="bg-[var(--page-card)] rounded-2xl border border-[var(--page-border)] shadow-2xl overflow-hidden">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img src={course.thumbnail || (course as any).thumbnailUrl} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {((course as any).previewVideoUrl || (course as any).promoVideo) && (
                    <button className="absolute inset-0 flex items-center justify-center group cursor-pointer">
                      <div className="w-16 h-16 bg-white/95 hover:bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-xl">
                        <FaPlay className="w-6 h-6 text-gray-900 ml-1" />
                      </div>
                      <span className="absolute bottom-3 left-3 text-[11px] text-white/90 font-medium bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <FaPlayCircle className="w-3 h-3" /> Preview
                      </span>
                    </button>
                  )}
                  {/* Discount badge */}
                  {discountPercent > 0 && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <FaTag className="w-2.5 h-2.5" /> {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* Price */}
                  <div>
                    {course.price === 0 ? (
                      <div className="text-3xl font-black text-emerald-600">Free</div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="text-[clamp(1.5rem,3vw,2rem)] font-black text-[var(--page-text)]">
                          ₹{course.discountPrice || course.price}
                        </span>
                        {course.discountPrice && course.discountPrice < course.price && (
                          <span className="text-base text-[var(--page-text-muted)] line-through">₹{course.price}</span>
                        )}
                        {discountPercent > 0 && (
                          <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg">
                            Save {discountPercent}%
                          </span>
                        )}
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <p className="text-xs text-[var(--page-text-muted)] mt-1 flex items-center gap-1.5">
                        <FaRegClock className="w-3 h-3 text-[var(--page-accent)]" />
                        Limited time offer
                      </p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  {isEnrolled ? (
                    <button
                      onClick={() => window.location.hash = `/learn/${courseId}`}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                    >
                      <FaPlay className="w-3.5 h-3.5" /> Continue Learning
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--page-accent)]/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                      >
                        {isAddingToCart ? (
                          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</span>
                        ) : (
                          <><FaShoppingCart className="w-3.5 h-3.5" /> {course.price === 0 ? 'Enroll for Free' : 'Add to Cart'}</>
                        )}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleWishlist}
                          className={`flex-1 py-3 px-4 border-2 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${isInWishlist ? 'border-red-300 bg-red-50 dark:bg-red-500/10 text-red-600' : 'border-[var(--page-border)] hover:border-[var(--page-accent)]/30 text-[var(--page-text-muted)]'}`}
                        >
                          <FaHeart className={isInWishlist ? 'w-3.5 h-3.5 fill-current' : 'w-3.5 h-3.5'} />
                          {isInWishlist ? 'Saved' : 'Wishlist'}
                        </button>
                        <button
                          onClick={handleShare}
                          className="py-3 px-4 border-2 border-[var(--page-border)] hover:border-[var(--page-accent)]/30 rounded-xl transition-all text-[var(--page-text-muted)] hover:text-[var(--page-accent)] flex items-center justify-center"
                        >
                          <FaShareAlt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Includes */}
                  <div className="pt-4 border-t border-[var(--page-border)]">
                    <h4 className="text-xs font-bold text-[var(--page-text)] uppercase tracking-wider mb-3">This course includes:</h4>
                    <ul className="space-y-2.5">
                      {[
                        { icon: <FaDesktop className="w-3.5 h-3.5" />, text: `${totalDurationHrs} hours of content` },
                        { icon: <FaList className="w-3.5 h-3.5" />, text: `${totalLessons} lessons` },
                        { icon: <FaMobileAlt className="w-3.5 h-3.5" />, text: 'Mobile & desktop access' },
                        { icon: <FaBolt className="w-3.5 h-3.5" />, text: 'Lifetime access' },
                        ...(course.certificateEligible !== false ? [{ icon: <FaAward className="w-3.5 h-3.5" />, text: 'Certificate of completion' }] : []),
                        { icon: <FaCode className="w-3.5 h-3.5" />, text: 'AI-powered mentor 24/7' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-[var(--page-text-muted)]">
                          <span className="text-[var(--page-accent)]/70 w-4 flex justify-center">{item.icon}</span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Refund guarantee */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[var(--page-accent-soft)] to-[var(--page-accent-secondary)]/10 border border-[var(--page-accent)]/15 flex items-center gap-3">
                    <FaShieldAlt className="w-5 h-5 text-[var(--page-accent)] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--page-accent)]">30-Day Money-Back Guarantee</p>
                      <p className="text-[11px] text-[var(--page-text-muted)]">Full refund within 30 days. No questions asked.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ MOBILE PURCHASE CARD (below hero) ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="lg:hidden px-4 sm:px-6 -mt-2 mb-6 relative z-10"
      >
        <div className="bg-[var(--page-card)] rounded-2xl border border-[var(--page-border)] shadow-2xl overflow-hidden">
          {/* Video thumbnail */}
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
            <img src={course.thumbnail || (course as any).thumbnailUrl} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {((course as any).previewVideoUrl || (course as any).promoVideo) && (
              <button className="absolute inset-0 flex items-center justify-center group cursor-pointer">
                <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <FaPlay className="w-5 h-5 text-gray-900 ml-0.5" />
                </div>
              </button>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Price row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--page-text)]">
                  ₹{course.discountPrice || course.price}
                </span>
                {course.discountPrice && course.discountPrice < course.price && (
                  <span className="text-sm text-[var(--page-text-muted)] line-through">₹{course.price}</span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <button onClick={() => window.location.hash = `/learn/${courseId}`}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]">
                <FaPlay className="w-3.5 h-3.5" /> Continue Learning
              </button>
            ) : (
              <div className="space-y-2.5">
                <button onClick={handleAddToCart} disabled={isAddingToCart}
                  className="w-full py-3.5 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--page-accent)]/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  {isAddingToCart ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</span>
                  ) : (
                    <><FaShoppingCart className="w-3.5 h-3.5" /> {course.price === 0 ? 'Enroll for Free' : 'Add to Cart'}</>
                  )}
                </button>
                <div className="flex gap-2">
                  <button onClick={handleWishlist}
                    className={`flex-1 py-2.5 border-2 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isInWishlist ? 'border-red-300 bg-red-50 dark:bg-red-500/10 text-red-600' : 'border-[var(--page-border)] text-[var(--page-text-muted)]'}`}>
                    <FaHeart className="w-3.5 h-3.5" />
                    {isInWishlist ? 'Saved' : 'Wishlist'}
                  </button>
                  <button onClick={handleShare}
                    className="py-2.5 px-4 border-2 border-[var(--page-border)] rounded-xl text-[var(--page-text-muted)] flex items-center justify-center transition-all active:scale-[0.98]">
                    <FaShareAlt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Refund badge */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[var(--page-accent-soft)] to-[var(--page-accent-secondary)]/10 border border-[var(--page-accent)]/15 flex items-center gap-2.5">
              <FaShieldAlt className="w-4 h-4 text-[var(--page-accent)] flex-shrink-0" />
              <p className="text-xs text-[var(--page-text-muted)]"><span className="font-bold text-[var(--page-accent)]">30-day guarantee</span> — Full refund if not satisfied</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════ MAIN CONTENT ════════════════════════════════ */}
      <section className="pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_440px] lg:gap-12">
            {/* ─── LEFT COLUMN ─── */}
            <div className="space-y-8">
              {/* Tab Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 p-1 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] overflow-x-auto no-scrollbar"
              >
                {([
                  ['overview', 'Overview'],
                  ['curriculum', 'Curriculum'],
                  ['instructor', 'Instructor'],
                  ['reviews', 'Reviews'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-shrink-0 flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === key
                        ? 'bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white shadow-md'
                        : 'text-[var(--page-text-muted)] hover:text-[var(--page-text)] hover:bg-[var(--page-section)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>

              {/* ─── OVERVIEW TAB ─── */}
              {activeTab === 'overview' && (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {/* Learning Outcomes */}
                  {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                    <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-md">
                          <FaCheckDouble className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--page-text)]">Learning Outcomes</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.whatYouWillLearn.map((item: string, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--page-section)] transition-colors"
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mt-0.5">
                              <FaCheck className="w-2.5 h-2.5 text-emerald-600" />
                            </div>
                            <span className="text-[var(--page-text)] text-sm leading-relaxed">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Skills */}
                  {relatedTags.length > 0 && (
                    <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md">
                          <FiZap className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--page-text)]">Skills You'll Gain</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {relatedTags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3.5 py-1.5 bg-[var(--page-section)] text-[var(--page-text-muted)] rounded-xl text-xs font-medium border border-[var(--page-border)] hover:border-[var(--page-accent)]/30 hover:text-[var(--page-accent)] transition-all cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.category && (
                          <span className="px-3.5 py-1.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-xl text-xs font-semibold border border-[var(--page-accent)]/20">
                            {course.category}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* About this course */}
                  <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                        <FaBookOpen className="text-white text-sm" />
                      </div>
                      <h2 className="text-lg font-bold text-[var(--page-text)]">About This Course</h2>
                    </div>
                    <p className="text-[var(--page-text-muted)] leading-relaxed whitespace-pre-line text-sm">
                      {course.longDescription || course.description}
                    </p>
                  </motion.div>

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                          <FaList className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--page-text)]">Prerequisites</h2>
                      </div>
                      <ul className="space-y-3">
                        {course.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-[var(--page-text-muted)]">
                            <FaChevronRight className="w-2.5 h-2.5 text-[var(--page-accent)] mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Target Audience */}
                  {(course as any).targetAudience && (course as any).targetAudience.length > 0 && (
                    <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                          <FaBullseye className="text-white text-sm" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--page-text)]">Target Audience</h2>
                      </div>
                      <ul className="space-y-3">
                        {((course as any).targetAudience as string[] || [
                          'Aspiring developers looking to build a strong foundation',
                          'Students preparing for technical interviews',
                          'Professionals wanting to upskill or transition into tech',
                        ]).map((audience: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-[var(--page-text-muted)]">
                            <FaCheck className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{audience}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Career Opportunities */}
                  <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                        <FaBriefcase className="text-white text-sm" />
                      </div>
                      <h2 className="text-lg font-bold text-[var(--page-text)]">Career Opportunities</h2>
                    </div>
                    <p className="text-sm text-[var(--page-text-muted)] mb-4">After completing this course, you'll be prepared for roles such as:</p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        'Frontend Developer', 'Full Stack Developer', 'Software Engineer',
                        'Web Application Developer', 'UI Engineer', 'Tech Lead'
                      ].slice(0, isDsa ? 6 : 4).map((role, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                          <FaCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-[var(--page-text)] font-medium">{role}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ─── CURRICULUM TAB ─── */}
              {activeTab === 'curriculum' && (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Curriculum header */}
                  <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-md">
                            <FaBook className="text-white text-sm" />
                          </div>
                          <h2 className="text-lg font-bold text-[var(--page-text)]">Course Curriculum</h2>
                        </div>
                        <p className="text-sm text-[var(--page-text-muted)] mt-1 ml-12">
                          {course.sections?.length || 0} modules &middot; {totalLessons} lessons &middot; {totalDurationHrs}h total
                          {quizCount > 0 && ` &middot; ${quizCount} quizzes`}
                          {codingCount > 0 && ` &middot; ${codingCount} coding challenges`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const allExpanded = course.sections?.every((_: any, i: number) => expandedModules.has(i));
                          if (allExpanded) setExpandedModules(new Set());
                          else setExpandedModules(new Set(course.sections?.map((_: any, i: number) => i) || []));
                        }}
                        className="text-xs font-semibold text-[var(--page-accent)] hover:text-[var(--page-accent)]/80 transition-colors flex-shrink-0"
                      >
                        {course.sections?.every((_: any, i: number) => expandedModules.has(i)) ? 'Collapse all' : 'Expand all'}
                      </button>
                    </div>

                    {/* Enrollment lock */}
                    {!enrollmentsLoading && !isEnrolled && (
                      <div className="bg-gradient-to-r from-[var(--page-accent-soft)] to-[var(--page-accent-secondary)]/10 border border-[var(--page-accent)]/20 rounded-xl p-4 mb-5 flex items-start gap-3">
                        <FaLock className="w-4 h-4 text-[var(--page-accent)] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[var(--page-accent)]"><span className="font-bold">Preview mode</span> &mdash; Enroll to unlock all {totalLessons} lessons and full curriculum.</p>
                      </div>
                    )}

                    {/* Modules */}
                    <div className="space-y-3">
                      {course.sections?.map((section: any, idx: number) => {
                        const isExpanded = expandedModules.has(idx);
                        const lessonCount = section.lessons?.length || 0;
                        const sectionDuration = section.lessons?.reduce((a: number, l: any) => a + (l.duration || 0), 0) || 0;
                        const previewCount = section.lessons?.filter((l: any) => l.isPreview).length || 0;
                        const hasQuiz = section.lessons?.some((l: any) => {
                          const t = l.title?.toLowerCase() || ''; return t.includes('quiz') || t.includes('mcq');
                        });
                        const hasAssignment = section.lessons?.some((l: any) => {
                          const t = l.title?.toLowerCase() || ''; return t.includes('coding') || t.includes('challenge') || t.includes('project');
                        });

                        return (
                          <motion.div
                            key={idx}
                            variants={slideUp}
                            className="border border-[var(--page-border)] rounded-xl overflow-hidden transition-all hover:border-[var(--page-accent)]/20"
                          >
                            <button
                              onClick={() => toggleModule(idx)}
                              className="w-full px-5 py-4 flex items-center gap-4 bg-[var(--page-section)]/30 hover:bg-[var(--page-section)]/60 transition-colors text-left group"
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200 ${
                                isExpanded
                                  ? 'bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white shadow-md'
                                  : 'bg-[var(--page-border)] text-[var(--page-text-muted)] group-hover:bg-[var(--page-accent)]/15 group-hover:text-[var(--page-accent)]'
                              }`}>
                                <ModuleIcon icon={section.icon} className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-[var(--page-text)] truncate">{section.title}</h3>
                                <div className="flex items-center gap-2.5 mt-1">
                                  <span className="text-[11px] text-[var(--page-text-muted)]">{lessonCount} lessons</span>
                                  <span className="text-[11px] text-[var(--page-text-muted)]">&middot;</span>
                                  <span className="text-[11px] text-[var(--page-text-muted)]">~{Math.round(sectionDuration / 60 * 10) / 10 || sectionDuration}h</span>
                                  {previewCount > 0 && (
                                    <>
                                      <span className="text-[11px] text-[var(--page-text-muted)]">&middot;</span>
                                      <span className="text-[11px] text-[var(--page-accent)] font-medium">{previewCount} preview</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {/* Badges */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {hasQuiz && (
                                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/15 text-purple-600 text-[9px] font-bold rounded-full">Quiz</span>
                                )}
                                {hasAssignment && (
                                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/15 text-amber-600 text-[9px] font-bold rounded-full">Assignment</span>
                                )}
                                {isEnrolled && (
                                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">Unlocked</span>
                                )}
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <FaChevronDown className="w-3.5 h-3.5 text-[var(--page-text-muted)] flex-shrink-0" />
                              </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-[var(--page-border)]">
                                    {isEnrolled ? (
                                      <div className="divide-y divide-[var(--page-border)]/50">
                                        {section.lessons?.map((lesson: any, li: number) => (
                                          <button
                                            key={li}
                                            className="w-full px-5 py-3 flex items-center justify-between hover:bg-[var(--page-section)] transition-colors text-left group/lesson"
                                          >
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                                lesson.isPreview
                                                  ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-600'
                                                  : 'bg-[var(--page-section)] text-[var(--page-text-muted)] group-hover/lesson:bg-[var(--page-accent)]/10 group-hover/lesson:text-[var(--page-accent)]'
                                              }`}>
                                                {lesson.isPreview ? <FaPlay className="w-2.5 h-2.5" /> : <FaBook className="w-2.5 h-2.5" />}
                                              </div>
                                              <span className="text-sm text-[var(--page-text-muted)] group-hover/lesson:text-[var(--page-text)] transition-colors truncate">{lesson.title}</span>
                                              {lesson.isPreview && (
                                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/15 text-blue-600 rounded font-bold flex-shrink-0">FREE</span>
                                              )}
                                            </div>
                                            <span className="text-[11px] text-[var(--page-text-muted)] flex-shrink-0 ml-3">
                                              {lesson.duration ? `${lesson.duration}m` : '--'}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-8 text-center bg-[var(--page-section)]/30">
                                        <FaLock className="w-8 h-8 text-[var(--page-text-muted)]/40 mx-auto mb-2" />
                                        <p className="text-sm text-[var(--page-text-muted)]">Enroll to view {lessonCount} lessons in this module</p>
                                        {previewCount > 0 && (
                                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                                            {section.lessons?.filter((l: any) => l.isPreview).map((lesson: any, li: number) => (
                                              <button
                                                key={li}
                                                className="px-3 py-1.5 bg-[var(--page-card)] border border-[var(--page-border)] rounded-xl text-xs text-[var(--page-text-muted)] hover:text-[var(--page-accent)] hover:border-[var(--page-accent)]/30 transition-all flex items-center gap-1.5"
                                              >
                                                <FaPlay className="w-2.5 h-2.5 text-blue-500" />
                                                {lesson.title}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Curriculum CTA */}
                    {!isEnrolled && (
                      <div className="mt-6 text-center p-6 rounded-2xl bg-gradient-to-r from-[var(--page-accent-soft)] to-[var(--page-accent-secondary)]/10 border border-[var(--page-accent)]/15">
                        <p className="text-sm text-[var(--page-text-muted)] mb-3">
                          Ready to start learning? Get full access to all {totalLessons} lessons.
                        </p>
                        <button
                          onClick={handleAddToCart}
                          className="px-8 py-3 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--page-accent)]/20 hover:brightness-110 transition-all text-sm"
                        >
                          {course.price === 0 ? 'Enroll for Free' : 'Enroll Now — ₹{course.discountPrice || course.price}'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* ─── INSTRUCTOR TAB ─── */}
              {activeTab === 'instructor' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0 shadow-lg ring-4 ring-[var(--page-accent)]/10">
                      {instructorAvatar ? <img src={instructorAvatar} alt="" className="w-full h-full object-cover" /> : (instructorName?.[0] || 'I')}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[var(--page-text)]">{instructorName || 'Expert Instructor'}</h2>
                      <p className="text-sm text-[var(--page-text-muted)] mt-0.5">{instructorRole}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[var(--page-text-muted)]">
                        <span className="flex items-center gap-1.5">
                          <FaStar className="text-amber-400" /> 4.8 instructor rating
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaUsers /> {(course.enrolledCount || 25840).toLocaleString()} students
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaBook /> 1 course
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[var(--page-text-muted)] leading-relaxed text-sm">
                    <p>{instructorBio || 'An experienced instructor passionate about teaching modern development skills. With years of industry expertise and a talent for clear explanations, they help students build real-world skills and advance their careers.'}</p>
                  </div>
                </motion.div>
              )}

              {/* ─── REVIEWS TAB ─── */}
              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm"
                >
                  {/* Rating summary */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-6 border-b border-[var(--page-border)]">
                    <div className="text-center flex-shrink-0">
                      <div className="text-5xl font-black text-[var(--page-text)]">{course.rating?.toFixed(1) || course.ratings?.average?.toFixed(1) || '4.8'}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[...Array(5)].map((_, i) => <FaStar key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400' : 'text-amber-400/30'}`} />)}
                      </div>
                      <p className="text-xs text-[var(--page-text-muted)] mt-1">{(course.reviewCount || course.ratings?.count || 1250).toLocaleString()} ratings</p>
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-[var(--page-text-muted)] w-3 text-right">{star}</span>
                            <FaStar className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <div className="flex-1 h-2.5 bg-[var(--page-section)] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                              />
                            </div>
                            <span className="text-xs text-[var(--page-text-muted)] w-8 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="space-y-6">
                    {SAMPLE_REVIEWS.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="pb-6 border-b border-[var(--page-border)] last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--page-accent)]/20 to-[var(--page-accent-secondary)]/20 flex items-center justify-center text-sm font-bold text-[var(--page-accent)] flex-shrink-0">
                            {review.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-[var(--page-text)]">{review.name}</p>
                              <span className="text-[11px] text-[var(--page-text-muted)]">{review.date}</span>
                            </div>
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="w-3 h-3 text-amber-400" />)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--page-text-muted)] leading-relaxed pl-12">
                          <FaQuoteLeft className="w-3 h-3 text-[var(--page-text-muted)]/30 inline mr-1" />
                          {review.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ─── RIGHT COLUMN SPACER ─── */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ FAQ SECTION (full width) ════════════════════════ */}
      <section className="pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                <FaQuestionCircle className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-bold text-[var(--page-text)]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-2">
              {courseFAQs.map((faq: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-[var(--page-border)] rounded-xl overflow-hidden hover:border-[var(--page-accent)]/20 transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[var(--page-section)] transition-colors"
                  >
                    <span className="text-sm font-semibold text-[var(--page-text)] pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="w-3.5 h-3.5 text-[var(--page-text-muted)] flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 text-sm text-[var(--page-text-muted)] leading-relaxed border-t border-[var(--page-border)] pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════ RELATED COURSES (future) ═══════════════════════ */}
      {(course as any).relatedCourses && (course as any).relatedCourses.length > 0 && (
        <section className="pb-16 lg:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2.5 mb-6"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                <FaBook className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-bold text-[var(--page-text)]">Related Courses</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {((course as any).relatedCourses as any[] || []).map((rc: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={`/#/course/${rc._id || rc.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="block p-5 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] hover:border-[var(--page-accent)]/20 hover:shadow-md transition-all group"
                >
                  <h3 className="text-sm font-bold text-[var(--page-text)] group-hover:text-[var(--page-accent)] transition-colors">{rc.title}</h3>
                  <p className="text-xs text-[var(--page-text-muted)] mt-1 line-clamp-2">{rc.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--page-text-muted)]">
                    <span className="flex items-center gap-1"><FaStar className="text-amber-400" /> {rc.rating || '4.5'}</span>
                    <span className="flex items-center gap-1"><FaClock /> {rc.duration || '12h'}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════ STICKY MOBILE BOTTOM BAR ═══════════════════════ */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--page-card)]/90 backdrop-blur-xl border-t border-[var(--page-border)] p-3 safe-area-bottom shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-lg font-black text-[var(--page-text)]">₹{course.discountPrice || course.price}</span>
              {course.discountPrice && course.discountPrice < course.price && (
                <span className="text-xs text-[var(--page-text-muted)] line-through ml-1">₹{course.price}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 py-3 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-bold rounded-xl shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isAddingToCart ? 'Adding...' : course.price === 0 ? 'Enroll Free' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
