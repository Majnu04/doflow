import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, name, children, helperText, error, className = '', ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-light-text tracking-wide mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={`w-full bg-white/90 border ${error ? 'border-red-500/60' : 'border-border-subtle'} rounded-2xl shadow-sm py-3 px-4 text-light-text focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/18 transition-all duration-200 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-light-textMuted">{helperText}</p>}
    </div>
  );
};

export default Select;
