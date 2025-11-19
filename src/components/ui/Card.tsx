import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'subtle';
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
    default: 'bg-light-card border border-light-border shadow-sm',
    bordered: 'bg-light-card border-2 border-light-border',
    subtle: 'bg-light-cardAlt border border-light-border',
  };

  const hoverStyles = hover
    ? 'hover:shadow-md hover:border-brand-primary transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={`
        ${variants[variant]}
        rounded-lg p-6
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
