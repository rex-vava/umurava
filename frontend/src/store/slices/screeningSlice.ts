import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { screeningAPI } from '@/services/api';
import { ScreeningState } from '@/types';

const initialState: ScreeningState = {
  screenings: [],
  currentScreening: null,
  shortlist: [],
  comparison: null,
  loading: false,
  screening: false,
  error: null,
};

export const screenCandidate = createAsyncThunk(
  'screening/screenOne',
  async (candidateId: string, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.screenCandidate(candidateId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Screening failed');
    }
  }
);

export const screenAllCandidates = createAsyncThunk(
  'screening/screenAll',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.screenAll(jobId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Bulk screening failed');
    }
  }
);

export const fetchScreeningResults = createAsyncThunk(
  'screening/fetchResults',
  async ({ jobId, sortBy, order }: { jobId: string; sortBy?: string; order?: string }, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getResults(jobId, { sortBy, order });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const fetchScreeningDetail = createAsyncThunk(
  'screening/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getDetail(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch screening detail');
    }
  }
);

export const fetchShortlist = createAsyncThunk(
  'screening/fetchShortlist',
  async ({ jobId, minScore, limit }: { jobId: string; minScore?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await screeningAPI.getShortlist(jobId, { minScore, limit });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shortlist');
    }
  }
);

export const compareCandidates = createAsyncThunk(
  'screening/compare',
  async (candidateIds: string[], { rejectWithValue }) => {
    try {
      const response = await screeningAPI.compare(candidateIds);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Comparison failed');
    }
  }
);

const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {
    clearScreeningError(state) {
      state.error = null;
    },
    clearCurrentScreening(state) {
      state.currentScreening = null;
    },
  },
  extraReducers: (builder) => {
    // Screen single candidate
    builder.addCase(screenCandidate.pending, (state) => {
      state.screening = true;
      state.error = null;
    });
    builder.addCase(screenCandidate.fulfilled, (state, action) => {
      state.screening = false;
      state.currentScreening = action.payload.screening;
    });
    builder.addCase(screenCandidate.rejected, (state, action) => {
      state.screening = false;
      state.error = action.payload as string;
    });

    // Screen all
    builder.addCase(screenAllCandidates.pending, (state) => {
      state.screening = true;
      state.error = null;
    });
    builder.addCase(screenAllCandidates.fulfilled, (state) => {
      state.screening = false;
    });
    builder.addCase(screenAllCandidates.rejected, (state, action) => {
      state.screening = false;
      state.error = action.payload as string;
    });

    // Fetch results
    builder.addCase(fetchScreeningResults.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchScreeningResults.fulfilled, (state, action) => {
      state.loading = false;
      state.screenings = action.payload.screenings;
    });
    builder.addCase(fetchScreeningResults.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch detail
    builder.addCase(fetchScreeningDetail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchScreeningDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentScreening = action.payload.screening;
    });
    builder.addCase(fetchScreeningDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Shortlist
    builder.addCase(fetchShortlist.fulfilled, (state, action) => {
      state.shortlist = action.payload.shortlist;
    });

    // Candidate comparison
    builder.addCase(compareCandidates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(compareCandidates.fulfilled, (state, action) => {
      state.loading = false;
      state.comparison = action.payload;
    });
    builder.addCase(compareCandidates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearScreeningError, clearCurrentScreening } = screeningSlice.actions;
export default screeningSlice.reducer;
