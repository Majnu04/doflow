import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { getCart } from '../store/slices/cartSlice';
import { getWishlist } from '../store/slices/wishlistSlice';
import { setAppTheme } from '../store/slices/workspaceSlice';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiShoppingCart,
  FiHeart,
  FiHome,
  FiGrid,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiCode,
  FiTrendingUp,
} from 'react-icons/fi';
import { Button } from './ui';
import Avatar from './ui/Avatar';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { course: dsaCourse } = useSelector((state: RootState) => state.dsa);

  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isDsaRoute = currentRoute.includes('/dsa/');
  const dsaCourseId = dsaCourse?._id;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getCart());
      dispatch(getWishlist());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleToggleTheme = () => {
    toggleTheme();
    dispatch(setAppTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.hash = '/';
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return currentRoute === '#/' || currentRoute === '#/home' || currentRoute === '#' || currentRoute === '';
    }
    return currentRoute.includes(path);
  };

  const practicePath = dsaCourseId ? `/dsa/problems/${dsaCourseId}` : '/courses';

  const desktopNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Problems', path: practicePath },
  ];

  const mobileNavItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Courses', path: '/courses', icon: FiBookOpen },
    { name: 'Practice', path: practicePath, icon: FiCode },
    { name: 'Roadmaps', path: '/roadmaps', icon: FiTrendingUp },
    {
      name: 'Profile',
      path: isAuthenticated ? '/profile' : '/auth',
      icon: FiUser,
    },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-expo
          ${isScrolled || isDsaRoute
            ? 'bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-xl shadow-card border-b border-border-subtle/40 dark:border-dark-border/40'
            : 'bg-transparent dark:bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[76px]">

            {/* Left: Logo */}
            <a
              href="/#/"
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <img src="/logo.png" alt="DoFlow" className="h-10 w-auto object-contain dark:brightness-110" />
            </a>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {desktopNavLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <a
                    key={link.name}
                    href={`/#${link.path}`}
                    className={`
                      relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${active
                        ? 'text-brand-primary'
                        : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt/60 dark:hover:bg-dark-cardAlt/60'
                      }
                    `}
                  >
                    <span>{link.name}</span>
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-primary rounded-full" />
                    )}
                  </a>
                );
              })}

              {/* Roadmaps */}
              <div className="relative">
                <a
                  href="/#/roadmaps"
                  className={`
                    relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive('/roadmaps')
                      ? 'text-brand-primary'
                      : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt/60 dark:hover:bg-dark-cardAlt/60'
                    }
                  `}
                >
                  <span>Roadmaps</span>
                </a>
              </div>

              {/* Community */}
              <a
                href="/#/about"
                className={`
                  relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive('/about')
                    ? 'text-brand-primary'
                    : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt/60 dark:hover:bg-dark-cardAlt/60'
                  }
                `}
              >
                <span>Community</span>
              </a>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={handleToggleTheme}
                className="p-2 text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-xl transition-all duration-200"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <FiMoon className="w-[18px] h-[18px]" /> : <FiSun className="w-[18px] h-[18px]" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Cart & Wishlist */}
                  <div className="hidden md:flex items-center gap-1">
                    <a
                      href="/#/wishlist"
                      className="relative p-2 text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-xl transition-all duration-200"
                    >
                      <FiHeart className="w-[18px] h-[18px]" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-primary rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                          {wishlistItems.length}
                        </span>
                      )}
                    </a>
                    <a
                      href="/#/cart"
                      className="relative p-2 text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-xl transition-all duration-200"
                    >
                      <FiShoppingCart className="w-[18px] h-[18px]" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-accent rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                          {cartItems.length}
                        </span>
                      )}
                    </a>
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-light-cardAlt/60 dark:hover:bg-dark-cardAlt/60 transition-all duration-200"
                    >
                      <Avatar name={user?.name || 'User'} size="sm" />
                      <span className="hidden lg:block text-sm font-medium text-light-text dark:text-dark-text max-w-[100px] truncate">
                        {user?.name}
                      </span>
                      <FiChevronDown className={`w-3.5 h-3.5 text-light-textMuted dark:text-dark-textMuted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl shadow-elevated animate-slide-up-fade overflow-hidden">
                        <div className="px-4 py-3 border-b border-border-subtle/50 dark:border-dark-border/50">
                          <p className="text-xs text-light-textMuted dark:text-dark-textMuted">Signed in as</p>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          {dsaCourseId && (
                            <a
                              href={`/#/dsa/problems/${dsaCourseId}`}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-lg transition-colors"
                            >
                              <FiCode className="w-4 h-4" />
                              <span>Coding Workspace</span>
                            </a>
                          )}
                          <a
                            href={`/#${user?.role === 'admin' ? '/admin' : '/dashboard'}`}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-lg transition-colors"
                          >
                            <FiGrid className="w-4 h-4" />
                            <span>Dashboard</span>
                          </a>
                          <a
                            href="/#/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-light-textMuted dark:text-dark-textMuted hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 rounded-lg transition-colors"
                          >
                            <FiUser className="w-4 h-4" />
                            <span>Profile</span>
                          </a>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.hash = '/auth'}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.location.hash = '/auth'}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-xl border-t border-border-subtle/40 dark:border-dark-border/40">
        <div className="flex items-center justify-around h-full px-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={`/#${item.path}`}
                className="relative flex flex-col items-center justify-center gap-1 w-full h-full"
              >
                <div className="relative flex flex-col items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active ? 'text-brand-primary' : 'text-light-textMuted dark:text-dark-textMuted'
                    }`}
                    style={active ? { strokeWidth: 2.5 } : undefined}
                  />
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    active ? 'text-brand-primary' : 'text-light-textMuted dark:text-dark-textMuted'
                  }`}
                >
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
