import { createSlice } from '@reduxjs/toolkit';

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addToast: (state, action) => {
      toastId += 1;
      state.toasts.push({
        id: toastId,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 4000,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, addToast, removeToast } =
  uiSlice.actions;
export default uiSlice.reducer;
