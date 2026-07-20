import { type Variants, type Transition } from 'framer-motion';

export const easeOutExpo: Transition = { ease: [0.16, 1, 0.3, 1], duration: 0.5 };
export const easeSpring: Transition = { ease: [0.34, 1.56, 0.64, 1], duration: 0.4 };
export const easeSmooth: Transition = { ease: [0.33, 1, 0.68, 1], duration: 0.35 };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, ...easeOutExpo },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, ...easeOutExpo },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, ...easeOutExpo },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, ...easeOutExpo },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, ...easeOutExpo },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, ...easeSpring },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, ...easeSpring },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, ...easeOutExpo },
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const cardHover = {
  y: -2,
  boxShadow: '0 8px 32px rgba(32, 29, 25, 0.1)',
  transition: easeSmooth,
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, ...easeOutExpo },
  exit: { opacity: 0, y: -8, ...easeSmooth },
};

export const listContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, ...easeSmooth },
};
