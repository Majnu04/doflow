
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { paymentService } from '../src/services/paymentService';
import { courseService } from '../src/services/courseService';
import toast from '../src/utils/toast';
import { Course } from '../types';

// MOCK DATA - In a real app, you would fetch this based on the courseId prop
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

const CourseCurriculum: React.FC<{ modules: Course['modules'] }> = ({ modules }) => (
    <div className="space-y-2">
        {modules.map((module, index) => (
            <details key={module.id} className="bg-brand-dark/30 rounded-lg overflow-hidden group" open={index === 0}>
                <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-brand-dark/50 font-semibold">
                    <span>{`Module ${index + 1}: ${module.title}`}</span>
                    <div className="flex items-center space-x-4">
                       <span className="text-sm text-gray-400">{`${module.lessons.length} lessons · ${Math.floor(module.totalDuration / 60)}h ${module.totalDuration % 60}m`}</span>
                        <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </summary>
                <div className="border-t border-gray-800">
                    <ul className="p-4 space-y-3">
                        {module.lessons.map(lesson => (
                            <li key={lesson.id} className="flex justify-between items-center text-gray-300">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>{lesson.title}</span>
                                </div>
                                <span className="text-sm text-gray-400">{lesson.duration}m</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </details>
        ))}
    </div>
);


const CourseDetailsPage: React.FC<{ courseId: string }> = ({ courseId }) => {
    // State
    const [course, setCourse] = useState<Course>(mockCourse);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Fetch course data and enrollment status
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch real course data from API
                const courseData = await courseService.getCourseById(courseId);
                setCourse(courseData);

                // Check enrollment status if authenticated
                if (isAuthenticated) {
                    const enrollmentData = await courseService.checkEnrollment(courseId);
                    setIsEnrolled(enrollmentData.isEnrolled);
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
                toast.error('Failed to load course details');
                // Fall back to mock data if API fails
            }
        };

        fetchCourseData();
    }, [courseId, isAuthenticated]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuyNow = async () => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            window.location.hash = '/auth';
            return;
        }

        setIsProcessingPayment(true);

        try {
            const coursePrice = course.discountPrice || course.price;

            // Handle free course enrollment
            if (coursePrice === 0) {
                await paymentService.enrollInFreeCourse(courseId);
                toast.success('Successfully enrolled in the course!');
                setIsEnrolled(true);
                window.location.hash = '/dashboard';
                setIsProcessingPayment(false);
                return;
            }

            // Handle paid course enrollment with Razorpay
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway. Please try again.');
                setIsProcessingPayment(false);
                return;
            }

            // Create order
            const orderData = await paymentService.createOrder(courseId);

            // Configure Razorpay options
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'DoFlow Academy',
                description: course.title,
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            enrollmentId: orderData.enrollmentId
                        });

                        toast.success('Payment successful! You are now enrolled in the course.');
                        setIsEnrolled(true);
                        window.location.hash = '/dashboard';
                    } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Payment verification failed');
                    } finally {
                        setIsProcessingPayment(false);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#7C3AED' // brand-primary color
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessingPayment(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Enrollment error:', error);
            toast.error(error.response?.data?.message || 'Failed to enroll. Please try again.');
            setIsProcessingPayment(false);
        }
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


    return (
        <div className="text-white">
            {/* Hero Section */}
            <section className="bg-brand-dark/80 pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-black text-brand-primary">{course.title}</h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl">{course.description}</p>
                    <div className="mt-4 flex items-center space-x-4 flex-wrap">
                        <div className="flex items-center">
                            <span className="font-bold text-lg mr-2">{course.rating}</span>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                            </div>
                        </div>
                        <p className="text-gray-400">({course.reviewCount.toLocaleString()} ratings)</p>
                        <p className="text-gray-400">{course.studentCount.toLocaleString()} students</p>
                    </div>
                    <p className="mt-2 text-gray-400">Created by <span className="text-brand-accent">{course.instructor}</span></p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                             {/* What you'll learn */}
                            <div className="border border-gray-700 rounded-lg p-6 bg-brand-dark/20">
                                <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.whatYoullLearn.map((item, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg className="w-6 h-6 mr-3 text-brand-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Course Curriculum */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
                                <CourseCurriculum modules={course.modules} />
                            </div>

                            {/* Description */}
                             <div>
                                <h2 className="text-2xl font-bold mb-4">Description</h2>
                                <p className="text-gray-300 whitespace-pre-line">{course.longDescription}</p>
                            </div>

                            {/* Instructor */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Instructor</h2>
                                <div className="flex items-start space-x-4">
                                    <img src={course.instructorAvatar} alt={course.instructor} className="w-24 h-24 rounded-full"/>
                                    <div>
                                        <h3 className="text-xl font-bold text-brand-accent">{course.instructor}</h3>
                                        <p className="text-gray-400 mt-2">{course.instructorBio}</p>
                                    </div>
                                </div>
                            </div>
                            
                             {/* Reviews */}
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Student feedback</h2>
                                <div className="space-y-6">
                                    {course.reviews.map(review => (
                                        <div key={review.id} className="border-b border-gray-700 pb-4">
                                            <div className="flex items-center space-x-3">
                                                <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full"/>
                                                <div>
                                                    <h4 className="font-bold">{review.user.name}</h4>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-brand-accent' : 'text-gray-600'}`}/>)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-gray-300">{review.comment}</p>
                                            <p className="text-sm text-gray-500 mt-2">{review.createdAt}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Sticky Sidebar) */}
                        <div className="mt-8 lg:mt-0">
                            <div className="sticky top-24">
                                 <div className="bg-brand-dark/50 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                                    {course.previewVideoUrl ? (
                                        <div className="relative group">
                                            <video
                                                ref={videoRef}
                                                onClick={togglePlayPause}
                                                onKeyPress={(e) => e.key === ' ' && togglePlayPause()}
                                                className="w-full aspect-video"
                                                poster={course.thumbnailUrl}
                                                playsInline
                                            >
                                                <source src={course.previewVideoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            <div
                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                                onClick={togglePlayPause}
                                                role="button"
                                                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                            >
                                                <button
                                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-4 transition-transform transform active:scale-90"
                                                >
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
                                            <img src={course.thumbnailUrl} alt={course.title} className="w-full object-cover aspect-video" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <p className="text-white text-lg font-semibold">Video Preview Not Available</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center space-x-2">
                                            {(course.discountPrice || course.price) === 0 ? (
                                                <span className="text-3xl font-bold text-green-500">FREE</span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-brand-primary">${course.discountPrice || course.price}</span>
                                                    {course.originalPrice && course.originalPrice > (course.discountPrice || course.price) && (
                                                        <span className="text-gray-500 line-through">${course.originalPrice}</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            <button 
                                                onClick={isEnrolled ? () => { window.location.hash = `/learning/${courseId}`; } : handleBuyNow}
                                                disabled={isProcessingPayment}
                                                className="w-full bg-brand-accent hover:bg-brand-accent/80 text-brand-dark font-bold py-3 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isProcessingPayment ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : isEnrolled ? 'Access Course' : (course.discountPrice || course.price) === 0 ? 'Enroll Free' : 'Buy Now'}
                                            </button>
                                            <button className="w-full bg-transparent border-2 border-brand-primary hover:bg-brand-primary text-white font-bold py-3 rounded-lg transition">Add to Wishlist</button>
                                        </div>
                                        <ul className="mt-6 text-sm text-gray-300 space-y-3">
                                            <li className="flex justify-between"><span>Duration:</span> <strong>{course.totalDuration} hours</strong></li>
                                            <li className="flex justify-between"><span>Lessons:</span> <strong>{course.totalLessons}</strong></li>
                                            <li className="flex justify-between"><span>Skill level:</span> <strong>{course.level}</strong></li>
                                            <li className="flex justify-between"><span>Access:</span> <strong>Lifetime</strong></li>
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
