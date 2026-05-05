import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await courseService.getAllCourses();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch courses'
      );
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await courseService.getCourseById(id);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch course'
      );
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await courseService.createCourse(formData);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create course'
      );
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await courseService.updateCourse(id, formData);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update course'
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await courseService.deleteCourse(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete course'
      );
    }
  }
);

// --- Admin Thunks ---
export const fetchPendingCourses = createAsyncThunk(
  'courses/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const data = await courseService.getPendingCourses();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending courses');
    }
  }
);

export const approveCourse = createAsyncThunk(
  'courses/approve',
  async (id, { rejectWithValue }) => {
    try {
      const data = await courseService.approveCourse(id);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve course');
    }
  }
);

export const rejectCourse = createAsyncThunk(
  'courses/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await courseService.rejectCourse(id, reason);
      return data.data || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject course');
    }
  }
);

export const adminDeleteCourse = createAsyncThunk(
  'courses/adminDelete',
  async (id, { rejectWithValue }) => {
    try {
      await courseService.adminDeleteCourse(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);



const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    pendingCourses: [],
    currentCourse: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearCourseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload || [];
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.courses = [];
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.courses.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) state.courses[index] = action.payload;
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
        if (state.currentCourse?._id === action.payload) {
          state.currentCourse = null;
        }
      })
      // Admin Reducers
      .addCase(fetchPendingCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPendingCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingCourses = action.payload;
      })
      .addCase(fetchPendingCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(approveCourse.fulfilled, (state, action) => {
        state.pendingCourses = state.pendingCourses.filter(c => c._id !== action.payload._id);
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        } else {
          state.courses.push(action.payload);
        }
      })
      .addCase(rejectCourse.fulfilled, (state, action) => {
        state.pendingCourses = state.pendingCourses.filter(c => c._id !== action.payload._id);
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      .addCase(adminDeleteCourse.fulfilled, (state, action) => {
        state.pendingCourses = state.pendingCourses.filter(c => c._id !== action.payload);
        state.courses = state.courses.filter(c => c._id !== action.payload);
      });
  },
});

export const { clearCurrentCourse, clearCourseError } = courseSlice.actions;
export default courseSlice.reducer;
