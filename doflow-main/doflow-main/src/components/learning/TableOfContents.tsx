import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaList } from 'react-icons/fa';
import type { Heading } from './MarkdownRenderer';

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    const ids = headings.map((h) => h.id);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings, handleIntersect]);

  if (headings.length === 0) return null;

  return (
    <div className="w-full">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-xs font-bold text-[var(--page-text-muted)] uppercase tracking-wider mb-3 hover:text-[var(--page-text)] transition-colors w-full text-left"
      >
        <FaList className="w-3 h-3" />
        On this page
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <nav className="space-y-0.5">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  history.replaceState(null, '', `#${heading.id}`);
                }
              }}
              className={`block text-sm py-1.5 rounded-lg transition-all ${
                heading.level === 3 ? 'pl-4' : 'pl-0'
              } ${
                activeId === heading.id
                  ? 'text-[var(--page-accent)] font-semibold'
                  : 'text-[var(--page-text-muted)] hover:text-[var(--page-text)]'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;
