import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type EditorTheme = 'vs-dark' | 'vs-light' | 'monokai' | 'github' | 'dracula';
export type KeybindMode = 'default' | 'vim' | 'emacs';
export type AppTheme = 'light' | 'dark';

interface WorkspaceState {
  appTheme: AppTheme;
  editorFontSize: number;
  editorTheme: EditorTheme;
  keybindMode: KeybindMode;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  tabSize: number;
  sidebarWidth: number;
  showExecutionPanel: boolean;
  executionPanelHeight: number;
  favoriteProblems: string[];
  searchQuery: string;
  difficultyFilter: string | null;
}

const initialState: WorkspaceState = {
  appTheme: 'light',
  editorFontSize: 14,
  editorTheme: 'vs-dark',
  keybindMode: 'default',
  wordWrap: false,
  minimap: true,
  autoSave: true,
  tabSize: 4,
  sidebarWidth: 320,
  showExecutionPanel: true,
  executionPanelHeight: 300,
  favoriteProblems: [],
  searchQuery: '',
  difficultyFilter: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setAppTheme(state, action: PayloadAction<AppTheme>) {
      state.appTheme = action.payload;
    },
    setEditorFontSize(state, action: PayloadAction<number>) {
      state.editorFontSize = Math.max(10, Math.min(32, action.payload));
    },
    setEditorTheme(state, action: PayloadAction<EditorTheme>) {
      state.editorTheme = action.payload;
    },
    setKeybindMode(state, action: PayloadAction<KeybindMode>) {
      state.keybindMode = action.payload;
    },
    toggleWordWrap(state) {
      state.wordWrap = !state.wordWrap;
    },
    toggleMinimap(state) {
      state.minimap = !state.minimap;
    },
    toggleAutoSave(state) {
      state.autoSave = !state.autoSave;
    },
    setTabSize(state, action: PayloadAction<number>) {
      state.tabSize = action.payload;
    },
    setSidebarWidth(state, action: PayloadAction<number>) {
      state.sidebarWidth = Math.max(240, Math.min(480, action.payload));
    },
    toggleExecutionPanel(state) {
      state.showExecutionPanel = !state.showExecutionPanel;
    },
    setExecutionPanelHeight(state, action: PayloadAction<number>) {
      state.executionPanelHeight = Math.max(100, Math.min(600, action.payload));
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.favoriteProblems.indexOf(id);
      if (idx >= 0) {
        state.favoriteProblems.splice(idx, 1);
      } else {
        state.favoriteProblems.push(id);
      }
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setDifficultyFilter(state, action: PayloadAction<string | null>) {
      state.difficultyFilter = action.payload;
    },
  },
});

export const {
  setAppTheme,
  setEditorFontSize,
  setEditorTheme,
  setKeybindMode,
  toggleWordWrap,
  toggleMinimap,
  toggleAutoSave,
  setTabSize,
  setSidebarWidth,
  toggleExecutionPanel,
  setExecutionPanelHeight,
  toggleFavorite,
  setSearchQuery,
  setDifficultyFilter,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
