// Motion variants for responsive animations
// Automatically adjusts based on screen size

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: isMobile() ? 10 : 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile() ? 0.3 : 0.5,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  exit: {
    opacity: 0,
    y: isMobile() ? -10 : -20,
    transition: {
      duration: isMobile() ? 0.2 : 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Slide in from right (for modals, drawers)
export const slideInVariants = {
  initial: {
    x: isMobile() ? '100%' : '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: isMobile() ? 0.3 : 0.4,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  exit: {
    x: isMobile() ? '100%' : '100%',
    opacity: 0,
    transition: {
      duration: isMobile() ? 0.2 : 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Fade and scale (for cards, modals)
export const fadeScaleVariants = {
  initial: {
    opacity: 0,
    scale: isMobile() ? 0.95 : 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: isMobile() ? 0.3 : 0.4,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  exit: {
    opacity: 0,
    scale: isMobile() ? 0.95 : 0.9,
    transition: {
      duration: isMobile() ? 0.2 : 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Stagger children animation
export const staggerContainerVariants = {
  animate: {
    transition: {
      staggerChildren: isMobile() ? 0.05 : 0.1,
      delayChildren: isMobile() ? 0.1 : 0.2,
    },
  },
};

// Fade up animation (for scroll reveals)
export const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: isMobile() ? 20 : 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile() ? 0.4 : 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Card hover animation
export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: isMobile() ? 1 : 1.02,
    y: isMobile() ? 0 : -4,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Navbar scroll variants
export const navbarVariants = {
  top: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  scrolled: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Button press animation
export const buttonVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: isMobile() ? 1 : 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Drawer/Menu variants
export const drawerVariants = {
  closed: {
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  open: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Accordion variants
export const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Modal backdrop variants
export const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide from bottom (mobile sheets)
export const slideUpVariants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};
