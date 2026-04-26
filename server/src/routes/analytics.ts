import { Router, Response } from 'express';
import Expense from '../models/Expense';
import User from '../models/User';
import Team from '../models/Team';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

const CATEGORIES = ['Travel', 'Food', 'Equipment', 'Software', 'Operations', 'Misc'];

/**
 * GET /api/analytics/summary
 * Overview stats: total spend, transaction count, active categories.
 */
router.get('/summary', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamFilter = await getTeamFilter(req);
    const dateFilter = getDateFilter(req);
    const query = { ...teamFilter, ...dateFilter };

    const expenses = await Expense.find(query);
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const categories = new Set(expenses.map(e => e.category));

    res.json({
      totalSpend,
      transactionCount: expenses.length,
      categoryCount: categories.size,
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/analytics/category-breakdown
 * Per-category spending with budget usage percentages.
 */
router.get('/category-breakdown', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamFilter = await getTeamFilter(req);
    const dateFilter = getDateFilter(req);
    const query = { ...teamFilter, ...dateFilter };

    const expenses = await Expense.find(query);
    const budgets = await getBudgets(req);

    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });

    const result = CATEGORIES.map(cat => ({
      category: cat,
      amount: breakdown[cat] || 0,
      percentage: totalSpend > 0 ? ((breakdown[cat] || 0) / totalSpend) * 100 : 0,
      budget: budgets[cat] || 0,
      budgetUsed: budgets[cat] > 0 ? ((breakdown[cat] || 0) / budgets[cat]) * 100 : 0,
    }));

    res.json({ breakdown: result, totalSpend });
  } catch (err) {
    console.error('Category breakdown error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/analytics/member-breakdown
 * Per-member spending with count.
 */
router.get('/member-breakdown', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamFilter = await getTeamFilter(req);
    const dateFilter = getDateFilter(req);
    const query = { ...teamFilter, ...dateFilter };

    const expenses = await Expense.find(query);
    const members: Record<string, { memberId: string; name: string; amount: number; count: number }> = {};

    expenses.forEach(e => {
      const id = e.memberId.toString();
      if (!members[id]) {
        members[id] = { memberId: id, name: e.memberName, amount: 0, count: 0 };
      }
      members[id].amount += e.amount;
      members[id].count += 1;
    });

    const result = Object.values(members).sort((a, b) => b.amount - a.amount);
    res.json({ members: result });
  } catch (err) {
    console.error('Member breakdown error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/analytics/monthly-trend
 * Last 6 months of spending.
 */
router.get('/monthly-trend', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamFilter = await getTeamFilter(req);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const expenses = await Expense.find({ ...teamFilter, dateTime: { $gte: sixMonthsAgo } });

    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const total = expenses
        .filter(e => {
          const d = new Date(e.dateTime);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((s, e) => s + e.amount, 0);
      months.push({ month: monthName, amount: total });
    }

    res.json({ trend: months });
  } catch (err) {
    console.error('Monthly trend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/analytics/insights
 * Smart insights: budget alerts, spending trends, top spender.
 */
router.get('/insights', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teamFilter = await getTeamFilter(req);
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthExpenses = await Expense.find({ ...teamFilter, dateTime: { $gte: thisMonthStart } });
    const lastMonthExpenses = await Expense.find({
      ...teamFilter,
      dateTime: { $gte: lastMonthStart, $lt: thisMonthStart },
    });

    const budgets = await getBudgets(req);
    const insights: { type: string; icon: string; message: string; color: string }[] = [];

    // Category trend & budget alerts
    CATEGORIES.forEach(cat => {
      const thisMonth = thisMonthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
      const lastMonth = lastMonthExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);

      if (lastMonth > 0 && thisMonth > lastMonth) {
        const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
        if (pct > 10) {
          insights.push({
            type: 'warning',
            icon: 'trending-up',
            message: `${cat} spending increased ${pct}% this month`,
            color: '#E17055',
          });
        }
      }

      const budgetUsed = budgets[cat] > 0 ? (thisMonth / budgets[cat]) * 100 : 0;
      if (budgetUsed > 80) {
        insights.push({
          type: 'alert',
          icon: 'warning',
          message: `${cat} budget ${budgetUsed >= 100 ? 'exceeded' : `at ${Math.round(budgetUsed)}%`}!`,
          color: budgetUsed >= 100 ? '#FF6B6B' : '#FDAA5E',
        });
      }
    });

    // Top spender
    const members: Record<string, { name: string; amount: number }> = {};
    thisMonthExpenses.forEach(e => {
      const id = e.memberId.toString();
      if (!members[id]) members[id] = { name: e.memberName, amount: 0 };
      members[id].amount += e.amount;
    });
    const sorted = Object.values(members).sort((a, b) => b.amount - a.amount);
    if (sorted.length > 0) {
      insights.push({
        type: 'info',
        icon: 'person',
        message: `${sorted[0].name} is the top spender with ₹${sorted[0].amount.toLocaleString()}`,
        color: '#0984E3',
      });
    }

    res.json({ insights });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getTeamFilter(req: AuthRequest): Promise<any> {
  const user = await User.findById(req.userId);
  if (user?.teamId) {
    return { teamId: user.teamId };
  }
  // Solo mode
  return { memberId: req.userId };
}

function getDateFilter(req: AuthRequest): any {
  const period = req.query.period as string;
  const now = new Date();

  if (period === 'daily') {
    return { dateTime: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } };
  } else if (period === 'weekly') {
    return { dateTime: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
  } else if (period === 'monthly') {
    return { dateTime: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
  }
  return {};
}

async function getBudgets(req: AuthRequest): Promise<Record<string, number>> {
  const user = await User.findById(req.userId);
  if (user?.teamId) {
    const team = await Team.findById(user.teamId);
    if (team?.budgets) {
      const b: Record<string, number> = {};
      team.budgets.forEach((val, key) => {
        b[key] = val;
      });
      return b;
    }
  }
  // Default budgets for solo users
  return { Travel: 5000, Food: 3000, Equipment: 4000, Software: 2500, Operations: 3500, Misc: 1500 };
}

export default router;
