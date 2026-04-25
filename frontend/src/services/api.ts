import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('skillpulse_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('skillpulse_token');
        localStorage.removeItem('skillpulse_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; company: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Jobs API
export const jobsAPI = {
  create: (data: any) => api.post('/jobs', data),
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/jobs', { params }),
  getOne: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  getDashboardStats: () => api.get('/jobs/dashboard/stats'),
};

// Candidates API
export const candidatesAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; jobId?: string; search?: string }) =>
    api.get('/candidates', { params }),
  getOne: (id: string) => api.get(`/candidates/${id}`),
  upload: (jobId: string, formData: FormData) =>
    api.post(`/candidates/job/${jobId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  bulkUpload: (jobId: string, formData: FormData) =>
    api.post(`/candidates/job/${jobId}/bulk-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/candidates/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/candidates/${id}`),
};

// Screening API
export const screeningAPI = {
  screenCandidate: (candidateId: string) =>
    api.post(`/screening/candidate/${candidateId}`),
  screenAll: (jobId: string) =>
    api.post(`/screening/job/${jobId}/all`),
  getResults: (jobId: string, params?: { sortBy?: string; order?: string }) =>
    api.get(`/screening/job/${jobId}`, { params }),
  getDetail: (id: string) => api.get(`/screening/${id}`),
  getShortlist: (jobId: string, params?: { minScore?: number; limit?: number }) =>
    api.get(`/screening/job/${jobId}/shortlist`, { params }),
  compare: (candidateIds: string[]) =>
    api.post('/screening/compare', { candidateIds }),
};

export default api;
