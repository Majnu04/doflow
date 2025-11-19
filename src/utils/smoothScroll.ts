// Smooth scroll utilities

/**
 * Smoothly scroll to a section by ID
 * @param sectionId - The ID of the section to scroll to
 * @param offset - Optional offset from the top (useful for fixed navbars)
 */
export const scrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Smooth scroll to top of page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

/**
 * Check if element is in viewport
 * Useful for triggering scroll animations
 */
export const isInViewport = (element: HTMLElement, offset: number = 0): boolean => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  return (
    rect.top >= 0 - offset &&
    rect.bottom <= windowHeight + offset
  );
};

/**
 * Get scroll progress (0 to 1)
 * Useful for scroll progress indicators
 */
export const getScrollProgress = (): number => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  return scrollHeight > 0 ? scrollTop / scrollHeight : 0;
};

/**
 * Enable/disable body scroll (useful for modals)
 */
export const toggleBodyScroll = (enable: boolean) => {
  if (enable) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  } else {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
};

/**
 * Debounced scroll handler
 * Improves performance for scroll event listeners
 */
export const debounce = (func: Function, wait: number = 100) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
