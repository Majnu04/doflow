import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const animationClasses = {
    top: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
    bottom: isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
    left: isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1',
    right: isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <div
        className={`
          absolute z-50 pointer-events-none
          ${positionClasses[position]}
          px-2.5 py-1.5 rounded-lg
          bg-neutral-dusk dark:bg-neutral-dusk text-white text-xs font-medium
          shadow-lg
          whitespace-nowrap
          transition-all duration-200 ease-smooth
          ${animationClasses[position]}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        role="tooltip"
      >
        {content}
        <div className={`absolute w-2 h-2 bg-neutral-dusk dark:bg-neutral-dusk rotate-45 ${
          position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
          position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
          position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
          'left-[-4px] top-1/2 -translate-y-1/2'
        }`} />
      </div>
    </div>
  );
};

export default React.memo(Tooltip);
