import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import api from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

type PlaygroundResult = {
  status?: { id?: number; description?: string } | null;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  executionTimeMs?: number | null;
  memoryKb?: number | null;
  __autofixApplied?: boolean;
};

type Props = {
  language: 'c' | 'cpp';
  initialCode: string;
  headerLabel?: string;
};

const guessCHeaders = (source: string) => {
  const s = source;
  const headers = new Set<string>();
  // Always keep stdio for printf/scanf/basic IO.
  headers.add('#include <stdio.h>');

  if (/\bmalloc\b|\bfree\b|\bcalloc\b|\brealloc\b/.test(s)) headers.add('#include <stdlib.h>');
  if (/\bstrlen\b|\bstrcpy\b|\bstrncpy\b|\bstrcmp\b|\bstrcat\b|\bmemset\b|\bmemcpy\b/.test(s)) headers.add('#include <string.h>');
  if (/\bbool\b|\btrue\b|\bfalse\b/.test(s)) headers.add('#include <stdbool.h>');
  if (/\bINT_(MIN|MAX)\b|\bCHAR_(MIN|MAX)\b/.test(s)) headers.add('#include <limits.h>');
  if (/\bsize_t\b/.test(s)) headers.add('#include <stddef.h>');

  return Array.from(headers);
};

const hasMainFunction = (source: string) => /\bmain\s*\(/.test(source);

const looksLikeTopLevelDefinitions = (source: string) => {
  // Heuristic: function definitions / type definitions
  if (/\b(typedef|struct|union|enum)\b/.test(source)) return true;
  if (/\b#define\b/.test(source)) return true;
  if (/\b(static\s+)?(void|int|char|short|long|float|double|unsigned|signed)\s+\w+\s*\([^;]*\)\s*\{/.test(source)) return true;
  return false;
};

const ensureCCompilable = (rawSource: string) => {
  const source = String(rawSource || '').trim();
  if (!source) return source;

  const sanitized = source
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return line;

      // Notes sometimes include expected output inside the fence.
      if (/^(output|expected\s*output|sample\s*output)\b/i.test(t)) return `// ${line}`;
      // Dots or placeholders are not valid C.
      if (/^\.{3,}$/.test(t)) return `// ${line}`;
      // Common prose lines inside snippets.
      if (/^ex\b\s*:/i.test(t)) return `// ${line}`;
      return line;
    })
    .join('\n');

  const alreadyHasIncludes = /^\s*#\s*include\b/m.test(sanitized);
  const headers = alreadyHasIncludes ? [] : guessCHeaders(sanitized);

  // If it's only a snippet of statements, wrap into main.
  const hasMain = hasMainFunction(sanitized);
  const hasTopLevelDefs = looksLikeTopLevelDefinitions(sanitized);

  const prelude = headers.length ? headers.join('\n') + '\n\n' : '';

  if (hasMain) {
    return prelude + sanitized;
  }

  if (hasTopLevelDefs) {
    // Keep defs at top-level and add a stub main.
    return `${prelude}${sanitized}\n\nint main(void) {\n  return 0;\n}\n`;
  }

  // Otherwise, treat as statements.
  const indented = sanitized
    .split(/\r?\n/)
    .map((l) => (l.trim().length ? `  ${l}` : l))
    .join('\n');
  return `${prelude}int main(void) {\n${indented}\n  return 0;\n}\n`;
};

const formatOutput = (result: PlaygroundResult) => {
  const parts: string[] = [];
  const headerBits: string[] = [];

  const statusDesc = result?.status?.description;
  if (statusDesc) headerBits.push(statusDesc);
  if (result?.__autofixApplied) headerBits.push('auto-fix applied');
  if (typeof result?.executionTimeMs === 'number') headerBits.push(`${result.executionTimeMs}ms`);
  if (typeof result?.memoryKb === 'number') headerBits.push(`${result.memoryKb}KB`);

  if (headerBits.length) parts.push(headerBits.join(' · '));

  if (result?.compileOutput?.trim()) {
    parts.push('\n[compile]\n' + result.compileOutput.trim());
  }
  if (result?.stderr?.trim()) {
    parts.push('\n[stderr]\n' + result.stderr.trim());
  }
  if (result?.stdout?.trim()) {
    parts.push('\n[stdout]\n' + result.stdout.trim());
  }
  if (!result?.stdout?.trim() && !result?.stderr?.trim() && !result?.compileOutput?.trim()) {
    const msg = result?.message?.trim();
    parts.push(msg ? `\n${msg}` : '\n(no output)');
  }

  return parts.join('\n').trim();
};

const looksLikeCompilationError = (result: PlaygroundResult) => {
  const status = String(result?.status?.description || '').toLowerCase();
  if (status.includes('compilation')) return true;
  if (String(result?.compileOutput || '').trim()) return true;
  return false;
};

const wantsDeclarationAutofix = (compileOutput: string) => {
  const s = String(compileOutput || '').toLowerCase();
  return (
    s.includes('undeclared') ||
    s.includes('not declared') ||
    s.includes('implicit declaration') ||
    s.includes('was not declared in this scope')
  );
};

const injectCommonDeclarationsIntoMain = (preparedSource: string) => {
  const src = String(preparedSource || '');
  const mainRe = /\bint\s+main\s*\([^)]*\)\s*\{/m;
  const match = mainRe.exec(src);
  if (!match) return src;

  const insertionIndex = match.index + match[0].length;
  const before = src.slice(0, insertionIndex);
  const after = src.slice(insertionIndex);

  const hasDecl = (name: string) => {
    const re = new RegExp(`\\b(int|long|short|char|float|double|size_t|unsigned|signed)\\s+\\**\\s*${name}\\b`);
    const arrRe = new RegExp(`\\b(int|char|long|short|float|double)\\s+${name}\\s*\\[`);
    return re.test(src) || arrRe.test(src);
  };

  const uses = (re: RegExp) => re.test(src);

  const decls: string[] = [];

  // Common ints used in snippets
  const intNames = ['i', 'j', 'k', 'n', 'm', 'a', 'b', 'sum', 'count', 'x', 'y', 'temp'];
  for (const name of intNames) {
    if (!hasDecl(name) && uses(new RegExp(`\\b${name}\\b`))) {
      decls.push(`  int ${name} = 0;`);
    }
  }

  // Common arrays/strings
  if (!hasDecl('arr') && uses(/\barr\s*\[/)) decls.push('  int arr[100] = {0};');
  if (!hasDecl('s') && (uses(/\bscanf\b/) || uses(/\bprintf\b/)) && uses(/%s/)) decls.push('  char s[100] = {0};');
  if (!hasDecl('str') && uses(/\bstr\s*\[/)) decls.push('  char str[100] = {0};');

  // Pointers that appear often
  if (!hasDecl('p') && uses(/\bp\b/) && uses(/\*/)) {
    // Do not guess pointer types; skip.
  }

  if (!decls.length) return src;
  const banner = '  // Auto-added declarations for snippet compilation\n';
  return `${before}\n${banner}${decls.join('\n')}\n${after}`;
};

const RunnableCodeBlock: React.FC<Props> = ({ language, initialCode, headerLabel }) => {
  const { theme } = useTheme();
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const monacoTheme = useMemo(() => (theme === 'dark' ? 'vs-dark' : 'vs'), [theme]);

  const run = async () => {
    setIsRunning(true);
    setError('');
    try {
      const prepared = language === 'c' ? ensureCCompilable(code) : code;
      const res1 = await api.post('/playground/run', {
        language,
        sourceCode: prepared,
      });

      const data1: PlaygroundResult = res1.data || {};

      // Second-pass fix for snippet-style undeclared variables.
      if (language === 'c' && looksLikeCompilationError(data1) && wantsDeclarationAutofix(String(data1.compileOutput || ''))) {
        const prepared2 = injectCommonDeclarationsIntoMain(prepared);
        if (prepared2 !== prepared) {
          const res2 = await api.post('/playground/run', {
            language,
            sourceCode: prepared2,
          });
          const data2: PlaygroundResult = res2.data || {};
          data2.__autofixApplied = true;
          setOutput(formatOutput(data2));
          return;
        }
      }

      setOutput(formatOutput(data1));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to run code.';
      setError(String(msg));
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt overflow-hidden">
      <div className="px-4 py-2 text-xs text-light-textMuted dark:text-dark-muted border-b border-border-subtle dark:border-dark-border flex items-center justify-between">
        <div className="font-medium">{headerLabel || (language ? language.toUpperCase() : 'CODE')}</div>
        <button
          onClick={run}
          disabled={isRunning}
          className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-brand-primary dark:hover:border-brand-primary transition disabled:opacity-60"
        >
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>

      <div className="p-3">
        <div className="rounded-xl overflow-hidden border border-border-subtle dark:border-dark-border">
          <Editor
            height={220}
            defaultLanguage={language === 'cpp' ? 'cpp' : 'c'}
            theme={monacoTheme}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontFamily: 'IBM Plex Mono, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>

        {(error || output) && (
          <div className="mt-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-3">
            <div className="text-xs font-semibold text-light-text dark:text-dark-text">Output</div>
            {error ? (
              <div className="mt-2 text-sm text-brand-primary whitespace-pre-wrap">{error}</div>
            ) : (
              <pre className="mt-2 text-sm whitespace-pre-wrap leading-relaxed text-light-textSecondary dark:text-dark-muted">
                <code>{output}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunnableCodeBlock;
