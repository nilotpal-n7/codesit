/**
 * AsyncStorage wrapper for persistent data caching.
 *
 * Stores:
 * - JWT auth token (survives app restart)
 * - User data cache
 * - Team data cache
 * - Dark mode preference
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@budget_tracker/token',
  USER: '@budget_tracker/user',
  TEAM: '@budget_tracker/team',
  DARK_MODE: '@budget_tracker/dark_mode',
} as const;

// ─── Token ───────────────────────────────────────────────────────────────────

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.TOKEN, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.TOKEN);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.TOKEN);
};

// ─── User ────────────────────────────────────────────────────────────────────

export const saveUser = async (user: any): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async (): Promise<any | null> => {
  const data = await AsyncStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const removeUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.USER);
};

// ─── Team ────────────────────────────────────────────────────────────────────

export const saveTeam = async (team: any): Promise<void> => {
  await AsyncStorage.setItem(KEYS.TEAM, JSON.stringify(team));
};

export const getTeam = async (): Promise<any | null> => {
  const data = await AsyncStorage.getItem(KEYS.TEAM);
  return data ? JSON.parse(data) : null;
};

export const removeTeam = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.TEAM);
};

// ─── Dark Mode ───────────────────────────────────────────────────────────────

export const saveDarkMode = async (isDark: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.DARK_MODE, JSON.stringify(isDark));
};

export const getDarkMode = async (): Promise<boolean> => {
  const data = await AsyncStorage.getItem(KEYS.DARK_MODE);
  return data ? JSON.parse(data) : false;
};

// ─── Clear All ───────────────────────────────────────────────────────────────

export const clearAll = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
