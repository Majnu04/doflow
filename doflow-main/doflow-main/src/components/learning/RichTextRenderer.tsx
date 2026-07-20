import React, { useMemo } from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
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
        parts.push(<strong key={key++} className="font-semibold text-[var(--page-text)]">{remaining.substring(earliest + 2, end)}</strong>);
        remaining = remaining.substring(end + 2);
      } else {
        parts.push(remaining.substring(earliest, earliest + 2));
        remaining = remaining.substring(earliest + 2);
      }
    } else if (matchType === 'italic') {
      const end = remaining.indexOf('*', earliest + 1);
      if (end !== -1 && remaining[end + 1] !== '*') {
        parts.push(<em key={key++} className="italic">{remaining.substring(earliest + 1, end)}</em>);
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

function renderNode(node: React.ReactNode): React.ReactNode {
  return node;
}

const TAG_STYLES: Record<string, string> = {
  h3: 'text-2xl font-bold text-[var(--page-text)] mt-8 mb-4 first:mt-0 tracking-tight font-[Plus_Jakarta_Sans,system-ui]',
  h4: 'text-xl font-bold text-[var(--page-text)] mt-6 mb-3 tracking-tight font-[Plus_Jakarta_Sans,system-ui]',
  p: 'text-[var(--page-text)] leading-[1.8] mb-4 text-[15.5px]',
  ul: 'list-disc pl-6 mb-4 space-y-2 text-[15.5px] leading-[1.8]',
  ol: 'list-decimal pl-6 mb-4 space-y-2 text-[15.5px] leading-[1.8]',
  li: 'text-[var(--page-text)]',
  blockquote: 'border-l-4 border-[var(--page-accent)] pl-5 py-3 my-6 bg-[var(--page-accent-soft)] rounded-r-xl text-[var(--page-text-muted)] italic',
  pre: 'bg-gray-900 text-gray-100 rounded-2xl p-5 my-6 overflow-x-auto font-["IBM_Plex_Mono",monospace] text-sm leading-relaxed shadow-lg border border-gray-800',
  code: 'font-["IBM_Plex_Mono",monospace]',
  table: 'w-full border-collapse my-6 rounded-xl overflow-hidden shadow-sm',
  thead: 'bg-[var(--page-section)]',
  th: 'px-4 py-3 text-left text-sm font-semibold text-[var(--page-text)] border-b-2 border-[var(--page-border)]',
  td: 'px-4 py-3 text-sm text-[var(--page-text)] border-b border-[var(--page-border)]',
  strong: 'font-semibold text-[var(--page-text)]',
  em: 'italic',
  a: 'text-[var(--page-accent)] underline decoration-2 decoration-[var(--page-accent)]/30 hover:decoration-[var(--page-accent)] transition-colors font-medium',
  img: 'max-w-full rounded-xl my-6 shadow-md',
  hr: 'border-none h-px bg-[var(--page-border)] my-8',
};

function processHTMLToReact(html: string): React.ReactNode {
  const div = document.createElement('div');
  div.innerHTML = sanitizeHTML(html);

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
      return <img src={element.getAttribute('src') || ''} alt={element.getAttribute('alt') || ''} loading="lazy" />;
    }
    if (tag === 'a') {
      return <a href={element.getAttribute('href') || '#'} target="_blank" rel="noopener noreferrer">{Array.from(element.childNodes).map(renderElement)}</a>;
    }

    const children = Array.from(element.childNodes).map(renderElement).filter(Boolean);

    if (tag === 'pre') {
      const codeEl = element.querySelector('code');
      const codeText = codeEl?.textContent || element.textContent || '';
      const className = codeEl?.className || '';
      const langMatch = className.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      return (
        <div className="relative group my-6">
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700/50 rounded-lg text-[10px] font-mono text-gray-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{lang}</div>
          <pre className="bg-gray-900 text-gray-100 rounded-2xl p-5 overflow-x-auto font-['IBM_Plex_Mono',monospace] text-sm leading-relaxed shadow-lg border border-gray-800">
            <code>{codeText}</code>
          </pre>
        </div>
      );
    }

    if (tag === 'table') {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-[var(--page-border)] shadow-sm">
          <table className="w-full border-collapse">{children}</table>
        </div>
      );
    }

    if (tag === 'th') {
      return <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--page-text)] bg-[var(--page-section)] border-b-2 border-[var(--page-border)]">{children}</th>;
    }

    if (tag === 'td') {
      return <td className="px-4 py-3 text-sm text-[var(--page-text)] border-b border-[var(--page-border)]">{children}</td>;
    }

    if (tag === 'blockquote') {
      return <blockquote className="border-l-4 border-[var(--page-accent)] pl-5 py-3 my-6 bg-[var(--page-accent-soft)] rounded-r-xl">{children}</blockquote>;
    }

    if (tag === 'ul') {
      return <ul className="list-disc pl-6 mb-4 space-y-2 text-[15.5px] leading-[1.8]">{children}</ul>;
    }

    if (tag === 'ol') {
      return <ol className="list-decimal pl-6 mb-4 space-y-2 text-[15.5px] leading-[1.8]">{children}</ol>;
    }

    if (tag === 'li') {
      return <li className="text-[var(--page-text)]">{children}</li>;
    }

    if (tag === 'h3') {
      return <h3 className="text-2xl font-bold text-[var(--page-text)] mt-8 mb-4 first:mt-0 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>{children}</h3>;
    }
    if (tag === 'h4') {
      return <h4 className="text-xl font-bold text-[var(--page-text)] mt-6 mb-3 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>{children}</h4>;
    }
    if (tag === 'p') {
      return <p className="text-[var(--page-text)] leading-[1.8] mb-4 text-[15.5px]">{children}</p>;
    }
    if (tag === 'strong' || tag === 'b') {
      return <strong className="font-semibold text-[var(--page-text)]">{children}</strong>;
    }
    if (tag === 'em' || tag === 'i') {
      return <em className="italic">{children}</em>;
    }
    if (tag === 'code') {
      const parentTag = element.parentElement?.tagName.toLowerCase();
      if (parentTag === 'pre') return <>{children}</>;
      return <code className="px-1.5 py-0.5 bg-[var(--page-accent-soft)] text-[var(--page-accent)] rounded-md text-[0.875em] font-['IBM_Plex_Mono',monospace] font-medium">{children}</code>;
    }
    if (tag === 'hr') return <hr className="border-none h-px bg-[var(--page-border)] my-8" />;
    if (tag === 'br') return <br />;

    return React.createElement(tag, { className: TAG_STYLES[tag] || '' }, children);
  }

  return <>{Array.from(div.childNodes).map((child, i) => <React.Fragment key={i}>{renderElement(child)}</React.Fragment>)}</>;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  const rendered = useMemo(() => {
    if (!content) return null;

    if (content.includes('<') && content.includes('>')) {
      try {
        return processHTMLToReact(content);
      } catch {
        return <p className="text-[var(--page-text)] leading-[1.8] text-[15.5px]">{content}</p>;
      }
    }

    return <p className="text-[var(--page-text)] leading-[1.8] text-[15.5px]">{parseInlineFormatting(content)}</p>;
  }, [content]);

  return (
    <div className={`rich-text-content ${className}`}>
      {rendered}
    </div>
  );
};

export default React.memo(RichTextRenderer);
