import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DsaWorkspaceState {
  title: string;
  subtitle: string;
  companies: string[];
}

const STORAGE_KEY = 'dsa_workspace_config';

const DEFAULT_TITLE = 'Top 50 DSA Problems for Product Companies';
const DEFAULT_SUBTITLE = 'Master data structures and algorithms through curated problem sets designed for top-tier product company interviews.';
const DEFAULT_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Stripe', 'Twitter', 'Atlassian', 'Salesforce', 'Adobe', 'Bloomberg', 'LinkedIn', 'Walmart'];

function loadFromStorage(): DsaWorkspaceState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        title: parsed.title || DEFAULT_TITLE,
        subtitle: parsed.subtitle || DEFAULT_SUBTITLE,
        companies: Array.isArray(parsed.companies) && parsed.companies.length > 0 ? parsed.companies : DEFAULT_COMPANIES,
      };
    }
  } catch {}
  return getDefaults();
}

function getDefaults(): DsaWorkspaceState {
  return {
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    companies: [...DEFAULT_COMPANIES],
  };
}

function saveToStorage(state: DsaWorkspaceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      title: state.title,
      subtitle: state.subtitle,
      companies: state.companies,
    }));
  } catch {}
}

const initialState: DsaWorkspaceState = loadFromStorage();

const dsaWorkspaceSlice = createSlice({
  name: 'dsaWorkspace',
  initialState,
  reducers: {
    setWorkspaceTitle(state, action: PayloadAction<string>) {
      state.title = action.payload || DEFAULT_TITLE;
      saveToStorage(state);
    },
    setWorkspaceSubtitle(state, action: PayloadAction<string>) {
      state.subtitle = action.payload || DEFAULT_SUBTITLE;
      saveToStorage(state);
    },
    setWorkspaceCompanies(state, action: PayloadAction<string[]>) {
      state.companies = action.payload.length > 0 ? action.payload : [...DEFAULT_COMPANIES];
      saveToStorage(state);
    },
    resetWorkspaceConfig() {
      const defaults = getDefaults();
      saveToStorage(defaults);
      return defaults;
    },
  },
});

export const {
  setWorkspaceTitle,
  setWorkspaceSubtitle,
  setWorkspaceCompanies,
  resetWorkspaceConfig,
} = dsaWorkspaceSlice.actions;

export type { DsaWorkspaceState };
export default dsaWorkspaceSlice.reducer;
