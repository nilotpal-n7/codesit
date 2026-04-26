/**
 * Global application state for the Team Budget Tracker.
 *
 * Uses React Context + useReducer to manage:
 * - Auth state (login/logout)
 * - Expense CRUD
 * - Filter state (period, member, category)
 * - Theme (dark mode toggle)
 * - Budget limits per category
 *
 * Exposes computed values: filteredExpenses, totalSpend, monthlySpend,
 * categoryBreakdown, memberBreakdown, monthlyTrend, insights, budgetPercentage.
 */

import React, { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import { SAMPLE_EXPENSES, SAMPLE_USERS, SAMPLE_TEAM, type User, type Team, type Expense } from '@/constants/sample-data';
import { CATEGORIES, TOTAL_BUDGET, type Category } from '@/constants/categories';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

interface AppState {
  user: User;
  team: Team;
  members: User[];
  expenses: Expense[];
  budgets: Record<string, number>;
  isDarkMode: boolean;
  filterPeriod: FilterPeriod;
  filterMember: string | null;
  filterCategory: string | null;
  filterDateRange: null;
  isLoggedIn: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload?: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER_PERIOD'; payload: FilterPeriod }
  | { type: 'SET_FILTER_MEMBER'; payload: string | null }
  | { type: 'SET_FILTER_CATEGORY'; payload: string | null }
  | { type: 'SET_FILTER_DATE_RANGE'; payload: null }
  | { type: 'UPDATE_BUDGET'; payload: { category: string; amount: number } };

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
  type: 'warning' | 'alert' | 'info';
  icon: string;
  message: string;
  color: string;
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>;
  filteredExpenses: Expense[];
  totalSpend: number;
  monthlySpend: number;
  categoryBreakdown: CategoryBreakdownItem[];
  memberBreakdown: MemberBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  insights: Insight[];
  budgetPercentage: number;
  totalBudget: number;
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: AppState = {
  user: SAMPLE_USERS[0],
  team: SAMPLE_TEAM,
  members: SAMPLE_USERS,
  expenses: SAMPLE_EXPENSES,
  budgets: CATEGORIES.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.name]: c.budget }), {}),
  isDarkMode: false,
  filterPeriod: 'monthly',
  filterMember: null,
  filterCategory: null,
  filterDateRange: null,
  isLoggedIn: false,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true, user: action.payload || state.user };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false };
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };
    case 'SET_FILTER_PERIOD':
      return { ...state, filterPeriod: action.payload };
    case 'SET_FILTER_MEMBER':
      return { ...state, filterMember: action.payload };
    case 'SET_FILTER_CATEGORY':
      return { ...state, filterCategory: action.payload };
    case 'SET_FILTER_DATE_RANGE':
      return { ...state, filterDateRange: action.payload };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: { ...state.budgets, [action.payload.category]: action.payload.amount },
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const filteredExpenses = useMemo(() => {
    let filtered = [...state.expenses];
    const now = new Date();

    if (state.filterPeriod === 'daily') {
      filtered = filtered.filter(e => {
        const d = new Date(e.dateTime);
        return d.toDateString() === now.toDateString();
      });
    } else if (state.filterPeriod === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.dateTime) >= weekAgo);
    } else if (state.filterPeriod === 'monthly') {
      filtered = filtered.filter(e => {
        const d = new Date(e.dateTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    if (state.filterMember) {
      filtered = filtered.filter(e => e.memberId === state.filterMember);
    }

    if (state.filterCategory) {
      filtered = filtered.filter(e => e.category === state.filterCategory);
    }

    filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    return filtered;
  }, [state.expenses, state.filterPeriod, state.filterMember, state.filterCategory]);

  const totalSpend = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const monthlySpend = useMemo(() => {
    const now = new Date();
    return state.expenses
      .filter(e => {
        const d = new Date(e.dateTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [state.expenses]);

  const categoryBreakdown = useMemo((): CategoryBreakdownItem[] => {
    const breakdown: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return CATEGORIES.map(c => ({
      ...c,
      amount: breakdown[c.name] || 0,
      percentage: totalSpend > 0 ? ((breakdown[c.name] || 0) / totalSpend * 100) : 0,
      budgetUsed: state.budgets[c.name] > 0 ? ((breakdown[c.name] || 0) / state.budgets[c.name] * 100) : 0,
    }));
  }, [filteredExpenses, totalSpend, state.budgets]);

  const memberBreakdown = useMemo((): MemberBreakdownItem[] => {
    const breakdown: Record<string, MemberBreakdownItem> = {};
    filteredExpenses.forEach(e => {
      if (!breakdown[e.memberId]) {
        breakdown[e.memberId] = { memberId: e.memberId, name: e.memberName, amount: 0, count: 0 };
      }
      breakdown[e.memberId].amount += e.amount;
      breakdown[e.memberId].count += 1;
    });
    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const monthlyTrend = useMemo((): MonthlyTrendItem[] => {
    const months: MonthlyTrendItem[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const total = state.expenses
        .filter(e => {
          const d = new Date(e.dateTime);
          return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);
      months.push({ month: monthName, amount: total });
    }
    return months;
  }, [state.expenses]);

  const insights = useMemo((): Insight[] => {
    const results: Insight[] = [];
    const now = new Date();
    const thisMonthExpenses = state.expenses.filter(e => {
      const d = new Date(e.dateTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonthExpenses = state.expenses.filter(e => {
      const d = new Date(e.dateTime);
      return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
    });

    CATEGORIES.forEach(cat => {
      const thisMonth = thisMonthExpenses
        .filter(e => e.category === cat.name)
        .reduce((s, e) => s + e.amount, 0);
      const lastMonth = lastMonthExpenses
        .filter(e => e.category === cat.name)
        .reduce((s, e) => s + e.amount, 0);

      if (lastMonth > 0 && thisMonth > lastMonth) {
        const pctIncrease = Math.round((thisMonth - lastMonth) / lastMonth * 100);
        if (pctIncrease > 10) {
          results.push({
            type: 'warning',
            icon: 'trending-up',
            message: `${cat.name} spending increased ${pctIncrease}% this month`,
            color: '#E17055',
          });
        }
      }

      const budgetUsed = state.budgets[cat.name] > 0 ? (thisMonth / state.budgets[cat.name] * 100) : 0;
      if (budgetUsed > 80) {
        results.push({
          type: 'alert',
          icon: 'warning',
          message: `${cat.name} budget ${budgetUsed >= 100 ? 'exceeded' : `at ${Math.round(budgetUsed)}%`}!`,
          color: budgetUsed >= 100 ? '#FF6B6B' : '#FDAA5E',
        });
      }
    });

    if (memberBreakdown.length > 0) {
      results.push({
        type: 'info',
        icon: 'person',
        message: `${memberBreakdown[0].name} is the top spender with ₹${memberBreakdown[0].amount.toLocaleString()}`,
        color: '#0984E3',
      });
    }

    return results;
  }, [state.expenses, state.budgets, memberBreakdown]);

  const budgetPercentage = useMemo(() => {
    return TOTAL_BUDGET > 0 ? (monthlySpend / TOTAL_BUDGET * 100) : 0;
  }, [monthlySpend]);

  const value = useMemo((): AppContextValue => ({
    ...state,
    dispatch,
    filteredExpenses,
    totalSpend,
    monthlySpend,
    categoryBreakdown,
    memberBreakdown,
    monthlyTrend,
    insights,
    budgetPercentage,
    totalBudget: TOTAL_BUDGET,
  }), [state, filteredExpenses, totalSpend, monthlySpend, categoryBreakdown, memberBreakdown, monthlyTrend, insights, budgetPercentage]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
