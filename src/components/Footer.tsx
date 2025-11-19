import React from 'react';
import { FiBookOpen, FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiYoutube } from 'react-icons/fi';
import { Button, Input } from './ui';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Become Instructor', path: '/become-instructor' },
    { name: 'Blog', path: '/blog' },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Terms & Conditions', path: '/terms-conditions' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Refund Policy', path: '/refund-policy' },
  ];

  const categories = [
    { name: 'Web Development', path: '/courses?category=web-development' },
    { name: 'Data Science', path: '/courses?category=data-science' },
    { name: 'Mobile Development', path: '/courses?category=mobile-development' },
    { name: 'Business', path: '/courses?category=business' },
  ];

  const socialLinks = [
    { icon: <FiFacebook />, url: '#', label: 'Facebook' },
    { icon: <FiTwitter />, url: '#', label: 'Twitter' },
    { icon: <FiLinkedin />, url: '#', label: 'LinkedIn' },
    { icon: <FiInstagram />, url: '#', label: 'Instagram' },
    { icon: <FiYoutube />, url: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border overflow-hidden transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <a href="/#/" className="flex items-center gap-3 mb-4 md:mb-6 group">
              <div className="bg-brand-primary p-3 rounded-lg group-hover:bg-brand-primaryHover transition-colors duration-300">
                <FiBookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-light-text dark:text-dark-text transition-colors duration-300">
                  DoFlow
                </h2>
              </div>
            </a>
            <p className="text-sm md:text-base text-light-textSecondary dark:text-dark-muted mb-4 md:mb-6 leading-relaxed transition-colors duration-300">
              Empowering learners worldwide with premium online courses. 
              Join thousands of students achieving their dreams through quality education.
            </p>
            <div className="space-y-2 md:space-y-3">
              <a href="mailto:doflow004@gmail.com" className="flex items-center gap-3 py-1.5 text-sm md:text-base text-light-textSecondary dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-300">
                <FiMail className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>doflow004@gmail.com</span>
              </a>
              <a href="tel:+917893804498" className="flex items-center gap-3 py-1.5 text-sm md:text-base text-light-textSecondary dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-300">
                <FiPhone className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>+91 7893804498</span>
              </a>
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base md:text-lg font-display font-bold text-light-text dark:text-dark-text mb-4 md:mb-6 transition-colors duration-300">
              Quick Links
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={`/#${link.path}`}
                    className="text-sm md:text-base text-light-textSecondary dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary inline-block py-1 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base md:text-lg font-display font-bold text-light-text dark:text-dark-text mb-4 md:mb-6 transition-colors duration-300">
              Support
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={`/#${link.path}`}
                    className="text-sm md:text-base text-light-textSecondary dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary inline-block py-1 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base md:text-lg font-display font-bold text-light-text dark:text-dark-text mb-4 md:mb-6 transition-colors duration-300">
              Popular Categories
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {categories.map((category) => (
                <li key={category.path}>
                  <a
                    href={`/#${category.path}`}
                    className="text-sm md:text-base text-light-textSecondary dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary inline-block py-1 transition-colors duration-300"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 md:py-8 border-t border-light-border dark:border-dark-border transition-colors duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-light-textMuted dark:text-dark-muted text-sm transition-colors duration-300">
                © {currentYear} DoFlow. All rights reserved.
              </p>
              <p className="text-light-textMuted dark:text-dark-muted text-xs mt-1 transition-colors duration-300">
                Developed by <a 
                  href="https://elitedigitalsolutions.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-primaryHover transition-colors duration-200 font-medium"
                >
                  Elite Digital Solutions
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 md:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-light-cardAlt dark:bg-dark-cardAlt hover:bg-brand-primary dark:hover:bg-brand-primary flex items-center justify-center text-light-textMuted dark:text-dark-muted hover:text-white dark:hover:text-white transition-all duration-300 active:scale-95"
                >
                  <span className="text-lg md:text-base">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
