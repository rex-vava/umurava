import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsAPI } from '@/services/api';
import { JobsState, Job, DashboardStats } from '@/types';

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (params: { page?: number; limit?: number; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJob = createAsyncThunk(
  'jobs/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.getOne(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/create',
  async (data: Partial<Job>, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.create(data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ id, data }: { id: string; data: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.update(id, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await jobsAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'jobs/dashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobsAPI.getDashboardStats();
      return response.data.data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearCurrentJob(state) {
      state.currentJob = null;
    },
    clearJobError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all jobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.loading = false;
      state.jobs = action.payload.data.jobs;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch single job
    builder.addCase(fetchJob.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchJob.fulfilled, (state, action) => {
      state.loading = false;
      state.currentJob = action.payload.job;
    });
    builder.addCase(fetchJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create job
    builder.addCase(createJob.fulfilled, (state, action) => {
      state.jobs.unshift(action.payload.job);
    });

    // Update job
    builder.addCase(updateJob.fulfilled, (state, action) => {
      const index = state.jobs.findIndex((j) => j._id === action.payload.job._id);
      if (index !== -1) {
        state.jobs[index] = action.payload.job;
      }
      if (state.currentJob?._id === action.payload.job._id) {
        state.currentJob = action.payload.job;
      }
    });

    // Delete job
    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter((j) => j._id !== action.payload);
    });
  },
});

export const { clearCurrentJob, clearJobError } = jobsSlice.actions;
export default jobsSlice.reducer;
