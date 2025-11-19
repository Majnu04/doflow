import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './src/store';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AuthPage from './pages/AuthPageNew';
import CoursesPage from './pages/CoursesPage';
import StudentDashboard from './pages/StudentDashboard';
import LearningPage from './pages/LearningPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import DSACourseLandingPage from './pages/DSACourseLandingPage';
import DSARoadmapPage from './pages/DSARoadmapPage';
import ProblemEditorPage from './pages/ProblemEditorPage';
import CheckoutPage from './pages/CheckoutPage';

const NotFound: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center text-light-text text-center">
        <div>
            <h1 className="text-6xl font-bold text-brand-primary">404</h1>
            <p className="text-2xl mt-4 text-light-textSecondary">Page Not Found</p>
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
                    <h2 className="text-2xl font-bold mb-4 text-light-text">Access Denied</h2>
                    <p className="text-light-textSecondary mb-4">You don't have permission to access this page</p>
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

    const renderRoute = () => {
        const path = route.replace('#', '');
        
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
        const problemMatch = path.match(/^\/problem\/([\w-]+)$/);
        if (problemMatch) {
            const problemId = problemMatch[1];
            return <ProblemEditorPage problemId={problemId} />;
        }

        switch (path) {
            case '':
            case '/':
                return <HomePage />;
            case '/auth':
            case '/login':
            case '/register':
                return <AuthPage />;
            case '/courses':
                return <CoursesPage />;
            case '/dsa-course':
                return <DSACourseLandingPage />;
            case '/dsa-roadmap':
                return <DSARoadmapPage />;
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
            default:
                return <NotFound />;
        }
    };

    const hideHeaderFooter = route.includes('/learn/');

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg font-sans transition-colors duration-300">
            {!hideHeaderFooter && <Navbar />}
            <main className={hideHeaderFooter ? '' : 'min-h-[calc(100vh-80px)]'}>
                 {renderRoute()}
            </main>
            {!hideHeaderFooter && <Footer />}
        </div>
    );
};

export default App;
