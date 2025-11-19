import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../utils/motionVariants';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  href 
}) => {
  const Component = href ? motion.a : motion.div;
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={className}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardHoverVariants}
    >
      {children}
    </Component>
  );
};

export default AnimatedCard;
