import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt border border-light-border dark:border-dark-border hover:border-brand-primary dark:hover:border-brand-primary transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {/* Sun Icon - visible in dark mode */}
      <FiSun 
        className={`w-5 h-5 text-light-textMuted dark:text-dark-muted transition-all duration-300 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-90 scale-0 absolute'
        }`}
      />
      
      {/* Moon Icon - visible in light mode */}
      <FiMoon 
        className={`w-5 h-5 text-light-textMuted dark:text-dark-muted transition-all duration-300 ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-0 absolute'
        }`}
      />
    </button>
  );
};

// Alternative: Compact version
export const ThemeToggleCompact: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-light-textMuted dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-300 rounded-lg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FiSun className="w-6 h-6" />
      ) : (
        <FiMoon className="w-6 h-6" />
      )}
    </button>
  );
};

// Alternative: With text label
export const ThemeToggleWithLabel: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-brand-primary dark:hover:border-brand-primary transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <FiSun className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-light-text dark:text-dark-text">Light</span>
        </>
      ) : (
        <>
          <FiMoon className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-light-text dark:text-dark-text">Dark</span>
        </>
      )}
    </button>
  );
};
