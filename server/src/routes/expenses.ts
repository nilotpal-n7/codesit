import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense';
import User from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/expenses
 * List expenses for the user's team with optional filters.
 * Query params: period (daily|weekly|monthly|total), member, category
 */
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.teamId) {
      // Solo mode — return only this user's expenses
      const query: any = { memberId: req.userId };
      applyFilters(query, req);
      const expenses = await Expense.find(query).sort({ dateTime: -1 }).limit(200);
      res.json({ expenses });
      return;
    }

    const query: any = { teamId: user.teamId };
    applyFilters(query, req);

    if (req.query.member) {
      query.memberId = req.query.member;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const expenses = await Expense.find(query).sort({ dateTime: -1 }).limit(500);
    res.json({ expenses });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/expenses
 * Create a new expense.
 */
router.post(
  '/',
  auth,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const expense = new Expense({
        amount: req.body.amount,
        category: req.body.category,
        note: req.body.note || '',
        dateTime: req.body.dateTime || new Date(),
        memberId: req.body.memberId || req.userId,
        memberName: req.body.memberName || user.name,
        teamId: user.teamId || req.userId, // solo users use their own ID as pseudo-teamId
        receiptUrl: req.body.receiptUrl || null,
      });

      await expense.save();
      res.status(201).json({ expense });
    } catch (err) {
      console.error('Create expense error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/**
 * PUT /api/expenses/:id
 * Update an expense (owner or admin).
 */
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Check ownership
    const user = await User.findById(req.userId);
    const isOwner = expense.memberId.toString() === req.userId;
    const isAdmin = user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updates = ['amount', 'category', 'note', 'dateTime', 'receiptUrl'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        (expense as any)[field] = req.body[field];
      }
    });

    await expense.save();
    res.json({ expense });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense (owner or admin).
 */
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const user = await User.findById(req.userId);
    const isOwner = expense.memberId.toString() === req.userId;
    const isAdmin = user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applyFilters(query: any, req: AuthRequest): void {
  const period = req.query.period as string;
  const now = new Date();

  if (period === 'daily') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    query.dateTime = { $gte: start };
  } else if (period === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    query.dateTime = { $gte: weekAgo };
  } else if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    query.dateTime = { $gte: start };
  }
  // 'total' — no date filter
}

export default router;
