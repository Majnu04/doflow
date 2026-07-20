import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className = '',
  fullWidth = false,
}) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id);
  const currentTab = activeTab || internalActive;

  const handleChange = (tabId: string) => {
    setInternalActive(tabId);
    onChange(tabId);
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-light-cardAlt/60 dark:bg-dark-cardAlt/60 rounded-xl border border-border-subtle/40 dark:border-dark-border/40 ${fullWidth ? 'w-full flex' : ''} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={`
            inline-flex items-center justify-center gap-2 rounded-lg font-medium
            transition-all duration-250 ease-smooth
            ${sizes[size]}
            ${fullWidth ? 'flex-1' : ''}
            ${currentTab === tab.id
              ? 'bg-light-card dark:bg-dark-card text-brand-primary shadow-sm'
              : 'text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-card/50 dark:hover:bg-dark-card/50'
            }
          `}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`
              px-1.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[20px]
              ${currentTab === tab.id
                ? 'bg-brand-primary/10 dark:bg-brand-primary/10 text-brand-primary dark:text-brand-primary'
                : 'bg-light-cardAlt dark:bg-dark-cardAlt text-light-textMuted dark:text-dark-muted'
              }
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
