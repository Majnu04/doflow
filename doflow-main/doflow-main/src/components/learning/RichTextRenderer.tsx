import React, { useMemo, createElement } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Callout from './Callout';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface RichTextRendererProps {
  content: string;
  className?: string;
  onHeadings?: (headings: Heading[]) => void;
}

function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `heading-${Math.random().toString(36).slice(2, 7)}`;
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let matchType = '';
    let matchIndex = remaining.length;

    const boldIdx = remaining.indexOf('**');
    if (boldIdx !== -1 && boldIdx < matchIndex) { earliest = boldIdx; matchType = 'bold'; matchIndex = boldIdx; }
    const italicIdx = remaining.indexOf('*');
    if (italicIdx !== -1 && italicIdx < matchIndex && italicIdx !== earliest) { earliest = italicIdx; matchType = 'italic'; matchIndex = italicIdx; }
    const codeIdx = remaining.indexOf('`');
    if (codeIdx !== -1 && codeIdx < matchIndex) { earliest = codeIdx; matchType = 'code'; matchIndex = codeIdx; }

    if (earliest === -1) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.substring(0, earliest));
    }

    if (matchType === 'bold') {
      const end = remaining.indexOf('**', earliest + 2);
      if (end !== -1) {
        parts.push(<strong key={key++} className="font-bold text-[var(--page-text)]">{remaining.substring(earliest + 2, end)}</strong>);
        remaining = remaining.substring(end + 2);
      } else {
        parts.push(remaining.substring(earliest, earliest + 2));
        remaining = remaining.substring(earliest + 2);
      }
    } else if (matchType === 'italic') {
      const end = remaining.indexOf('*', earliest + 1);
      if (end !== -1 && remaining[end + 1] !== '*') {
        parts.push(<em key={key++} className="italic text-[var(--page-text)]">{remaining.substring(earliest + 1, end)}</em>);
        remaining = remaining.substring(end + 1);
      } else {
        parts.push(remaining[earliest]);
        remaining = remaining.substring(earliest + 1);
      }
    } else if (matchType === 'code') {
      const end = remaining.indexOf('`', earliest + 1);
      if (end !== -1) {
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-md text-[0.875em] font-['IBM_Plex_Mono',monospace] font-medium">
            {remaining.substring(earliest + 1, end)}
          </code>
        );
        remaining = remaining.substring(end + 1);
      } else {
        parts.push(remaining[earliest]);
        remaining = remaining.substring(earliest + 1);
      }
    }
  }

  return parts;
}

function getCalloutType(text: string): 'tip' | 'note' | 'warning' | 'interview' | 'example' | null {
  const clean = text.replace(/[*`]/g, '').trim().toLowerCase();
  if (/^(💡\s*)?tip/i.test(clean)) return 'tip';
  if (/^(📝\s*)?(note|important)/i.test(clean)) return 'note';
  if (/^(⚠️\s*)?warning/i.test(clean)) return 'warning';
  if (/^(🎯\s*)?interview\s*tip/i.test(clean)) return 'interview';
  if (/^(example)\s*\d*:?/i.test(clean)) return 'example';
  return null;
}

function stripCalloutPrefix(text: string): string {
  return text.replace(/^(💡|📝|⚠️|🎯)?\s*(Tip|Note|Important|Warning|Interview Tip|Example\s*\d*)\s*:?\s*/i, '');
}

function getCodeLanguage(className: string): string {
  const langMatch = className.match(/language-(\w+)/);
  if (langMatch) return langMatch[1];
  const codeText = className.match(/lang-(\w+)/);
  if (codeText) return codeText[1];
  return '';
}

const headingIdCounter = { current: 0 };

function processHTMLToReact(
  html: string,
  headings: Heading[],
  headingIdSet: Set<string>
): React.ReactNode {
  const div = document.createElement('div');
  div.innerHTML = sanitizeHTML(html);

  function getElementText(el: ChildNode): string {
    if (el.nodeType === Node.TEXT_NODE) return el.textContent || '';
    if (el.nodeType === Node.ELEMENT_NODE) {
      const element = el as HTMLElement;
      return Array.from(element.childNodes).map(getElementText).join('');
    }
    return '';
  }

  function renderElement(el: ChildNode): React.ReactNode {
    if (el.nodeType === Node.TEXT_NODE) {
      const text = el.textContent || '';
      if (!text.trim()) return null;
      return <>{parseInlineFormatting(text)}</>;
    }

    if (el.nodeType !== Node.ELEMENT_NODE) return null;
    const element = el as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'br') return <br />;
    if (tag === 'img') {
      return (
        <div className="my-6">
          <img
            src={element.getAttribute('src') || ''}
            alt={element.getAttribute('alt') || ''}
            loading="lazy"
            className="max-w-full rounded-xl shadow-md"
          />
        </div>
      );
    }
    if (tag === 'a') {
      return (
        <a
          href={element.getAttribute('href') || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--page-accent)] underline decoration-2 decoration-[var(--page-accent)]/30 hover:decoration-[var(--page-accent)] transition-colors font-medium"
        >
          {Array.from(element.childNodes).map(renderElement)}
        </a>
      );
    }

    const children = Array.from(element.childNodes).map(renderElement).filter(Boolean);
    const fullText = getElementText(element);

    if (tag === 'pre') {
      const codeEl = element.querySelector('code');
      const codeText = codeEl?.textContent || element.textContent || '';
      const className = codeEl?.className || element.className || '';
      const lang = getCodeLanguage(className);

      return (
        <div className="relative group my-6 rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/90 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[11px] text-gray-400 ml-1.5 font-mono font-medium">{lang || 'code'}</span>
            </div>
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(codeText);
                const btn = e.currentTarget;
                const original = btn.innerHTML;
                btn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5"/></svg> Copied!';
                setTimeout(() => { btn.innerHTML = original; }, 2000);
              }}
              className="text-[11px] text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600 px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            language={lang || 'text'}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              fontSize: '0.8125rem',
              lineHeight: '1.65',
              borderRadius: 0,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
            showLineNumbers={codeText.split('\n').length > 3}
            wrapLines={false}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      );
    }

    const calloutType = getCalloutType(fullText);
    if (calloutType && (tag === 'p' || tag === 'blockquote' || tag === 'div')) {
      const strippedText = stripCalloutPrefix(fullText);
      return (
        <Callout type={calloutType}>
          {strippedText ? <>{parseInlineFormatting(strippedText)}</> : children}
        </Callout>
      );
    }

    if (tag === 'table') {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-[var(--page-border)] shadow-sm">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      );
    }

    if (tag === 'thead') {
      return <thead className="bg-[var(--page-section)]">{children}</thead>;
    }

    if (tag === 'th') {
      return (
        <th className="px-4 py-3 text-left text-xs font-bold text-[var(--page-text-muted)] uppercase tracking-wider border-b-2 border-[var(--page-border)] bg-[var(--page-section)]">
          {children}
        </th>
      );
    }

    if (tag === 'td') {
      return (
        <td className="px-4 py-3 text-sm text-[var(--page-text)] border-b border-[var(--page-border)] last:border-b-0">
          {children}
        </td>
      );
    }

    if (tag === 'tr') {
      return <tr className="hover:bg-[var(--page-section)]/50 transition-colors">{children}</tr>;
    }

    if (tag === 'blockquote') {
      return (
        <div className="relative my-6 pl-5 py-4 border-l-4 border-[var(--page-accent)] bg-[var(--page-accent-soft)] rounded-r-xl">
          <div className="text-[var(--page-text-muted)] italic leading-relaxed text-sm">
            {children}
          </div>
        </div>
      );
    }

    if (tag === 'ul') {
      return (
        <ul className="list-disc pl-6 mb-5 space-y-2 text-[15.5px] leading-relaxed marker:text-[var(--page-accent)]">
          {children}
        </ul>
      );
    }

    if (tag === 'ol') {
      return (
        <ol className="list-decimal pl-6 mb-5 space-y-2 text-[15.5px] leading-relaxed marker:font-semibold marker:text-[var(--page-text-muted)]">
          {children}
        </ol>
      );
    }

    if (tag === 'li') {
      return <li className="text-[var(--page-text)] pl-1">{children}</li>;
    }

    if (tag === 'h2' || tag === 'h3') {
      const level = tag === 'h2' ? 2 : 3;
      const text = fullText;
      let id = slugify(text);
      if (headingIdSet.has(id)) {
        id = `${id}-${headingIdCounter.current++}`;
      }
      headingIdSet.add(id);
      headings.push({ id, text, level });

      if (tag === 'h2') {
        return (
          <h2
            id={id}
            className="text-2xl font-bold text-[var(--page-text)] mt-10 mb-5 tracking-tight font-[Plus_Jakarta_Sans,system-ui] scroll-mt-24"
          >
            {children}
          </h2>
        );
      }
      return (
        <h3
          id={id}
          className="text-xl font-bold text-[var(--page-text)] mt-8 mb-4 tracking-tight font-[Plus_Jakarta_Sans,system-ui] scroll-mt-24"
        >
          {children}
        </h3>
      );
    }

    if (tag === 'h1') {
      return (
        <h1 className="text-3xl font-bold text-[var(--page-text)] mt-6 mb-6 tracking-tight font-[Plus_Jakarta_Sans,system-ui]">
          {children}
        </h1>
      );
    }

    if (tag === 'h4') {
      return (
        <h4 className="text-lg font-bold text-[var(--page-text)] mt-6 mb-3 tracking-tight">
          {children}
        </h4>
      );
    }

    if (tag === 'p') {
      return <p className="text-[var(--page-text)] leading-relaxed mb-4 text-base">{children}</p>;
    }

    if (tag === 'strong' || tag === 'b') {
      return <strong className="font-bold text-[var(--page-text)]">{children}</strong>;
    }

    if (tag === 'em' || tag === 'i') {
      return <em className="italic">{children}</em>;
    }

    if (tag === 'code') {
      const parentTag = element.parentElement?.tagName.toLowerCase();
      if (parentTag === 'pre') return <>{children}</>;
      return (
        <code className="px-1.5 py-0.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-md text-[0.875em] font-['IBM_Plex_Mono',monospace] font-medium break-words">
          {children}
        </code>
      );
    }

    if (tag === 'hr') {
      return <hr className="border-none h-px bg-gradient-to-r from-transparent via-[var(--page-border)] to-transparent my-10" />;
    }

    return createElement(tag, {}, children);
  }

  return <>{Array.from(div.childNodes).map((child, i) => <React.Fragment key={i}>{renderElement(child)}</React.Fragment>)}</>;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '', onHeadings }) => {
  const rendered = useMemo(() => {
    if (!content) return null;

    if (content.includes('<') && content.includes('>')) {
      try {
        const headings: Heading[] = [];
        const headingIdSet = new Set<string>();
        headingIdCounter.current = 0;
        const node = processHTMLToReact(content, headings, headingIdSet);
        if (onHeadings) {
          onHeadings(headings);
        }
        return node;
      } catch {
        return <p className="text-[var(--page-text)] leading-relaxed text-base">{content}</p>;
      }
    }

    return <p className="text-[var(--page-text)] leading-relaxed text-base">{parseInlineFormatting(content)}</p>;
  }, [content, onHeadings]);

  return (
    <div className={`rich-text-content ${className}`}>
      {rendered}
    </div>
  );
};

export type { Heading };
export default React.memo(RichTextRenderer);
