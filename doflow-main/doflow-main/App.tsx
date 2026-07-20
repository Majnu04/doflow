import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import type { RootState } from './src/store';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';

// Eagerly loaded (small, visible immediately)
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPageNew';

// Lazy loaded pages (reduces initial bundle)
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const CourseDetailsPage = React.lazy(() => import('./pages/CourseDetailsPageRefactored'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const BecomeInstructorPage = React.lazy(() => import('./pages/BecomeInstructorPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));

// Heavy feature pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const ManageDSACoursePage = React.lazy(() => import('./pages/admin/ManageDSACoursePage'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const LearningPage = React.lazy(() => import('./pages/LearningPageRefactored'));
const ProblemEditorPage = React.lazy(() => import('./pages/ProblemEditorPage'));
const DSAProblemsPage = React.lazy(() => import('./pages/DSAProblemsPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CertificatesPage = React.lazy(() => import('./pages/CertificatesPage'));
const CertificateVerificationPage = React.lazy(() => import('./pages/CertificateVerificationPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const RoadmapsPage = React.lazy(() => import('./src/components/RoadmapsPage'));
const RoadmapDetailPage = React.lazy(() => import('./src/components/RoadmapDetailPage'));

const LoadingFallback: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-light-textSecondary dark:text-dark-textMuted">Loading...</p>
        </div>
    </div>
);

const NotFound: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center text-light-text dark:text-dark-text text-center">
        <div>
            <h1 className="text-6xl font-bold text-brand-primary">404</h1>
            <p className="text-2xl mt-4 text-light-textSecondary dark:text-dark-textMuted">Page Not Found</p>
            <a href="/#" className="mt-8 inline-block bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold py-3 px-6 rounded-lg transition">Go Home</a>
        </div>
    </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        window.location.hash = '/auth';
        return null;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">Access Denied</h2>
                    <p className="text-light-textSecondary dark:text-dark-textMuted mb-4">You don't have permission to access this page</p>
                    <a href="/#" className="inline-block bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold py-3 px-6 rounded-lg transition">Go Home</a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    const [route, setRoute] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const normalizedRoute = route.replace('#', '');

    const renderRoute = () => {
        const path = normalizedRoute;
        
        // Course detail route
        const courseMatch = path.match(/^\/course\/([\w-]+)$/);
        if (courseMatch) {
            const courseId = courseMatch[1];
            return <CourseDetailsPage courseId={courseId} />;
        }

        // Learning route
        const learnMatch = path.match(/^\/learn\/([\w-]+)$/);
        if (learnMatch) {
            const courseId = learnMatch[1];
            return (
                <ProtectedRoute>
                    <LearningPage courseId={courseId} />
                </ProtectedRoute>
            );
        }

        // Problem editor route
        const problemMatch = path.match(/^\/dsa\/problem\/([\w-]+)$/);
        if (problemMatch) {
            const problemId = problemMatch[1];
            return (
                <ProtectedRoute>
                    <ProblemEditorPage problemId={problemId} />
                </ProtectedRoute>
            );
        }

        // DSA course route
        const dsaCourseMatch = path.match(/^\/dsa\/problems\/([\w-]+)$/);
        if (dsaCourseMatch) {
            const courseId = dsaCourseMatch[1];
            return <DSAProblemsPage courseId={courseId} />;
        }

        // Certificate verification route
        const certVerifyMatch = path.match(/^\/verify-certificate\/([\w-]+)$/);
        if (certVerifyMatch) {
            return <CertificateVerificationPage />;
        }

        // Roadmap detail route
        const roadmapMatch = path.match(/^\/roadmaps\/([\w-]+)$/);
        if (roadmapMatch) {
            const roadmapId = roadmapMatch[1];
            return <RoadmapDetailPage roadmapId={roadmapId} />;
        }

        switch (path) {
            case '':
            case '/':
                return <HomePage />;
            case '/auth':
            case '/login':
            case '/register':
                return <AuthPage />;
            case '/forgot-password':
                return <ForgotPasswordPage />;
            case '/courses':
                return <CoursesPage />;
            case '/roadmaps':
                return <RoadmapsPage />;
            case '/about':
                return <AboutPage />;
            case '/become-instructor':
                return <BecomeInstructorPage />;
            case '/blog':
                return <BlogPage />;
            case '/pricing':
                return <PricingPage />;
            case '/help':
                return <HelpPage />;
            case '/faq':
                return <FAQPage />;
            case '/terms':
                return <TermsPage />;
            case '/privacy':
                return <PrivacyPage />;
            case '/cart':
                return <CartPage />;
            case '/checkout':
                return (
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                );
            case '/wishlist':
                return (
                    <ProtectedRoute>
                        <WishlistPage />
                    </ProtectedRoute>
                );
            case '/profile':
                return (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                );
            case '/certificates':
                return (
                    <ProtectedRoute>
                        <CertificatesPage />
                    </ProtectedRoute>
                );
            case '/dashboard':
                return (
                    <ProtectedRoute>
                        <StudentDashboard />
                    </ProtectedRoute>
                );
            case '/admin':
                return (
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                );
            case '/admin/dsa-course':
                return (
                    <ProtectedRoute requireAdmin={true}>
                        <ManageDSACoursePage />
                    </ProtectedRoute>
                );
            default:
                // Handle dynamic routes
                if (path.startsWith('/dsa/problems/')) {
                    const courseId = path.split('/')[3];
                    return <DSAProblemsPage courseId={courseId} />;
                }
                if (path.startsWith('/dsa/problem/')) {
                    const problemId = path.split('/')[3];
                    return <ProblemEditorPage problemId={problemId} />;
                }
                return <NotFound />;
        }
    };

    const hideHeaderFooter = route.includes('/learn/') || route.includes('/dsa/');

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#FFFFFF',
                        color: '#1F232E',
                        borderRadius: '999px',
                        border: '1px solid #E5DDD2',
                        padding: '0.75rem 1.5rem',
                    },
                }}
            />
            {!hideHeaderFooter && <Navbar />}
            <Suspense fallback={<LoadingFallback />}>
                <main className={hideHeaderFooter ? '' : 'min-h-[calc(100vh-76px)] pb-[72px] md:pb-0'}>
                     {renderRoute()}
                </main>
            </Suspense>
            {!hideHeaderFooter && <Footer />}
        </div>
    );
};

export default App;
