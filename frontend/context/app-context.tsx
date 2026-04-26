/**
 * Global application state for the Team Budget Tracker.
 *
 * API-backed version — all data comes from the Express backend.
 * Uses React Context + useReducer for local state + async functions for API calls.
 *
 * Features:
 * - Auth (login, register, auto-login from cached token)
 * - Team (create, join, leave)
 * - Expenses (CRUD via API)
 * - Analytics (fetched from server)
 * - Filters (period, member, category — applied client-side on cached data)
 * - Theme (dark mode persisted in AsyncStorage)
 */

import React, {
  createContext, useContext, useReducer, useMemo,
  useCallback, useEffect, type ReactNode,
} from 'react';
import { authAPI, teamsAPI, expensesAPI, analyticsAPI } from '@/services/api';
import {
  saveToken, removeToken, getToken,
  saveUser, getUser, removeUser,
  saveTeam, getTeam, removeTeam,
  saveDarkMode, getDarkMode, clearAll,
} from '@/services/storage';
import { CATEGORIES, TOTAL_BUDGET, type Category } from '@/constants/categories';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string | null;
  teamId: string | null;
}

export interface Team {
  _id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  budgets: Record<string, number>;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  note: string;
  dateTime: string;
  memberId: string;
  memberName: string;
  teamId: string;
  receiptUrl: string | null;
}

interface AppState {
  user: User | null;
  team: Team | null;
  members: User[];
  expenses: Expense[];
  budgets: Record<string, number>;
  isDarkMode: boolean;
  filterPeriod: FilterPeriod;
  filterMember: string | null;
  filterCategory: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'SET_TEAM'; payload: { team: Team; members: User[] } }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER_PERIOD'; payload: FilterPeriod }
  | { type: 'SET_FILTER_MEMBER'; payload: string | null }
  | { type: 'SET_FILTER_CATEGORY'; payload: string | null }
  | { type: 'SET_BUDGETS'; payload: Record<string, number> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED' };

export interface CategoryBreakdownItem extends Category {
  amount: number;
  percentage: number;
  budgetUsed: number;
}

export interface MemberBreakdownItem {
  memberId: string;
  name: string;
  amount: number;
  count: number;
}

export interface MonthlyTrendItem {
  month: string;
  amount: number;
}

export interface Insight {
  type: string;
  icon: string;
  message: string;
  color: string;
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  // Computed
  filteredExpenses: Expense[];
  totalSpend: number;
  monthlySpend: number;
  categoryBreakdown: CategoryBreakdownItem[];
  memberBreakdown: MemberBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  insights: Insight[];
  budgetPercentage: number;
  totalBudget: number;
  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  joinTeam: (code: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  addExpense: (data: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchTeamData: () => Promise<void>;
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: AppState = {
  user: null,
  team: null,
  members: [],
  expenses: [],
  budgets: CATEGORIES.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.name]: c.budget }), {}),
  isDarkMode: false,
  filterPeriod: 'monthly',
  filterMember: null,
  filterCategory: null,
  isLoggedIn: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.payload.user, isLoggedIn: true, error: null };
    case 'SET_TEAM':
      return {
        ...state,
        team: action.payload.team,
        members: action.payload.members,
        budgets: action.payload.team.budgets || state.budgets,
      };
    case 'LOGOUT':
      return { ...initialState, isInitialized: true, isLoading: false, isDarkMode: state.isDarkMode };
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_DARK_MODE':
      return { ...state, isDarkMode: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e._id === action.payload._id ? action.payload : e),
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e._id !== action.payload) };
    case 'SET_FILTER_PERIOD':
      return { ...state, filterPeriod: action.payload };
    case 'SET_FILTER_MEMBER':
      return { ...state, filterMember: action.payload };
    case 'SET_FILTER_CATEGORY':
      return { ...state, filterCategory: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, isLoading: false };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ─── Auth actions ────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.login(email, password);
      await saveToken(data.token);
      await saveUser(data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: data.user, token: data.token } });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.register(name, email, password);
      await saveToken(data.token);
      await saveUser(data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: data.user, token: data.token } });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAll();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const initAuth = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        dispatch({ type: 'SET_INITIALIZED' });
        return;
      }

      // Try to verify token with server
      const { data } = await authAPI.getMe();
      await saveUser(data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: data.user, token } });

      // Load dark mode preference
      const dark = await getDarkMode();
      dispatch({ type: 'SET_DARK_MODE', payload: dark });

      dispatch({ type: 'SET_INITIALIZED' });
    } catch {
      // Token expired or invalid — clear and go to login
      await clearAll();
      dispatch({ type: 'SET_INITIALIZED' });
    }
  }, []);

  // ─── Team actions ────────────────────────────────────────────────────────

  const createTeam = useCallback(async (name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await teamsAPI.create(name);
      await saveToken(data.token);
      await saveTeam(data.team);

      // Refresh user data
      const meRes = await authAPI.getMe();
      await saveUser(meRes.data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: meRes.data.user, token: data.token } });

      // Fetch team data
      const teamRes = await teamsAPI.get(data.team._id);
      dispatch({ type: 'SET_TEAM', payload: { team: teamRes.data.team, members: teamRes.data.members } });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create team';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const joinTeam = useCallback(async (code: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await teamsAPI.join(code);
      await saveToken(data.token);
      await saveTeam(data.team);

      // Refresh user data
      const meRes = await authAPI.getMe();
      await saveUser(meRes.data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: meRes.data.user, token: data.token } });

      // Fetch team data
      const teamRes = await teamsAPI.get(data.team._id);
      dispatch({ type: 'SET_TEAM', payload: { team: teamRes.data.team, members: teamRes.data.members } });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to join team';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const leaveTeam = useCallback(async () => {
    try {
      const { data } = await teamsAPI.leave();
      await saveToken(data.token);
      await removeTeam();
      dispatch({ type: 'SET_TEAM', payload: { team: null as any, members: [] } });

      const meRes = await authAPI.getMe();
      await saveUser(meRes.data.user);
      dispatch({ type: 'SET_AUTH', payload: { user: meRes.data.user, token: data.token } });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to leave team' });
    }
  }, []);

  const fetchTeamData = useCallback(async () => {
    if (!state.user?.teamId) return;
    try {
      const { data } = await teamsAPI.get(state.user.teamId);
      dispatch({ type: 'SET_TEAM', payload: { team: data.team, members: data.members } });
      await saveTeam(data.team);
    } catch {
      // Use cached data if available
      const cached = await getTeam();
      if (cached) {
        dispatch({ type: 'SET_TEAM', payload: { team: cached, members: state.members } });
      }
    }
  }, [state.user?.teamId, state.members]);

  // ─── Expense actions ─────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await expensesAPI.list();
      dispatch({ type: 'SET_EXPENSES', payload: data.expenses });
    } catch {
      // keep existing data on failure
    }
  }, []);

  const addExpense = useCallback(async (expData: any) => {
    try {
      const { data } = await expensesAPI.create(expData);
      dispatch({ type: 'ADD_EXPENSE', payload: data.expense });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to add expense';
      throw new Error(msg);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await expensesAPI.delete(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (err: any) {
      throw new Error('Failed to delete expense');
    }
  }, []);

  // ─── Dark mode persistence ───────────────────────────────────────────────

  useEffect(() => {
    if (state.isInitialized) {
      saveDarkMode(state.isDarkMode);
    }
  }, [state.isDarkMode, state.isInitialized]);

  // ─── Auto-fetch data when logged in ──────────────────────────────────────

  useEffect(() => {
    if (state.isLoggedIn && state.isInitialized) {
      fetchExpenses();
      fetchTeamData();
    }
  }, [state.isLoggedIn, state.isInitialized, fetchExpenses, fetchTeamData]);

  // ─── Computed values (client-side for performance) ───────────────────────

  const filteredExpenses = useMemo(() => {
    let filtered = [...state.expenses];
    const now = new Date();

    if (state.filterPeriod === 'daily') {
      filtered = filtered.filter(e => new Date(e.dateTime).toDateString() === now.toDateString());
    } else if (state.filterPeriod === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.dateTime) >= weekAgo);
    } else if (state.filterPeriod === 'monthly') {
      filtered = filtered.filter(e => {
        const d = new Date(e.dateTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    if (state.filterMember) filtered = filtered.filter(e => e.memberId === state.filterMember);
    if (state.filterCategory) filtered = filtered.filter(e => e.category === state.filterCategory);
    filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    return filtered;
  }, [state.expenses, state.filterPeriod, state.filterMember, state.filterCategory]);

  const totalSpend = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses]);

  const monthlySpend = useMemo(() => {
    const now = new Date();
    return state.expenses
      .filter(e => { const d = new Date(e.dateTime); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, e) => s + e.amount, 0);
  }, [state.expenses]);

  const categoryBreakdown = useMemo((): CategoryBreakdownItem[] => {
    const bk: Record<string, number> = {};
    filteredExpenses.forEach(e => { bk[e.category] = (bk[e.category] || 0) + e.amount; });
    return CATEGORIES.map(c => ({
      ...c, amount: bk[c.name] || 0,
      percentage: totalSpend > 0 ? ((bk[c.name] || 0) / totalSpend * 100) : 0,
      budgetUsed: state.budgets[c.name] > 0 ? ((bk[c.name] || 0) / state.budgets[c.name] * 100) : 0,
    }));
  }, [filteredExpenses, totalSpend, state.budgets]);

  const memberBreakdown = useMemo((): MemberBreakdownItem[] => {
    const bk: Record<string, MemberBreakdownItem> = {};
    filteredExpenses.forEach(e => {
      if (!bk[e.memberId]) bk[e.memberId] = { memberId: e.memberId, name: e.memberName, amount: 0, count: 0 };
      bk[e.memberId].amount += e.amount; bk[e.memberId].count += 1;
    });
    return Object.values(bk).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const monthlyTrend = useMemo((): MonthlyTrendItem[] => {
    const months: MonthlyTrendItem[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = state.expenses
        .filter(e => { const d = new Date(e.dateTime); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); })
        .reduce((s, e) => s + e.amount, 0);
      months.push({ month: m.toLocaleString('default', { month: 'short' }), amount: total });
    }
    return months;
  }, [state.expenses]);

  const insights = useMemo((): Insight[] => {
    const results: Insight[] = [];
    const now = new Date();
    const thisM = state.expenses.filter(e => { const d = new Date(e.dateTime); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastM = state.expenses.filter(e => { const d = new Date(e.dateTime); return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear(); });

    CATEGORIES.forEach(cat => {
      const thisAmt = thisM.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0);
      const lastAmt = lastM.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0);
      if (lastAmt > 0 && thisAmt > lastAmt) {
        const pct = Math.round((thisAmt - lastAmt) / lastAmt * 100);
        if (pct > 10) results.push({ type: 'warning', icon: 'trending-up', message: `${cat.name} spending increased ${pct}% this month`, color: '#E17055' });
      }
      const bu = state.budgets[cat.name] > 0 ? (thisAmt / state.budgets[cat.name] * 100) : 0;
      if (bu > 80) results.push({ type: 'alert', icon: 'warning', message: `${cat.name} budget ${bu >= 100 ? 'exceeded' : `at ${Math.round(bu)}%`}!`, color: bu >= 100 ? '#FF6B6B' : '#FDAA5E' });
    });

    if (memberBreakdown.length > 0) {
      results.push({ type: 'info', icon: 'person', message: `${memberBreakdown[0].name} is the top spender with ₹${memberBreakdown[0].amount.toLocaleString()}`, color: '#0984E3' });
    }
    return results;
  }, [state.expenses, state.budgets, memberBreakdown]);

  const budgetPercentage = useMemo(() => TOTAL_BUDGET > 0 ? (monthlySpend / TOTAL_BUDGET * 100) : 0, [monthlySpend]);

  const value = useMemo((): AppContextValue => ({
    ...state, dispatch, filteredExpenses, totalSpend, monthlySpend,
    categoryBreakdown, memberBreakdown, monthlyTrend, insights,
    budgetPercentage, totalBudget: TOTAL_BUDGET,
    login, register, logout, initAuth,
    createTeam, joinTeam, leaveTeam, fetchTeamData,
    fetchExpenses, addExpense, deleteExpense,
  }), [state, filteredExpenses, totalSpend, monthlySpend, categoryBreakdown, memberBreakdown, monthlyTrend, insights, budgetPercentage, login, register, logout, initAuth, createTeam, joinTeam, leaveTeam, fetchTeamData, fetchExpenses, addExpense, deleteExpense]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
