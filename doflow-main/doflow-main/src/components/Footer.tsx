import React from 'react';
import { FiBookOpen, FiMail, FiPhone, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiYoutube, FiArrowUpRight } from 'react-icons/fi';

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
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  const categories = [
    { name: 'Web Development', path: '/courses' },
    { name: 'Data Science', path: '/courses' },
    { name: 'Mobile Development', path: '/courses' },
    { name: 'Business', path: '/courses' },
  ];

  const socialLinks = [
    { icon: <FiTwitter className="w-4 h-4" />, url: '#', label: 'Twitter' },
    { icon: <FiLinkedin className="w-4 h-4" />, url: '#', label: 'LinkedIn' },
    { icon: <FiInstagram className="w-4 h-4" />, url: '#', label: 'Instagram' },
    { icon: <FiYoutube className="w-4 h-4" />, url: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative mt-24 bg-light-cardAlt/50 dark:bg-dark-cardAlt/50 border-t border-border-subtle/60 dark:border-dark-border/60 overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none bg-soft-vignette opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="pt-12 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <a href="/#/" className="flex items-center gap-3 mb-5 group">
              <img src="/logo.png" alt="DoFlow" className="h-10 w-auto object-contain" />
            </a>
            <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-5 leading-relaxed max-w-sm">
              Empowering learners worldwide with premium online courses. 
              Join thousands of students achieving their dreams through quality education.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-primary transition-colors duration-200">
                <FiMail className="w-4 h-4 flex-shrink-0" />
                <span>doflow004@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-primary transition-colors duration-200">
                <FiPhone className="w-4 h-4 flex-shrink-0" />
                <span>+91 7893804498</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={`/#${link.path}`}
                    className="text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-primary inline-flex items-center gap-1 transition-colors duration-200 group"
                  >
                    {link.name}
                    <FiArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={`/#${link.path}`}
                    className="text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-primary inline-flex items-center gap-1 transition-colors duration-200 group"
                  >
                    {link.name}
                    <FiArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-4 uppercase tracking-wider">
              Popular Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={`/#${category.path}`}
                    className="text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-primary inline-flex items-center gap-1 transition-colors duration-200 group"
                  >
                    {category.name}
                    <FiArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border-subtle/50 dark:border-dark-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-light-textMuted dark:text-dark-muted text-xs">
              &copy; {currentYear} DoFlow Academy. All rights reserved.
            </p>

            <div className="flex items-center gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg hover:bg-light-card dark:hover:bg-dark-card flex items-center justify-center text-light-textMuted dark:text-dark-muted hover:text-brand-primary transition-all duration-200"
                >
                  {social.icon}
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
