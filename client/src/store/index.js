import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import progressReducer from './slices/progressSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    progress: progressReducer,
    ui: uiReducer,
    users: userReducer,
  },
  devTools: import.meta.env.DEV,
});
