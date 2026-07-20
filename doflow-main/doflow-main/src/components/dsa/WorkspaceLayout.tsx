import React, { useState, useCallback } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiTerminal } from 'react-icons/fi';

interface WorkspaceLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  consoleDrawer?: React.ReactNode;
  consoleDrawerOpen?: boolean;
  onConsoleDrawerToggle?: () => void;
  consoleDrawerHeight?: number;
  aiDrawer?: React.ReactNode;
  aiDrawerOpen?: boolean;
  onAiDrawerToggle?: () => void;
  defaultLeftSize?: number;
  defaultCenterSize?: number;
  defaultRightSize?: number;
  minLeft?: number;
  maxLeft?: number;
  minCenter?: number;
  minRight?: number;
}

const ResizeHandleVertical: React.FC = () => (
  <Separator className="group relative w-[3px] bg-transparent hover:bg-brand-primary/20 dark:hover:bg-brand-primary/20 transition-colors duration-200 flex items-center justify-center cursor-col-resize data-[resize-handle-active]:bg-brand-primary/30">
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-border-subtle dark:bg-dark-border group-hover:bg-brand-primary/40 rounded-full transition-all duration-200" />
  </Separator>
);

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
  consoleDrawer,
  consoleDrawerOpen = false,
  onConsoleDrawerToggle,
  consoleDrawerHeight = 35,
  aiDrawer,
  aiDrawerOpen = false,
  onAiDrawerToggle,
  defaultLeftSize = 20,
  defaultCenterSize = 35,
  defaultRightSize = 45,
  minLeft = 0,
  maxLeft = 28,
  minCenter = 22,
  minRight = 32,
}) => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const toggleLeftPanel = useCallback(() => {
    setLeftCollapsed(prev => !prev);
  }, []);

  return (
    <Group
      direction="horizontal"
      id="coding-workspace-horizontal"
      className="h-full w-full"
    >
      {/* Left Sidebar */}
      <Panel
        defaultSize={`${defaultLeftSize}%`}
        minSize={leftCollapsed ? '0%' : `${minLeft}%`}
        maxSize={`${maxLeft}%`}
        id="left-panel"
      >
        <div className="h-full flex">
          <div className={`flex-1 min-w-0 overflow-hidden transition-[width] duration-200 ${leftCollapsed ? 'w-0' : ''}`}>
            {leftPanel}
          </div>
          <button
            onClick={toggleLeftPanel}
            className="flex-shrink-0 w-[16px] border-l border-border-subtle dark:border-dark-border bg-light-bg dark:bg-dark-bg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt flex flex-col items-center justify-center transition-colors group"
            title={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {leftCollapsed
              ? <FiChevronRight className="w-2.5 h-2.5 text-light-textMuted dark:text-dark-muted group-hover:text-light-text dark:group-hover:text-dark-text transition-colors" />
              : <FiChevronLeft className="w-2.5 h-2.5 text-light-textMuted dark:text-dark-muted group-hover:text-light-text dark:group-hover:text-dark-text transition-colors" />
            }
          </button>
        </div>
      </Panel>

      {!leftCollapsed && <ResizeHandleVertical />}

      {/* Center - Problem Description */}
      <Panel
        defaultSize={`${defaultCenterSize}%`}
        minSize={`${minCenter}%`}
        id="center-panel"
      >
        {centerPanel}
      </Panel>

      <ResizeHandleVertical />

      {/* Right - Editor + Console Drawer Overlay */}
      <Panel
        defaultSize={`${defaultRightSize}%`}
        minSize={`${minRight}%`}
        id="right-panel"
        className="relative"
      >
        {/* Editor - full height */}
        {rightPanel}

        {/* Console Drawer - slides up from bottom */}
        {consoleDrawer && (
          <>
            {/* Console Toggle Bar */}
            <div
              onClick={onConsoleDrawerToggle}
              className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-light-card dark:bg-dark-card border-t border-border-subtle dark:border-dark-border cursor-pointer hover:bg-light-cardAlt/50 dark:hover:bg-dark-cardAlt/50 transition-colors select-none"
              style={{ display: consoleDrawerOpen ? 'none' : 'flex' }}
            >
              <div className="flex items-center gap-1.5">
                <FiTerminal className="w-3 h-3 text-light-textMuted dark:text-dark-muted" />
                <span className="text-[10px] font-semibold text-light-textSecondary dark:text-dark-muted">Console</span>
              </div>
              <FiChevronUp className="w-3 h-3 text-light-textMuted dark:text-dark-muted" />
            </div>

            {/* Console Drawer Panel */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-20 bg-light-card dark:bg-dark-card border-t border-border-subtle dark:border-dark-border transition-transform duration-300 ease-expo overflow-hidden ${
                consoleDrawerOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
              style={{ height: `${consoleDrawerHeight}%` }}
            >
              {/* Draggable Handle */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-brand-primary/0 hover:bg-brand-primary/30 dark:hover:bg-brand-primary/30 transition-colors cursor-row-resize z-10"
                title="Drag to resize"
              />

              {/* Close Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-1.5">
                  <FiTerminal className="w-3 h-3 text-brand-primary" />
                  <span className="text-[10px] font-bold text-light-text dark:text-dark-text uppercase tracking-wider">Console</span>
                </div>
                <button
                  onClick={onConsoleDrawerToggle}
                  className="p-0.5 rounded text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors"
                >
                  <FiChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-[calc(100%-32px)] overflow-y-auto scrollbar-thin">
                {consoleDrawer}
              </div>
            </div>
          </>
        )}

        {/* AI Drawer Overlay */}
        {aiDrawer && (
          <div
            className={`absolute inset-y-0 right-0 z-30 w-[380px] border-l border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card shadow-[0_0_40px_rgba(0,0,0,0.12)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-expo overflow-hidden ${
              aiDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {aiDrawer}
          </div>
        )}
      </Panel>
    </Group>
  );
};

export default React.memo(WorkspaceLayout);
