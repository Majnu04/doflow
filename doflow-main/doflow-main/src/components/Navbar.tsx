import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { getCart } from '../store/slices/cartSlice';
import { getWishlist } from '../store/slices/wishlistSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiBookOpen, FiShoppingCart, FiHeart, FiHome, FiGrid, FiBell, FiChevronDown } from 'react-icons/fi';
import { Button } from './ui';
import Avatar from './ui/Avatar';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  
  const dispatch = useDispatch<AppDispatch>();

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

  // Close user menu on outside click
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

  const handleLogout = () => {
    dispatch(logout());
    window.location.hash = '/';
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome className="w-4 h-4" /> },
    { name: 'Courses', path: '/courses', icon: <FiBookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-expo
        ${isScrolled 
          ? 'bg-light-card/80 backdrop-blur-xl shadow-card border-b border-border-subtle/40 py-2' 
          : 'bg-transparent py-4'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a 
            href="/#/" 
            className="flex items-center gap-3 group flex-shrink-0"
          >
            <img src="/logo.png" alt="DoFlow" className="h-10 w-auto object-contain" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`/#${link.path}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-light-textMuted hover:text-light-text rounded-lg hover:bg-light-cardAlt/60 transition-all duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Cart & Wishlist */}
                <div className="hidden md:flex items-center gap-1">
                  <a
                    href="/#/wishlist"
                    className="relative p-2 text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all duration-200"
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
                    className="relative p-2 text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all duration-200"
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
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-light-cardAlt/60 transition-all duration-200"
                  >
                    <Avatar name={user?.name || 'User'} size="sm" />
                    <span className="hidden lg:block text-sm font-medium text-light-text max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <FiChevronDown className={`w-3.5 h-3.5 text-light-textMuted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-light-card border border-border-subtle rounded-xl shadow-elevated animate-slide-up-fade overflow-hidden">
                      <div className="px-4 py-3 border-b border-border-subtle/50">
                        <p className="text-xs text-light-textMuted">Signed in as</p>
                        <p className="text-sm font-semibold text-light-text truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <a
                          href={`/#${user?.role === 'admin' ? '/admin' : '/dashboard'}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                        >
                          <FiGrid className="w-4 h-4" />
                          <span>Dashboard</span>
                        </a>
                        <a
                          href="/#/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                        >
                          <FiUser className="w-4 h-4" />
                          <span>Profile</span>
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-light-textMuted hover:bg-light-cardAlt rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-light-card/95 backdrop-blur-xl border-t border-border-subtle/40 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={`/#${link.path}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-textMuted hover:text-light-text hover:bg-light-cardAlt rounded-xl transition-all duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}

            {isAuthenticated ? (
              <>
                <div className="border-t border-border-subtle/40 my-2" />
                <a
                  href="/#/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all duration-200"
                >
                  <FiHeart className="w-4 h-4" />
                  <span>Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}</span>
                </a>
                <a
                  href="/#/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all duration-200"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Cart {cartItems.length > 0 && `(${cartItems.length})`}</span>
                </a>
                <a
                  href={`/#${user?.role === 'admin' ? '/admin' : '/dashboard'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all duration-200"
                >
                  <FiGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="border-t border-border-subtle/40 pt-3 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    window.location.hash = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    window.location.hash = '/auth';
                    setIsMobileMenuOpen(false);
                  }}
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
