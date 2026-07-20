import React from 'react';

interface CompanyLogoDef {
  color: string;
  lightBg: string;
  darkBg: string;
  render: (size: number) => React.ReactNode;
}

const companyLogos: Record<string, CompanyLogoDef> = {
  'Google': {
    color: '#4285F4',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  'Amazon': {
    color: '#FF9900',
    lightBg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M17.5 6.5c-3.5-2.5-8-2-11-1l-.5 1.5c2-1 6-1.5 9 .5l2.5-1z" fill="#FF9900"/>
        <path d="M19 9c-4-3-10-2.5-13.5-.5L5 10c2.5-1.5 7.5-2 11 .5L19 9z" fill="#FF9900"/>
        <path d="M21 12c-4.5-3.5-12-3-16-1l-.5 1.5c3-1.5 9-2 13 .5L21 12z" fill="#FF9900"/>
        <path d="M3 17c2.5-1 8-1.5 12 .5l.5-1.5c-4.5-2-11-1.5-14 0L3 17z" fill="#FF9900"/>
        <path d="M10 19c2-.5 4-.5 6 .5l.5-1c-2-1-4.5-1-7 0l.5.5z" fill="#FF9900"/>
      </svg>
    ),
  },
  'Microsoft': {
    color: '#00A4EF',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1" fill="#F25022"/>
        <rect x="13" y="3" width="8" height="8" rx="1" fill="#7FBA00"/>
        <rect x="3" y="13" width="8" height="8" rx="1" fill="#00A4EF"/>
        <rect x="13" y="13" width="8" height="8" rx="1" fill="#FFB900"/>
      </svg>
    ),
  },
  'Meta': {
    color: '#1877F2',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#1877F2"/>
        <path d="M16.5 8.5l-3 7h-2l1.2-2.8L11 8.5h2l1.2 2.8L15.5 8.5h1z" fill="white"/>
        <path d="M9 8.5l2.5 5.5L13 15.5h-2L9 13l-2 2.5H5l2.5-5.5L9 8.5z" fill="white"/>
      </svg>
    ),
  },
  'Apple': {
    color: '#555555',
    lightBg: 'bg-gray-100',
    darkBg: 'dark:bg-gray-800',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C4.79 17.4 4.32 12.45 6.88 9.85c1.01-1.02 2.35-1.57 3.73-1.6 1.12.02 2.18.44 2.97 1.1.77-.58 1.57-.88 2.46-.83 1.17.05 2.17.54 2.9 1.42-1.14.68-1.95 1.66-2.22 2.95-.3 1.49.15 2.86 1.06 3.88.43.5.92.96 1.25 1.48-.92.8-1.53 1.76-1.98 2.85v.08z" fill="currentColor"/>
        <path d="M12.03 9.68c-.05-1.53.82-2.9 2.08-3.68.1.65.26 1.29.5 1.88.34.8.9 1.47 1.5 2.08-1.03.04-2.56.32-3.3.78-.2.15-.08.03-.08.03l-.38-.18v-.1l-.32.01z" fill="currentColor"/>
      </svg>
    ),
  },
  'Netflix': {
    color: '#E50914',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M5 2h3.5l4 10.5V2h3v20h-3.5L8 11.5V22H5V2z" fill="#E50914"/>
        <path d="M19 2v20h-3V2h3z" fill="#E50914"/>
      </svg>
    ),
  },
  'Uber': {
    color: '#000000',
    lightBg: 'bg-gray-100',
    darkBg: 'dark:bg-gray-800',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" fontFamily="Arial">U</text>
      </svg>
    ),
  },
  'Stripe': {
    color: '#008CDD',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="6" width="16" height="12" rx="2" fill="#008CDD"/>
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">S</text>
      </svg>
    ),
  },
  'Twitter': {
    color: '#000000',
    lightBg: 'bg-gray-100',
    darkBg: 'dark:bg-gray-800',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
      </svg>
    ),
  },
  'Atlassian': {
    color: '#0052CC',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M7.7 2.3c-.3-.4-.8-.4-1.1 0L2.3 8.4c-.3.4-.3.9 0 1.3l4.3 6.1c.3.4.8.4 1.1 0s.3-.9 0-1.3L3.8 9l3.9-5.4c.3-.4.3-.9 0-1.3z" fill="#0052CC"/>
        <path d="M16.3 2.3c.3-.4.8-.4 1.1 0l4.3 6.1c.3.4.3.9 0 1.3l-4.3 6.1c-.3.4-.8.4-1.1 0s-.3-.9 0-1.3L20.2 9l-3.9-5.4c-.3-.4-.3-.9 0-1.3z" fill="#0052CC"/>
        <path d="M12 9.5c-.4 0-.8.2-1 .6l-2.5 6c-.3.7-.3 1.5 0 2.2l1.8 3.7c.1.3.4.5.7.5s.6-.2.7-.5l1.8-3.7c.3-.7.3-1.5 0-2.2l-2.5-6c-.2-.4-.6-.6-1-.6z" fill="#2684FF"/>
      </svg>
    ),
  },
  'Salesforce': {
    color: '#00A1E0',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <ellipse cx="8" cy="12" rx="3.5" ry="4" fill="#00A1E0"/>
        <ellipse cx="16" cy="12" rx="3.5" ry="4" fill="#00A1E0"/>
        <ellipse cx="12" cy="9" rx="3" ry="3.5" fill="#00A1E0"/>
      </svg>
    ),
  },
  'Bloomberg': {
    color: '#E32C2C',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#E32C2C"/>
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#E32C2C"/>
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#E32C2C"/>
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#E32C2C"/>
      </svg>
    ),
  },
  'Adobe': {
    color: '#FF0000',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 3h6l3 18H9L4 3z" fill="#FF0000"/>
        <path d="M14 3h6l-3 18h-4l3-18z" fill="#FF0000"/>
      </svg>
    ),
  },
  'LinkedIn': {
    color: '#0A66C2',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2"/>
        <rect x="5" y="9" width="3" height="8" rx="1" fill="white"/>
        <circle cx="6.5" cy="6.5" r="1.5" fill="white"/>
        <path d="M11 17h3v-4.5c0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5V17h3v-4.5c0-2.5-1.5-3.5-3-3.5s-2.5.5-3 1V9h-3v8z" fill="white"/>
      </svg>
    ),
  },
  'Walmart': {
    color: '#0071CE',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#0071CE" strokeWidth="1.5" fill="none"/>
        <path d="M8 8l4-3 4 3-2 5H10l-2-5z" fill="#FFC220"/>
        <path d="M8 16l4 3 4-3-2-5H10l-2 5z" fill="#0071CE"/>
      </svg>
    ),
  },
  'Goldman Sachs': {
    color: '#003087',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#003087"/>
        <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">GS</text>
      </svg>
    ),
  },
  'Oracle': {
    color: '#F80000',
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke="#F80000" strokeWidth="2" fill="none"/>
        <text x="12" y="14.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#F80000" fontFamily="Arial">O</text>
      </svg>
    ),
  },
  'Cisco': {
    color: '#1BA0D7',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="7" height="10" rx="1.5" fill="#1BA0D7"/>
        <rect x="14" y="7" width="7" height="10" rx="1.5" fill="#1BA0D7"/>
        <path d="M10 12h4" stroke="#1BA0D7" strokeWidth="1.5"/>
      </svg>
    ),
  },
  'PayPal': {
    color: '#003087',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M7.5 3h7c2.5 0 4 1.5 4 4s-1.5 4-4 4h-3l-1 4H7l2.5-12z" fill="#003087"/>
        <path d="M13 7c0 2.5-1.5 4-4 4H7l2.5-4H13z" fill="#009CDE"/>
      </svg>
    ),
  },
  'Flipkart': {
    color: '#2874F0',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="#2874F0"/>
        <path d="M8 8l4 8 4-8H8z" fill="#FFC220"/>
      </svg>
    ),
  },
};

const DefaultLogo: React.FC<{ name: string; color: string; size: number }> = ({ name, color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="4" fill={color} />
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial">
      {name.charAt(0)}
    </text>
  </svg>
);

interface CompanyChipProps {
  name: string;
  size?: number;
  showName?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const CompanyChip: React.FC<CompanyChipProps> = ({ name, size = 14, showName = true, active, onClick }) => {
  const logo = companyLogos[name] || null;
  const color = logo?.color || '#6B7280';

  return (
    <span
      onClick={onClick}
      style={{
        '--company-color': color,
        backgroundColor: active ? `${color}14` : undefined,
        borderColor: active ? `${color}30` : undefined,
        color: active ? color : undefined,
      } as React.CSSProperties}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all whitespace-nowrap ${
        onClick ? 'cursor-pointer' : ''
      } ${
        active
          ? 'shadow-sm'
          : `${logo?.lightBg || 'bg-light-cardAlt'} ${logo?.darkBg || 'dark:bg-dark-cardAlt'} text-light-textMuted dark:text-dark-muted border border-transparent`
      }`}
    >
      <span className="flex-shrink-0" style={{ color }}>
        {logo ? logo.render(size) : <DefaultLogo name={name} color={color} size={size} />}
      </span>
      {showName && <span>{name}</span>}
    </span>
  );
};

export { companyLogos };
export type { CompanyChipProps };
export default CompanyChip;
