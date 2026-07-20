import React from 'react';
import { FiType, FiMonitor, FiAlignLeft, FiMinimize2, FiRotateCcw, FiDownload, FiUpload, FiMaximize2 } from 'react-icons/fi';

interface EditorToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  minimap: boolean;
  onMinimapToggle: () => void;
  keybindMode: string;
  onKeybindModeChange: (mode: string) => void;
  onFormatCode: () => void;
  onResetCode: () => void;
  onDownloadCode: () => void;
  onUploadCode: () => void;
  onFullscreen?: () => void;
}

const THEMES = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'vs-light', label: 'Light' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github', label: 'GitHub' },
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  fontSize, onFontSizeChange, theme, onThemeChange, wordWrap, onWordWrapToggle,
  minimap, onMinimapToggle, keybindMode, onKeybindModeChange,
  onFormatCode, onResetCode, onDownloadCode, onUploadCode, onFullscreen,
}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-light-card dark:bg-dark-card border-b border-border-subtle dark:border-dark-border overflow-x-auto">
      {/* Font Size */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <FiType className="w-3 h-3 text-light-textMuted dark:text-dark-muted" />
        <input
          type="number"
          min={10}
          max={32}
          value={fontSize}
          onChange={e => onFontSizeChange(parseInt(e.target.value) || 14)}
          className="w-10 px-1 py-0.5 text-[11px] bg-light-bg dark:bg-dark-bg border border-border-subtle dark:border-dark-border rounded text-light-text dark:text-dark-text font-mono text-center"
        />
      </div>

      <div className="w-px h-3.5 bg-border-subtle dark:border-dark-border flex-shrink-0" />

      {/* Theme */}
      <select
        value={theme}
        onChange={e => onThemeChange(e.target.value)}
        className="px-1.5 py-0.5 text-[11px] bg-light-bg dark:bg-dark-bg border border-border-subtle dark:border-dark-border rounded text-light-text dark:text-dark-text"
      >
        {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {/* Keybind Mode */}
      <select
        value={keybindMode}
        onChange={e => onKeybindModeChange(e.target.value)}
        className="px-1.5 py-0.5 text-[11px] bg-light-bg dark:bg-dark-bg border border-border-subtle dark:border-dark-border rounded text-light-text dark:text-dark-text"
      >
        <option value="default">Default</option>
        <option value="vim">Vim</option>
        <option value="emacs">Emacs</option>
      </select>

      <div className="w-px h-3.5 bg-border-subtle dark:border-dark-border flex-shrink-0" />

      {/* Toggles */}
      <button
        onClick={onWordWrapToggle}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          wordWrap ? 'text-brand-primary bg-brand-primary/10' : 'text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
        }`}
      >
        <FiAlignLeft className="w-2.5 h-2.5" /> Wrap
      </button>
      <button
        onClick={onMinimapToggle}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
          minimap ? 'text-brand-primary bg-brand-primary/10' : 'text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
        }`}
      >
        <FiMonitor className="w-2.5 h-2.5" /> Map
      </button>

      <div className="w-px h-3.5 bg-border-subtle dark:border-dark-border flex-shrink-0" />

      <button onClick={onFormatCode} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors" title="Format">
        <FiMinimize2 className="w-2.5 h-2.5" /> Format
      </button>
      <button onClick={onResetCode} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors" title="Reset">
        <FiRotateCcw className="w-2.5 h-2.5" /> Reset
      </button>

      <div className="flex-1" />

      {onFullscreen && (
        <button onClick={onFullscreen} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors" title="Fullscreen">
          <FiMaximize2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
};

export default React.memo(EditorToolbar);
