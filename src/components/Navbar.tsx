import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiBookOpen, FiShoppingCart, FiHeart, FiHome, FiGrid, FiMoon, FiSun } from 'react-icons/fi';
import { Button } from './ui';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { theme, toggleTheme } = useTheme();
  
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    window.location.hash = '/';
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Courses', path: '/courses', icon: <FiBookOpen /> },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-lg border-b border-light-border dark:border-dark-border shadow-sm' 
          : 'bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a 
            href="/#/" 
            className="flex items-center gap-3 group"
          >
            <img src="/Logo.PNG" alt="DoFlow" className="h-36 object-contain" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`/#${link.path}`}
                className="flex items-center gap-2 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-200 group"
              >
                <span className="group-hover:text-brand-primary transition-colors">
                  {link.icon}
                </span>
                <span className="font-medium">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart & Wishlist */}
                <div className="hidden md:flex items-center gap-3">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-light-textMuted hover:text-brand-primary dark:text-dark-muted dark:hover:text-brand-primary transition-colors duration-300 rounded-lg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
                  </button>
                  
                  <a
                    href="/#/wishlist"
                    className="relative p-2 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                  >
                    <FiHeart className="w-6 h-6" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary rounded-full text-xs flex items-center justify-center text-white font-semibold">
                        {wishlistItems.length}
                      </span>
                    )}
                  </a>
                  <a
                    href="/#/cart"
                    className="relative p-2 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                  >
                    <FiShoppingCart className="w-6 h-6" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent rounded-full text-xs flex items-center justify-center text-white font-semibold">
                        {cartItems.length}
                      </span>
                    )}
                  </a>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-light-text dark:text-dark-text">
                      {user?.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg animate-slide-up overflow-hidden">
                      <div className="p-4 border-b border-light-border dark:border-dark-border">
                        <p className="text-sm text-light-textMuted dark:text-dark-muted">Signed in as</p>
                        <p className="text-light-text dark:text-dark-text font-semibold">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <a
                          href={`/#${user?.role === 'admin' ? '/admin' : '/dashboard'}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-lg transition-colors"
                        >
                          <FiGrid className="w-5 h-5" />
                          <span>Dashboard</span>
                        </a>
                        <a
                          href="/#/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-lg transition-colors"
                        >
                          <FiUser className="w-5 h-5" />
                          <span>Profile</span>
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                {/* Theme Toggle for non-authenticated users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-light-textMuted hover:text-brand-primary dark:text-dark-muted dark:hover:text-brand-primary transition-colors duration-300 rounded-lg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.hash = '/auth'}
                >
                  Login
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-light-card dark:bg-dark-card backdrop-blur-xl border-t border-light-border dark:border-dark-border animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`/#${link.path}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-lg transition-all duration-200"
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </a>
            ))}

            {isAuthenticated ? (
              <>
                <a
                  href="/#/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <FiHeart className="w-5 h-5" />
                  <span>Wishlist ({wishlistItems.length})</span>
                </a>
                <a
                  href="/#/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Cart ({cartItems.length})</span>
                </a>
                <a
                  href={`/#${user?.role === 'admin' ? '/admin' : '/dashboard'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <FiGrid className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    window.location.hash = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    window.location.hash = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
