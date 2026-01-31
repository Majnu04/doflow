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
import { 
  FaPlay, FaCheck, FaClock, FaUsers, FaStar, FaHeart, FaRegHeart, 
  FaShoppingCart, FaLock, FaDownload, FaChevronDown, FaChevronUp,
  FaBookmark, FaGlobe, FaAward, FaInfinity, FaMobile
} from 'react-icons/fa';

/**
 * PROFESSIONAL COURSE DETAILS PAGE
 * Coursera/Udemy Business-Quality Design
 * 
 * Design Principles:
 * - Clean, modern card-based layout
 * - Strong visual hierarchy with clear sections
 * - Sticky sidebar on desktop (purchase card)
 * - Mobile-responsive collapsible modules
 * - Professional typography (Inter font)
 * - Accessible color contrast (WCAG AA)
 * - Touch-friendly interactive elements
 */

interface CourseDetailsPageProps {
  courseId: string;
}

const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentCourse, isLoading, error } = useSelector((state: RootState) => state.courses);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const videoRef = useRef<HTMLVideoElement>(null);

  const course = currentCourse;
  const isDsa = course ? isDsaCourse(course) : false;
  const isInWishlist = wishlistItems.some((item: any) => item._id === courseId);
  const isEnrolled = enrollments.some((e: any) => e.courseId === courseId || e.course?._id === courseId);

  // Fetch course and enrollment data
  useEffect(() => {
    if (courseId) {
      dispatch(getCourse(courseId));
    }
    
    if (user) {
      dispatch(getWishlist());
      
      fetch('/api/payment/enrollments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setEnrollments(Array.isArray(data) ? data : []);
        setEnrollmentsLoading(false);
      })
      .catch(() => {
        setEnrollments([]);
        setEnrollmentsLoading(false);
      });
    } else {
      setEnrollmentsLoading(false);
    }
  }, [dispatch, courseId, user]);

  // Handlers
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      window.location.hash = '/auth';
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart(courseId)).unwrap();
      await dispatch(getCart());
      toast.success(`Added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist');
      window.location.hash = '/auth';
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(courseId)).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(courseId)).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Wishlist action failed');
    }
  };

  const toggleModule = (idx: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedModules(newExpanded);
  };

  const handleStartLearning = () => {
    window.location.hash = `/learn/${courseId}`;
  };

  // Loading state
  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <a href="/#/courses" className="text-orange-600 hover:text-orange-700 font-semibold">
            Browse all courses
          </a>
        </div>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((acc: number, s: any) => 
    acc + (s.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',system-ui,sans-serif]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
              <a href="/#/courses" className="hover:text-white transition-colors">Courses</a>
              <span>/</span>
              <span className="text-white font-medium">{course.title}</span>
            </div>

            {/* Course Badge */}
            {course.isFeatured && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
                <FaAward className="w-3 h-3 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Featured Course</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              {course.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold text-lg">
                  {course.rating?.toFixed(1) || '4.8'}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-400">
                  ({(course.reviewCount || 1250).toLocaleString()} reviews)
                </span>
              </div>

              {/* Divider */}
              <span className="text-gray-600">•</span>

              {/* Students */}
              <div className="flex items-center gap-2 text-gray-300">
                <FaUsers className="w-4 h-4" />
                <span>{(course.enrolledCount || 25840).toLocaleString()} students</span>
              </div>

              {/* Divider */}
              <span className="text-gray-600">•</span>

              {/* Instructor */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Created by</span>
                <span className="font-semibold text-white">
                  {course.instructor?.name || 'Expert Instructor'}
                </span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FaGlobe className="w-4 h-4" />
                <span>{course.language || 'English'}</span>
              </div>
              <span>•</span>
              <span>Last updated {new Date(course.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Column - Course Content */}
            <div className="lg:col-span-2 space-y-8 mb-8 lg:mb-0">
              {/* What You'll Learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content (Curriculum) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Course content</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.sections?.length || 0} modules • {totalLessons} lessons • {course.totalDuration || 0}h total
                    </p>
                  </div>
                  <button
                    onClick={() => {/* Download syllabus */}}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <FaDownload className="w-4 h-4" />
                    Download syllabus
                  </button>
                </div>

                {/* Preview Notice */}
                {!enrollmentsLoading && !isEnrolled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <FaLock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">Preview Mode</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Enroll to unlock all {totalLessons} lessons and course materials.
                      </p>
                    </div>
                  </div>
                )}

                {/* Modules List */}
                <div className="space-y-2">
                  {course.sections?.map((section: any, idx: number) => {
                    const isExpanded = expandedModules.has(idx);
                    const lessonCount = section.lessons?.length || 0;

                    return (
                      <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(idx)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                                Module {idx + 1}
                              </span>
                              {isEnrolled && (
                                <span className="text-xs text-green-600 font-semibold">
                                  Unlocked
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                              {section.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {lessonCount} lessons
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-3">
                            {isExpanded ? (
                              <FaChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <FaChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Lessons List */}
                        {isExpanded && (
                          <div className="border-t border-gray-200">
                            {isEnrolled ? (
                              <div className="divide-y divide-gray-100">
                                {section.lessons?.map((lesson: any, lessonIdx: number) => (
                                  <div key={lessonIdx} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FaPlay className="w-3 h-3 text-orange-600" />
                                      </div>
                                      <span className="text-sm text-gray-700">{lesson.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{lesson.duration}m</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-gray-50">
                                <FaLock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 font-medium">
                                  Enroll to view {lessonCount} lessons
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {course.longDescription || course.description}
                </p>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="text-gray-400 mt-1">•</span>
                        <span className="text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Sticky Purchase Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  {/* Course Thumbnail/Video */}
                  <div className="relative aspect-video bg-gray-900">
                    <img 
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800'} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.previewVideoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FaPlay className="w-6 h-6 text-gray-900 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      {course.price === 0 ? (
                        <div className="text-3xl font-bold text-green-600">Free</div>
                      ) : (
                        <div className="flex items-baseline gap-3">
                          <div className="text-3xl font-bold text-gray-900">
                            ${course.discountPrice || course.price}
                          </div>
                          {course.originalPrice && course.originalPrice > (course.discountPrice || course.price) && (
                            <div className="text-lg text-gray-400 line-through">
                              ${course.originalPrice}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      {isEnrolled ? (
                        <button
                          onClick={handleStartLearning}
                          className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          Continue Learning
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                          >
                            {isAddingToCart ? 'Adding...' : 'Add to cart'}
                          </button>
                          <button
                            onClick={handleWishlist}
                            className="w-full py-3 px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {isInWishlist ? (
                              <>
                                <FaHeart className="w-4 h-4 text-red-500" />
                                In Wishlist
                              </>
                            ) : (
                              <>
                                <FaRegHeart className="w-4 h-4" />
                                Add to Wishlist
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Course Includes */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4 text-sm">This course includes:</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-3 text-gray-700">
                          <FaClock className="w-4 h-4 text-gray-400" />
                          <span>{course.totalDuration || 0} hours on-demand video</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                          <FaBookmark className="w-4 h-4 text-gray-400" />
                          <span>{totalLessons} lessons</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                          <FaMobile className="w-4 h-4 text-gray-400" />
                          <span>Access on mobile and desktop</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                          <FaInfinity className="w-4 h-4 text-gray-400" />
                          <span>Lifetime access</span>
                        </li>
                        {course.certificateEligible && (
                          <li className="flex items-center gap-3 text-gray-700">
                            <FaAward className="w-4 h-4 text-gray-400" />
                            <span>Certificate of completion</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsPage;
