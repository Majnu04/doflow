import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
  online?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showRing = false,
  online,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const ringSizes = {
    xs: 'ring-1',
    sm: 'ring-1.5',
    md: 'ring-2',
    lg: 'ring-2',
    xl: 'ring-3',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradient = (name: string) => {
    const gradients = [
      'from-brand-primary to-brand-accent',
      'from-emerald-400 to-teal-500',
      'from-violet-400 to-purple-500',
      'from-sky-400 to-blue-500',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-pink-500',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ${showRing ? `ring-white ${ringSizes[size]}` : ''}`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}
            rounded-full
            bg-gradient-to-br ${getGradient(name)}
            flex items-center justify-center
            text-white font-semibold
            ${showRing ? `ring-white ${ringSizes[size]}` : ''}
          `}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`
            absolute bottom-0 right-0
            w-3 h-3 rounded-full border-2 border-light-card
            ${online ? 'bg-emerald-400' : 'bg-gray-300'}
          `}
        />
      )}
    </div>
  );
};

export default React.memo(Avatar);
