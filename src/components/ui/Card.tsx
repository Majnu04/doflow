import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'subtle' | 'glass';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
}) => {
  const variants = {
    default: 'bg-light-card border border-border-subtle shadow-lg shadow-[rgba(32,29,25,0.05)]',
    bordered: 'bg-light-card border-2 border-brand-primary/20',
    subtle: 'bg-light-cardAlt border border-border-subtle/80',
    glass: 'bg-white/80 border border-white/60 backdrop-blur-xl shadow-xl shadow-[rgba(32,29,25,0.08)]',
  } as const;

  const hoverStyles = hover
    ? 'hover:-translate-y-[2px] hover:shadow-2xl hover:border-brand-primary/60 transition-all duration-300 cursor-pointer'
    : '';

  return (
    <div
      className={`
        ${variants[variant]}
        rounded-2xl p-6 md:p-7
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
