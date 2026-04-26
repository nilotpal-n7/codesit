/**
 * Expense category definitions with icons, colors, gradients, and budgets.
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: [string, string];
  budget: number;
}

export const CATEGORIES: Category[] = [
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#6C5CE7', gradient: ['#6C5CE7', '#A29BFE'], budget: 5000 },
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#E17055', gradient: ['#E17055', '#FAB1A0'], budget: 3000 },
  { id: 'equipment', name: 'Equipment', icon: 'construct', color: '#00B894', gradient: ['#00B894', '#55EFC4'], budget: 4000 },
  { id: 'software', name: 'Software', icon: 'code-slash', color: '#0984E3', gradient: ['#0984E3', '#74B9FF'], budget: 2500 },
  { id: 'operations', name: 'Operations', icon: 'settings', color: '#FDAA5E', gradient: ['#FDAA5E', '#FDCB6E'], budget: 3500 },
  { id: 'misc', name: 'Misc', icon: 'ellipsis-horizontal', color: '#636E72', gradient: ['#636E72', '#B2BEC3'], budget: 1500 },
];

export const getCategoryByName = (name: string): Category => {
  return CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || CATEGORIES[5];
};

export const getCategoryById = (id: string): Category => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[5];
};

export const TOTAL_BUDGET: number = CATEGORIES.reduce((sum, c) => sum + c.budget, 0);
