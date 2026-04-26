/**
 * Centralized API client for the Team Budget Tracker backend.
 *
 * - Axios instance with base URL and JWT interceptor
 * - Typed methods for every endpoint
 * - Auto-attaches token from AsyncStorage
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken } from './storage';

// Change this to your server URL
// For Expo Go on physical device, use your computer's local IP (e.g. 192.168.x.x)
// For emulator, use 10.0.2.2 (Android) or localhost (iOS)
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'http://localhost:5000/api';

// Override for physical device — set your computer's IP here
// const BASE_URL = 'http://192.168.x.x:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  getMe: () => api.get('/auth/me'),
};

// ─── Teams ───────────────────────────────────────────────────────────────────

export const teamsAPI = {
  create: (name: string) => api.post('/teams', { name }),

  join: (inviteCode: string) => api.post('/teams/join', { inviteCode }),

  get: (id: string) => api.get(`/teams/${id}`),

  updateBudgets: (id: string, budgets: Record<string, number>) =>
    api.put(`/teams/${id}/budgets`, { budgets }),

  leave: () => api.post('/teams/leave'),
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export interface CreateExpensePayload {
  amount: number;
  category: string;
  note?: string;
  dateTime?: string;
  memberId?: string;
  memberName?: string;
  receiptUrl?: string | null;
}

export const expensesAPI = {
  list: (params?: { period?: string; member?: string; category?: string }) =>
    api.get('/expenses', { params }),

  create: (data: CreateExpensePayload) => api.post('/expenses', data),

  update: (id: string, data: Partial<CreateExpensePayload>) =>
    api.put(`/expenses/${id}`, data),

  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsAPI = {
  summary: (period?: string) => api.get('/analytics/summary', { params: { period } }),

  categoryBreakdown: (period?: string) =>
    api.get('/analytics/category-breakdown', { params: { period } }),

  memberBreakdown: (period?: string) =>
    api.get('/analytics/member-breakdown', { params: { period } }),

  monthlyTrend: () => api.get('/analytics/monthly-trend'),

  insights: () => api.get('/analytics/insights'),
};

export { api };
export default api;
