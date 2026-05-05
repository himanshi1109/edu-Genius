import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressService from '../../services/progressService';

export const enrollCourse = createAsyncThunk(
  'progress/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const data = await progressService.enrollCourse(courseId);
      return { courseId, data: data.data || data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to enroll'
      );
    }
  }
);

export const fetchProgress = createAsyncThunk(
  'progress/fetch',
  async (courseId, { rejectWithValue }) => {
    try {
      const data = await progressService.getProgress(courseId);
      return { courseId, data: data.data || data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch progress'
      );
    }
  }
);

export const fetchAllMyProgress = createAsyncThunk(
  'progress/fetchAllMy',
  async (_, { rejectWithValue }) => {
    try {
      const data = await progressService.getMyProgress();
      return data.data || data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all progress'
      );
    }
  }
);


export const updateProgress = createAsyncThunk(
  'progress/update',
  async ({ courseId, lessonId, state }, { rejectWithValue }) => {
    try {
      const data = await progressService.updateProgress(courseId, {
        lessonId,
        state,
      });
      return { courseId, data: data.data || data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update progress'
      );
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    progress: {},
    allProgress: [],
    isLoading: false,
    error: null,
  },

  reducers: {
    clearProgress: (state) => {
      state.progress = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enrollCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress[action.payload.courseId] = action.payload.data;
      })
      .addCase(enrollCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress[action.payload.courseId] = action.payload.data;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress[action.payload.courseId] = action.payload.data;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllMyProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllMyProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allProgress = action.payload;
        // Also update the individual progress map for consistency
        action.payload.forEach(p => {
          state.progress[p.courseId] = p;
        });
      })
      .addCase(fetchAllMyProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
