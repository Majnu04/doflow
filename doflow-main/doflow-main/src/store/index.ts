import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import wishlistReducer from './slices/wishlistSlice';
import cartReducer from './slices/cartSlice';
import dashboardReducer from './slices/dashboardSlice';
import adminReducer from './slices/adminSlice';
import dsaReducer from './slices/dsaSlice';
import problemEditorReducer from './slices/problemEditorSlice';
import gamificationReducer from './slices/gamificationSlice';
import workspaceReducer from './slices/workspaceSlice';
import dsaWorkspaceReducer from './slices/dsaWorkspaceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
    dsa: dsaReducer,
    problemEditor: problemEditorReducer,
    gamification: gamificationReducer,
    workspace: workspaceReducer,
    dsaWorkspace: dsaWorkspaceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
