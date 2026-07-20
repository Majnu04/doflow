import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Course } from '../types';
import { getCourse } from '../src/store/slices/coursesSlice';
import { addToCart, getCart } from '../src/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, getWishlist } from '../src/store/slices/wishlistSlice';
import { CourseDetailsSkeleton, ErrorState } from '../src/components/common/StateIndicators';
import type { RootState, AppDispatch } from '../src/store';
import { isDsaCourse } from '../src/utils/courseUtils';
import { ProgressBar } from '../src/components/ui';
import {
  FaPlay, FaCheck, FaClock, FaUsers, FaStar, FaHeart, FaRegHeart,
  FaLock, FaDownload, FaChevronDown, FaChevronUp,
  FaBookmark, FaBookOpen, FaGlobe, FaAward, FaMobile, FaBullseye, FaLayerGroup,
  FaGraduationCap, FaSuitcase, FaQuestionCircle, FaChevronRight,
  FaTrophy, FaLightbulb, FaChartLine, FaShieldAlt, FaLaptopCode,
  FaCertificate, FaRocket, FaClipboardList, FaCode
} from 'react-icons/fa';

interface CourseDetailsPageProps {
  courseId: string;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Beginner: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Beginner Friendly' },
  Intermediate: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Intermediate' },
  Advanced: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Advanced' },
};

const SAMPLE_REVIEWS = [
  { name: 'Priya S.', rating: 5, text: 'Best course I have taken. Clear explanations and practical projects. Landed a job after completing it!' },
  { name: 'Arjun K.', rating: 5, text: 'Incredibly well-structured. The AI mentor feature is a game-changer for doubt resolution.' },
  { name: 'Maya R.', rating: 4, text: 'Very comprehensive. Would recommend to anyone starting their coding journey.' },
];

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
  const [activeTab, setActiveTab] = useState<'overview' | 'instructor' | 'reviews'>('overview');
  const videoRef = useRef<HTMLVideoElement>(null);

  const course = currentCourse;
  const isDsa = course ? isDsaCourse(course) : false;
  const isInWishlist = wishlistItems.some((item: any) => item._id === courseId);
  const isEnrolled = enrollments.some((e: any) => e.courseId === courseId || e.course?._id === courseId);

  useEffect(() => {
    if (courseId) dispatch(getCourse(courseId));
    if (user) {
      dispatch(getWishlist());
      fetch('/api/payment/enrollments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => { setEnrollments(Array.isArray(data) ? data : []); setEnrollmentsLoading(false); })
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

  const toggleModule = (idx: number) => {
    const next = new Set(expandedModules);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setExpandedModules(next);
  };

  if (isLoading) return <CourseDetailsSkeleton />;
  if (error || !course) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <ErrorState message={error || "Course not found"} onRetry={() => dispatch(getCourse(courseId))} />
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
  const courseFAQs = (course as any).faqs || [
    { q: 'Do I need prior coding experience?', a: `This course is designed for ${course.level?.toLowerCase() || 'all'} level learners. ${course.requirements?.length ? 'Prerequisites are listed below.' : 'No prior experience is required.'}` },
    { q: 'How long do I have access?', a: 'You get lifetime access to all course materials. Learn at your own pace, revisit any lesson anytime.' },
    { q: 'Is there a certificate?', a: course.certificateEligible !== false ? 'Yes! Complete the course to earn a verified certificate of completion.' : 'This course does not currently offer a certificate.' },
    { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee. If you are not satisfied, contact support for a full refund.' },
  ];
  const relatedTags = course.tags || [];

  return (
    <div className="min-h-screen bg-light-bg font-['Inter',system-ui,sans-serif]">
      {/* ═══════════════════════════════════════════════════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-dusk via-[#1a1a2e] to-[#16213e] text-white pt-24 pb-14">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(224,100,56,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(243,164,92,0.1) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 dot-background opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <a href="/#/courses" className="hover:text-white transition-colors">Courses</a>
            <FaChevronRight className="w-3 h-3" />
            {course.category && <><span className="text-gray-500">{course.category}</span><FaChevronRight className="w-3 h-3" /></>}
            <span className="text-white font-medium truncate max-w-[200px]">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
            <div>
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded-full text-xs font-semibold text-brand-accent">
                    <FaAward className="w-3 h-3" /> Featured
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-semibold ${levelConfig.bg} ${levelConfig.color}`}>
                  <FaBullseye className="w-3 h-3" /> {levelConfig.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-gray-300">
                  <FaGlobe className="w-3 h-3" /> {course.language || 'English'}
                </span>
                {course.lastUpdated && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-gray-300">
                    Updated {new Date(course.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black leading-tight mb-4 tracking-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-base text-gray-300 leading-relaxed mb-6 max-w-2xl">
                {course.description}
              </p>

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-bold text-lg">{course.rating?.toFixed(1) || course.ratings?.average?.toFixed(1) || '4.8'}</span>
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <FaStar key={i} className="w-3.5 h-3.5 text-yellow-400" />)}</div>
                  <span className="text-gray-400 ml-1">({(course.reviewCount || course.ratings?.count || 1250).toLocaleString()} reviews)</span>
                </div>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1.5 text-gray-300"><FaUsers className="w-3.5 h-3.5" /> {(course.enrolledCount || course.enrollmentCount || 25840).toLocaleString()} students</span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1.5 text-gray-300"><FaClock className="w-3.5 h-3.5" /> {totalDurationHrs}h total</span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1.5 text-gray-300"><FaLayerGroup className="w-3.5 h-3.5" /> {course.sections?.length || 0} modules</span>
              </div>

              {/* Instructor preview */}
              <div className="flex items-center gap-3 mt-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {instructorAvatar ? <img src={instructorAvatar} alt="" className="w-full h-full object-cover" /> : (instructorName?.[0] || 'I')}
                </div>
                <span className="text-sm text-gray-400">Created by <span className="text-white font-semibold">{instructorName || 'Expert Instructor'}</span></span>
              </div>
            </div>

            {/* ═══ ENROLLMENT CARD (right side on lg) ═══ */}
            <div className="lg:sticky lg:top-24 z-10">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img src={course.thumbnail || (course as any).thumbnailUrl} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                  {((course as any).previewVideoUrl || (course as any).promoVideo) && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <FaPlay className="w-6 h-6 text-gray-900 ml-1" />
                      </div>
                      <span className="absolute bottom-4 left-4 text-xs text-white/80 font-medium bg-black/60 px-2.5 py-1 rounded-full">Preview this course</span>
                    </button>
                  )}
                </div>
                <div className="p-6">
                  {/* Price */}
                  {course.price === 0 ? (
                    <div className="text-3xl font-black text-emerald-600 mb-1">Free</div>
                  ) : (
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-black text-gray-900">₹{course.discountPrice || course.price}</span>
                      {course.discountPrice && course.discountPrice < course.price && (
                        <span className="text-lg text-gray-400 line-through">₹{course.price}</span>
                      )}
                    </div>
                  )}
                  {course.discountPrice && course.discountPrice < course.price && (
                    <p className="text-xs text-red-500 font-semibold mb-4">
                      {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off — limited time
                    </p>
                  )}

                  {/* CTA */}
                  <div className="space-y-3 mt-4">
                    {isEnrolled ? (
                      <>
                        <button onClick={() => window.location.hash = `/learn/${courseId}`}
                          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                          <FaPlay className="w-4 h-4" /> Continue Learning
                        </button>
                        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium">
                          <FaCheck className="w-3.5 h-3.5" /> You are enrolled
                        </div>
                      </>
                    ) : (
                      <>
                        <button onClick={handleAddToCart} disabled={isAddingToCart}
                          className="w-full py-3.5 px-6 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm">
                          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button onClick={handleWishlist}
                          className={`w-full py-3 px-6 border-2 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${isInWishlist ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                          {isInWishlist ? <><FaHeart className="w-4 h-4" /> In Wishlist</> : <><FaRegHeart className="w-4 h-4" /> Add to Wishlist</>}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Includes */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">This course includes:</h4>
                    <ul className="space-y-2.5 text-sm text-gray-600">
                      <li className="flex items-center gap-2.5"><FaLaptopCode className="w-4 h-4 text-gray-400" /> {totalDurationHrs} hours of content</li>
                      <li className="flex items-center gap-2.5"><FaClipboardList className="w-4 h-4 text-gray-400" /> {totalLessons} lessons</li>
                      <li className="flex items-center gap-2.5"><FaMobile className="w-4 h-4 text-gray-400" /> Mobile & desktop access</li>
                      <li className="flex items-center gap-2.5"><FaRocket className="w-4 h-4 text-gray-400" /> Lifetime access</li>
                      {course.certificateEligible !== false && <li className="flex items-center gap-2.5"><FaCertificate className="w-4 h-4 text-gray-400" /> Certificate of completion</li>}
                      <li className="flex items-center gap-2.5"><FaCode className="w-4 h-4 text-gray-400" /> AI-powered mentor</li>
                    </ul>
                  </div>

                  {/* 30-day guarantee */}
                  <div className="mt-5 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
                    <FaShieldAlt className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700 font-medium">30-day money-back guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ MAIN CONTENT ═══════════════ */}
      <section className="py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
            {/* ─── LEFT COLUMN ─── */}
            <div className="space-y-6">
              {/* Tab navigation */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {([['overview', 'Overview'], ['instructor', 'Instructor'], ['reviews', 'Reviews']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === 'overview' && (
                <>
                  {/* What You'll Learn */}
                  {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><FaGraduationCap className="w-5 h-5 text-brand-primary" /> What you'll learn</h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.whatYouWillLearn.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                              <FaCheck className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills You'll Gain */}
                  {relatedTags.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaLightbulb className="w-5 h-5 text-amber-500" /> Skills you'll gain</h2>
                      <div className="flex flex-wrap gap-2">
                        {relatedTags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-default">{tag}</span>
                        ))}
                        {course.category && <span className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-semibold">{course.category}</span>}
                      </div>
                    </div>
                  )}

                  {/* Course Content / Curriculum */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FaLayerGroup className="w-5 h-5 text-brand-primary" /> Course content</h2>
                        <p className="text-sm text-gray-500 mt-1">{course.sections?.length || 0} modules · {totalLessons} lessons · {totalDurationHrs}h total</p>
                      </div>
                      <button onClick={() => {
                        const allExpanded = course.sections?.every((_: any, i: number) => expandedModules.has(i));
                        if (allExpanded) setExpandedModules(new Set());
                        else setExpandedModules(new Set(course.sections?.map((_: any, i: number) => i) || []));
                      }} className="text-xs font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors">
                        {course.sections?.every((_: any, i: number) => expandedModules.has(i)) ? 'Collapse all' : 'Expand all'}
                      </button>
                    </div>

                    {!enrollmentsLoading && !isEnrolled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                        <FaLock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700"><span className="font-semibold">Preview mode</span> — Enroll to unlock all {totalLessons} lessons.</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {course.sections?.map((section: any, idx: number) => {
                        const isExpanded = expandedModules.has(idx);
                        const lessonCount = section.lessons?.length || 0;
                        const sectionDuration = section.lessons?.reduce((a: number, l: any) => a + (l.duration || 0), 0) || 0;

                        return (
                          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all">
                            <button onClick={() => toggleModule(idx)}
                              className="w-full px-5 py-3.5 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left group">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${isExpanded ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-brand-primary/20 group-hover:text-brand-primary'}`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{section.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{lessonCount} lessons · ~{Math.round(sectionDuration / 60 * 10) / 10 || sectionDuration}h</p>
                              </div>
                              {isEnrolled && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">Unlocked</span>}
                              <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="border-t border-gray-100">
                                {isEnrolled ? (
                                  <div className="divide-y divide-gray-50">
                                    {section.lessons?.map((lesson: any, li: number) => (
                                      <button key={li} className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group/lesson">
                                        <div className="flex items-center gap-3">
                                          <div className="w-7 h-7 bg-brand-primary/10 rounded-lg flex items-center justify-center group-hover/lesson:bg-brand-primary/20 transition-colors">
                                            <FaPlay className="w-2.5 h-2.5 text-brand-primary" />
                                          </div>
                                          <span className="text-sm text-gray-700 group-hover/lesson:text-brand-primary transition-colors">{lesson.title}</span>
                                          {lesson.isPreview && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-semibold">Preview</span>}
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{lesson.duration}m</span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-6 text-center bg-gray-50/50">
                                    <FaLock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">Enroll to view {lessonCount} lessons</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaClipboardList className="w-5 h-5 text-brand-primary" /> Prerequisites</h2>
                      <ul className="space-y-2.5">
                        {course.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                            <FaChevronRight className="w-3 h-3 text-brand-primary mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaBookOpen className="w-5 h-5 text-brand-primary" /> About this course</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{course.longDescription || course.description}</p>
                  </div>

                  {/* Career Opportunities */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaSuitcase className="w-5 h-5 text-brand-primary" /> Career opportunities</h2>
                    <p className="text-sm text-gray-600 mb-4">After completing this course, you will be prepared for roles such as:</p>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        'Frontend Developer', 'Full Stack Developer', 'Software Engineer',
                        'Web Application Developer', 'UI Engineer', 'Tech Lead'
                      ].slice(0, isDsa ? 6 : 4).map((role, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                          <FaCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm text-gray-700 font-medium">{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><FaQuestionCircle className="w-5 h-5 text-brand-primary" /> Frequently asked questions</h2>
                    <div className="space-y-2">
                      {courseFAQs.map((faq: any, idx: number) => (
                        <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                            <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                            <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                          </button>
                          {activeFaq === idx && (
                            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Testimonials */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><FaTrophy className="w-5 h-5 text-amber-500" /> What students say</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {SAMPLE_REVIEWS.map((review, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="w-3 h-3 text-yellow-400" />)}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">"{review.text}"</p>
                          <p className="text-xs font-semibold text-gray-900">{review.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ═══ INSTRUCTOR TAB ═══ */}
              {activeTab === 'instructor' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0 shadow-lg">
                      {instructorAvatar ? <img src={instructorAvatar} alt="" className="w-full h-full object-cover" /> : (instructorName?.[0] || 'I')}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{instructorName || 'Expert Instructor'}</h2>
                      <p className="text-sm text-gray-500 mt-1">{(course as any).category || 'Instructor'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> 4.8 rating</span>
                        <span className="flex items-center gap-1"><FaUsers /> {(course.enrolledCount || 25840).toLocaleString()} students</span>
                        <span className="flex items-center gap-1"><FaClipboardList /> 1 course</span>
                      </div>
                    </div>
                  </div>
                  <div className="prose prose-sm text-gray-600 max-w-none">
                    <p className="leading-relaxed">{instructorBio || 'An experienced instructor passionate about teaching modern development skills. With industry expertise and a talent for clear explanations, they help students build real-world skills.'}</p>
                  </div>
                </div>
              )}

              {/* ═══ REVIEWS TAB ═══ */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">{course.rating?.toFixed(1) || course.ratings?.average?.toFixed(1) || '4.8'}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">{[...Array(5)].map((_, i) => <FaStar key={i} className="w-4 h-4 text-yellow-400" />)}</div>
                      <p className="text-xs text-gray-500 mt-1">{(course.reviewCount || course.ratings?.count || 1250).toLocaleString()} ratings</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3">{star}</span>
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {SAMPLE_REVIEWS.map((review, idx) => (
                    <div key={idx} className="py-5 border-t border-gray-100 first:border-t-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center text-sm font-bold text-brand-primary">{review.name[0]}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                          <div className="flex gap-0.5">{[...Array(review.rating)].map((_, i) => <FaStar key={i} className="w-3 h-3 text-yellow-400" />)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column spacer for lg grid alignment */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsPage;
