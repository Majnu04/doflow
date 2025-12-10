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

// MOCK DATA - Fallback only, will use backend data
const mockCourse: Course = {
  id: '1',
  title: 'React: From Zero to Hero',
  instructor: 'John Doe',
  instructorBio: 'John is a senior software engineer at a FAANG company with over 10 years of experience in web development. He is passionate about teaching and has helped thousands of students master React.',
  instructorAvatar: 'https://picsum.photos/seed/instructor/100/100',
  description: 'Master the fundamentals of React 18 and build powerful, fast, and scalable web applications from scratch.',
  longDescription: 'This course is your complete guide to learning React. We will start from the very beginning, covering everything from JSX and components to state management with Redux and advanced patterns. By the end of this course, you will have built several real-world projects and be confident in your ability to build complex applications with React.',
  price: 49.99,
  originalPrice: 99.99,
  rating: 4.8,
  reviewCount: 1254,
  studentCount: 25834,
  thumbnailUrl: 'https://picsum.photos/seed/react/800/450',
  previewVideoUrl: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
  tags: ['React', 'Web Development', 'JavaScript'],
  whatYoullLearn: [
    'Build rich, interactive user interfaces with React.',
    'Understand components, props, and state.',
    'Manage application state with Redux Toolkit.',
    'Deploy React applications to production.',
    'Implement routing with React Router.'
  ],
  level: 'Beginner',
  totalDuration: 28.5,
  totalLessons: 184,
  modules: [
    { id: 'm1', title: 'Introduction to React', totalDuration: 120, lessons: [
      { id: 'l1', title: 'What is React?', duration: 15, videoUrl: '' },
      { id: 'l2', title: 'Setting up your development environment', duration: 25, videoUrl: '' },
      { id: 'l3', title: 'Creating your first React component', duration: 40, videoUrl: '' },
      { id: 'l4', title: 'Understanding JSX', duration: 40, videoUrl: '' },
    ]},
    { id: 'm2', title: 'Components, Props, and State', totalDuration: 240, lessons: [
      { id: 'l5', title: 'Functional vs. Class Components', duration: 30, videoUrl: '' },
      { id: 'l6', title: 'Handling Events', duration: 45, videoUrl: '' },
      { id: 'l7', title: 'Working with State and Lifecycle', duration: 90, videoUrl: '' },
      { id: 'l8', title: 'Conditional Rendering', duration: 75, videoUrl: '' },
    ]},
     { id: 'm3', title: 'State Management with Redux', totalDuration: 300, lessons: [
      { id: 'l9', title: 'Introduction to Redux', duration: 45, videoUrl: '' },
      { id: 'l10', title: 'Redux Toolkit (RTK)', duration: 90, videoUrl: '' },
      { id: 'l11', title: 'Connecting React and Redux', duration: 90, videoUrl: '' },
      { id: 'l12', title: 'Async Logic with Thunks', duration: 75, videoUrl: '' },
    ]},
  ],
  reviews: [
    { id: 'r1', user: { name: 'Alice', avatar: 'https://picsum.photos/seed/user1/40/40' }, rating: 5, comment: 'This is the best React course I have ever taken! The instructor is amazing.', createdAt: '2 weeks ago' },
    { id: 'r2', user: { name: 'Bob', avatar: 'https://picsum.photos/seed/user2/40/40' }, rating: 4, comment: 'Great content and very well explained. Some parts were a bit fast-paced.', createdAt: '1 month ago' },
    { id: 'r3', user: { name: 'Charlie', avatar: 'https://picsum.photos/seed/user3/40/40' }, rating: 5, comment: 'Absolutely fantastic! I landed a job after completing this course.', createdAt: '3 days ago' },
  ]
};

const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={`${className} text-brand-accent`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const LockedCurriculum: React.FC<{ modules: Course['modules']; isDsa: boolean }> = ({ modules, isDsa }) => (
    <div className="space-y-3">
        {modules.map((module, index) => (
            <div
                key={module.id || `module-${index}`}
                className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm"
            >
                <div className="flex justify-between items-center p-5 font-semibold text-light-text bg-light-cardAlt">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-light-textMuted" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                        </svg>
                        <span>{`${isDsa ? 'Section' : 'Module'} ${index + 1}: ${module.title}`}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-light-textMuted">
                        <span>{`${module.lessons?.length || 0} ${isDsa ? 'problems' : 'lessons'}`}</span>
                    </div>
                </div>
                <div className="border-t border-border-subtle bg-gradient-to-b from-white/50 to-light-bg p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-light-textMuted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <p className="text-light-textSecondary font-medium">{isDsa ? 'Problem details locked' : 'Lesson details locked'}</p>
                    <p className="text-sm text-light-textMuted mt-1">Purchase this course to unlock all {isDsa ? 'coding problems' : 'video lessons'}</p>
                </div>
            </div>
        ))}
    </div>
);

const UnlockedCurriculum: React.FC<{ modules: Course['modules'] }> = ({ modules }) => (
    <div className="space-y-3">
        {modules.map((module, index) => (
            <details
                key={module.id || `module-${index}`}
                className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden group shadow-sm"
                open={index === 0}
            >
                <summary className="flex justify-between items-center p-5 cursor-pointer hover:bg-brand-primary/5 font-semibold text-light-text">
                    <span>{`Module ${index + 1}: ${module.title}`}</span>
                    <div className="flex items-center space-x-4 text-sm text-light-textMuted">
                        <span>{`${module.lessons?.length || 0} lessons · ${Math.floor((module.totalDuration || 0) / 60)}h ${(module.totalDuration || 0) % 60}m`}</span>
                        <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </summary>
                <div className="border-t border-border-subtle">
                    <ul className="p-5 space-y-3">
                        {(module.lessons || []).map((lesson, lessonIndex) => (
                            <li key={lesson.id || `lesson-${index}-${lessonIndex}`} className="flex justify-between items-center text-light-text">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>{lesson.title}</span>
                                </div>
                                <span className="text-sm text-light-textMuted">{lesson.duration}m</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </details>
        ))}
    </div>
);


const CourseDetailsPage: React.FC<{ courseId: string }> = ({ courseId }) => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Redux state
    const { currentCourse, isLoading, error } = useSelector((state: RootState) => state.courses);
    const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Use backend data if available, fallback to mock
    const course = currentCourse || mockCourse;
    
    // Check if course is in wishlist
    const isInWishlist = wishlistItems.some((item: any) => item._id === courseId);

    // Helper functions to get dynamic data (handles both mock and backend formats)
    const getInstructorData = () => {
        const instructor = (course as any).instructor;
        if (typeof instructor === 'object' && instructor !== null) {
            return {
                name: instructor.name || 'Unknown Instructor',
                avatar: instructor.avatar || 'https://ui-avatars.com/api/?name=Instructor&size=96&background=random',
                bio: instructor.bio || 'Experienced instructor'
            };
        }
        return {
            name: instructor || 'Unknown Instructor',
            avatar: (course as any).instructorAvatar || 'https://ui-avatars.com/api/?name=Instructor&size=96&background=random',
            bio: (course as any).instructorBio || 'Experienced instructor'
        };
    };

    const getCourseMetadata = () => ({
        rating: (course as any).rating || (course as any).ratings?.average || 0,
        reviewCount: (course as any).reviewCount || (course as any).ratings?.count || 0,
        studentCount: (course as any).studentCount || (course as any).enrollmentCount || 0,
        thumbnail: (course as any).thumbnailUrl || (course as any).thumbnail || 'https://placehold.co/800x450/1a1a2e/ffffff?text=Course+Preview',
        promoVideo: (course as any).previewVideoUrl || (course as any).promoVideo,
        whatYouWillLearn: (course as any).whatYoullLearn || (course as any).whatYouWillLearn || [],
        sections: (course as any).modules || (course as any).sections || [],
        reviews: (course as any).reviews || [],
        description: (course as any).longDescription || course.description,
        displayPrice: (course as any).discountPrice || course.price,
        originalPrice: (course as any).discountPrice ? course.price : (course as any).originalPrice
    });

    const instructorData = getInstructorData();
    const metadata = getCourseMetadata();

    // Check if user is enrolled
    const { items: cartItems } = useSelector((state: RootState) => state.cart);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

    const isEnrolled = useMemo(() => {
        return enrollments.some((enrollment: any) => {
            const enrolledCourseId = enrollment.course?._id || enrollment.course;
            return enrolledCourseId === courseId && enrollment.paymentInfo?.status === 'completed';
        });
    }, [enrollments, courseId]);

    const isDsa = useMemo(() => isDsaCourse(course), [course]);

    // Generate syllabus content
    const generateSyllabusText = () => {
        let content = `${course.title}\n`;
        content += `${'='.repeat(course.title.length)}\n\n`;
        content += `Course Description:\n${metadata.description}\n\n`;
        content += `Level: ${course.level}\n`;
        content += `Duration: ${course.totalDuration} hours\n`;
        content += `Total ${isDsa ? 'Problems' : 'Lessons'}: ${course.totalLessons}\n\n`;
        
        if (metadata.whatYouWillLearn.length > 0) {
            content += `What You'll Learn:\n`;
            metadata.whatYouWillLearn.forEach((item: string, idx: number) => {
                content += `${idx + 1}. ${item}\n`;
            });
            content += `\n`;
        }

        content += `Course Curriculum:\n${'='.repeat(18)}\n\n`;
        metadata.sections.forEach((section: any, idx: number) => {
            content += `${isDsa ? 'Section' : 'Module'} ${idx + 1}: ${section.title}\n`;
            content += `${'-'.repeat(section.title.length + 10)}\n`;
            if (section.lessons && section.lessons.length > 0) {
                section.lessons.forEach((lesson: any, lessonIdx: number) => {
                    content += `  ${lessonIdx + 1}. ${lesson.title}\n`;
                });
            }
            content += `\n`;
        });

        content += `\nInstructor: ${instructorData.name}\n`;
        content += `${instructorData.bio}\n`;
        
        return content;
    };

    const handleDownloadSyllabus = () => {
        const syllabusText = generateSyllabusText();
        const blob = new Blob([syllabusText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${course.title.replace(/[^a-zA-Z0-9]/g, '-')}-Syllabus.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Syllabus downloaded!');
    };

    // Fetch course data on mount
    useEffect(() => {
        if (courseId) {
            dispatch(getCourse(courseId));
        }
        
        // Fetch wishlist and enrollments if user is logged in
        if (user) {
            dispatch(getWishlist());
            
            // Fetch user enrollments
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

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add to cart');
            window.location.hash = '/auth';
            return;
        }

        setIsAddingToCart(true);
        try {
            await dispatch(addToCart(courseId)).unwrap();
            // Fetch updated cart to update badge count
            await dispatch(getCart());
            toast.success(`"${course.title}" has been added to your cart!`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            toast.error('Please login to purchase this course');
            window.location.hash = '/auth';
            return;
        }

        setIsProcessingPayment(true);
        const promise = dispatch(addToCart(courseId)).unwrap()
            .then(() => dispatch(getCart()).unwrap())
            .then(() => {
                window.location.hash = '/cart';
                return 'Redirecting to cart...';
            });

        toast.promise(promise, {
            loading: 'Preparing your order...',
            success: (message) => message,
            error: (err) => err.message || 'Failed to process order',
        }).finally(() => {
            setIsProcessingPayment(false);
        });
    };

    const handleWishlistToggle = async () => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            window.location.hash = '/auth';
            return;
        }

        const action = isInWishlist
            ? dispatch(removeFromWishlist(courseId)).unwrap()
            : dispatch(addToWishlist(courseId)).unwrap();

        const promise = action.then(() => {
            dispatch(getWishlist()); // Refresh wishlist in the background
            return isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!';
        });

        toast.promise(promise, {
            loading: 'Updating wishlist...',
            success: (message) => message,
            error: (err) => err.message || 'Failed to update wishlist',
        });
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);
            video.addEventListener('ended', handlePause);

            return () => {
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
                video.removeEventListener('ended', handlePause);
            };
        }
    }, []);


    // Show loading state
    if (isLoading) {
        return <CourseDetailsSkeleton />;
    }

    // Show error state
    if (error && !currentCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ErrorState 
                    message={error || "We couldn't load the course details. Please try again."}
                    onRetry={() => dispatch(getCourse(courseId))}
                />
            </div>
        );
    }

    // If no course data available, show message
    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl">Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light-bg text-light-text">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-light-card to-light-bg pt-24 pb-12 border-b border-border-subtle/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-brand-primary tracking-[0.3em] uppercase">Course Overview</p>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-primary mt-2">{course.title}</h1>
                    <p className="mt-4 text-lg text-light-textSecondary max-w-3xl">{course.description}</p>
                    <div className="mt-6 flex items-center flex-wrap gap-4 text-light-text">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-border-subtle">
                            <span className="font-bold text-lg">{metadata.rating.toFixed(1)}</span>
                            <div className="flex items-center text-brand-primary">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                            </div>
                            <span className="text-sm text-light-textMuted">({metadata.reviewCount.toLocaleString()})</span>
                        </div>
                        <p className="text-light-textSecondary">{metadata.studentCount.toLocaleString()} students</p>
                        <p className="text-light-textSecondary">By <span className="font-semibold text-brand-primary">{instructorData.name}</span></p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-10">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-10">
                            {metadata.whatYouWillLearn.length > 0 && (
                                <div className="border border-border-subtle rounded-2xl p-6 bg-light-card shadow-sm">
                                    <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {metadata.whatYouWillLearn.map((item: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="w-6 h-6 mr-3 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                <span className="text-light-textSecondary">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {metadata.sections.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold">Course Curriculum</h2>
                                        <button
                                            onClick={handleDownloadSyllabus}
                                            className="flex items-center gap-2 px-4 py-2 bg-light-card border border-brand-primary/30 hover:bg-brand-primary/5 text-brand-primary rounded-lg transition text-sm font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Download Syllabus
                                        </button>
                                    </div>
                                    {!enrollmentsLoading && (
                                        isEnrolled ? (
                                            <UnlockedCurriculum modules={metadata.sections} />
                                        ) : (
                                            <>
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                                    </svg>
                                                    <div>
                                                        <p className="font-semibold text-amber-900">Preview Mode</p>
                                                        <p className="text-sm text-amber-700 mt-1">
                                                            {isDsa ? 'Problem names and details are hidden. ' : 'Video lessons and resources are hidden. '}
                                                            Purchase this course to unlock the full curriculum.
                                                        </p>
                                                    </div>
                                                </div>
                                                <LockedCurriculum modules={metadata.sections} isDsa={isDsa} />
                                            </>
                                        )
                                    )}
                                </div>
                            )}

                            <div className="border border-border-subtle rounded-2xl p-6 bg-light-card">
                                <h2 className="text-2xl font-bold mb-4">Description</h2>
                                <p className="text-light-textSecondary whitespace-pre-line leading-relaxed">{metadata.description}</p>
                            </div>

                            {metadata.reviews.length > 0 && (
                                <div className="border border-border-subtle rounded-2xl p-6 bg-light-card">
                                    <h2 className="text-2xl font-bold mb-4">Student feedback</h2>
                                    <div className="space-y-6">
                                        {metadata.reviews.map((review: any, idx: number) => {
                                            const reviewUser = typeof review.user === 'object' ? review.user : { name: 'Anonymous', avatar: '' };
                                            const userName = reviewUser.name || 'Anonymous';
                                            const userAvatar = reviewUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=40&background=random`;

                                            return (
                                                <div key={review.id || review._id || idx} className="border-b border-border-subtle/60 pb-4 last:border-b-0">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={userAvatar}
                                                            alt={userName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=40&background=random`;
                                                            }}
                                                        />
                                                        <div>
                                                            <h4 className="font-semibold">{userName}</h4>
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-brand-primary' : 'text-light-textMuted'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-light-textSecondary">{review.comment}</p>
                                                    <p className="text-sm text-light-textMuted">{review.createdAt}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column (Sticky Sidebar) */}
                        <div className="mt-10 lg:mt-0">
                            <div className="sticky top-24">
                                <div className="bg-light-card border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
                                    {metadata.promoVideo ? (
                                        <div className="relative group">
                                            <video
                                                ref={videoRef}
                                                onClick={togglePlayPause}
                                                onKeyPress={(e) => e.key === ' ' && togglePlayPause()}
                                                className="w-full aspect-video rounded-b-none"
                                                poster={metadata.thumbnail}
                                                playsInline
                                            >
                                                <source src={metadata.promoVideo} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            <div
                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                                onClick={togglePlayPause}
                                                role="button"
                                                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                            >
                                                <button className="bg-white text-brand-primary rounded-full p-4 shadow-lg transition-transform active:scale-95">
                                                    {isPlaying ? (
                                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5.75 3.5a.75.75 0 00-.75.75v12a.75.75 0 001.5 0V4.25a.75.75 0 00-.75-.75zm8.5 0a.75.75 0 00-.75.75v12a.75.75 0 001.5 0V4.25a.75.75 0 00-.75-.75z"></path></svg>
                                                    ) : (
                                                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img src={metadata.thumbnail} alt={course.title} className="w-full object-cover aspect-video" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <p className="text-white text-lg font-semibold">Video Preview Not Available</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-brand-primary">${metadata.displayPrice}</span>
                                            {metadata.originalPrice && (
                                                <span className="text-light-textMuted line-through">${metadata.originalPrice}</span>
                                            )}
                                        </div>
                                        <div className="mt-5 space-y-3">
                                            {/* Show different buttons based on enrollment status */}
                                            {!enrollmentsLoading && isEnrolled ? (
                                                <>
                                                    {/* Already Enrolled - Show Continue Learning */}
                                                    <button
                                                        onClick={() => {
                                                            window.location.hash = `/learn/${courseId}`;
                                                        }}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        Continue Learning
                                                    </button>
                                                    <div className="text-center text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                        </svg>
                                                        You're enrolled in this course
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Not Enrolled - Show Buy Now and Add to Cart */}
                                                    <button
                                                        onClick={handleBuyNow}
                                                        disabled={isProcessingPayment || isAddingToCart}
                                                        className="w-full bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold py-3 rounded-2xl transition disabled:bg-border-subtle disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isProcessingPayment ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Processing...
                                                            </>
                                                        ) : 'Buy Now'}
                                                    </button>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        disabled={isAddingToCart || isProcessingPayment}
                                                        className="w-full bg-light-cardAlt hover:bg-white text-brand-primary font-semibold py-3 rounded-2xl border border-brand-primary/40 transition disabled:bg-border-subtle disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isAddingToCart ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                                </svg>
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleWishlistToggle}
                                                        className={`w-full font-semibold py-3 rounded-2xl transition border ${
                                                            isInWishlist
                                                                ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                                                : 'border-border-subtle text-light-text hover:border-brand-primary'
                                                        }`}
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                                            </svg>
                                                            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <ul className="mt-6 text-sm text-light-textSecondary space-y-3">
                                            <li className="flex justify-between"><span>Duration</span> <strong className="text-light-text">{course.totalDuration} hours</strong></li>
                                            <li className="flex justify-between"><span>Lessons</span> <strong className="text-light-text">{course.totalLessons}</strong></li>
                                            <li className="flex justify-between"><span>Skill level</span> <strong className="text-light-text">{course.level}</strong></li>
                                            <li className="flex justify-between"><span>Access</span> <strong className="text-light-text">Lifetime</strong></li>
                                        </ul>
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
