import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, helperText, error, className = '', ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-light-text tracking-wide mb-2">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        className={`w-full min-h-[150px] bg-white/90 border ${error ? 'border-red-500/60' : 'border-border-subtle'} rounded-2xl shadow-sm py-3 px-4 text-light-text placeholder-light-textMuted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/18 focus:shadow-[0_12px_30px_rgba(224,100,56,0.12)] transition-all duration-200 ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-light-textMuted">{helperText}</p>}
    </div>
  );
};

export default Textarea;
