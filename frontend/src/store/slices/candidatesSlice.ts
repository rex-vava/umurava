import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidatesAPI } from '@/services/api';
import { CandidatesState } from '@/types';

const initialState: CandidatesState = {
  candidates: [],
  currentCandidate: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
};

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (params: { page?: number; limit?: number; status?: string; jobId?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await candidatesAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
    }
  }
);

export const fetchCandidate = createAsyncThunk(
  'candidates/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await candidatesAPI.getOne(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate');
    }
  }
);

export const uploadCandidate = createAsyncThunk(
  'candidates/upload',
  async ({ jobId, formData }: { jobId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await candidatesAPI.upload(jobId, formData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload candidate');
    }
  }
);

export const bulkUploadCandidates = createAsyncThunk(
  'candidates/bulkUpload',
  async ({ jobId, formData }: { jobId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await candidatesAPI.bulkUpload(jobId, formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk upload');
    }
  }
);

export const updateCandidateStatus = createAsyncThunk(
  'candidates/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await candidatesAPI.updateStatus(id, status);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearCurrentCandidate(state) {
      state.currentCandidate = null;
    },
    clearCandidateError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCandidates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCandidates.fulfilled, (state, action) => {
      state.loading = false;
      state.candidates = action.payload.data.candidates;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchCandidates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchCandidate.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCandidate.fulfilled, (state, action) => {
      state.loading = false;
      state.currentCandidate = action.payload.candidate;
    });
    builder.addCase(fetchCandidate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(uploadCandidate.fulfilled, (state, action) => {
      state.candidates.unshift(action.payload.candidate);
    });

    builder.addCase(updateCandidateStatus.fulfilled, (state, action) => {
      const index = state.candidates.findIndex((c) => c._id === action.payload.candidate._id);
      if (index !== -1) {
        state.candidates[index] = action.payload.candidate;
      }
    });
  },
});

export const { clearCurrentCandidate, clearCandidateError } = candidatesSlice.actions;
export default candidatesSlice.reducer;
