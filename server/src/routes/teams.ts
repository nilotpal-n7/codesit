import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Team from '../models/Team';
import User from '../models/User';
import { auth, generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/teams
 * Create a new team. Creator becomes admin.
 */
router.post(
  '/',
  auth,
  [body('name').trim().notEmpty().withMessage('Team name is required')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name } = req.body;

      // Generate invite code
      const inviteCode = await (Team as any).generateInviteCode();

      // Create team
      const team = new Team({
        name,
        inviteCode,
        createdBy: req.userId,
      });
      await team.save();

      // Update user — set as admin + assign team
      await User.findByIdAndUpdate(req.userId, {
        teamId: team._id,
        role: 'admin',
      });

      // Generate new token with teamId
      const token = generateToken(req.userId!, team._id.toString());

      res.status(201).json({ team, token });
    } catch (err) {
      console.error('Create team error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/**
 * POST /api/teams/join
 * Join a team via invite code.
 */
router.post(
  '/join',
  auth,
  [body('inviteCode').trim().notEmpty().withMessage('Invite code is required')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { inviteCode } = req.body;

      // Find team by invite code
      const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });
      if (!team) {
        res.status(404).json({ error: 'Invalid invite code' });
        return;
      }

      // Check if user is already in a team
      const user = await User.findById(req.userId);
      if (user?.teamId) {
        res.status(400).json({ error: 'You are already in a team. Leave your current team first.' });
        return;
      }

      // Join team
      await User.findByIdAndUpdate(req.userId, {
        teamId: team._id,
        role: 'member',
      });

      // Generate new token with teamId
      const token = generateToken(req.userId!, team._id.toString());

      res.json({ team, token });
    } catch (err) {
      console.error('Join team error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/**
 * GET /api/teams/:id
 * Get team info + member list.
 */
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const members = await User.find({ teamId: team._id }).select('-password');

    res.json({ team, members });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/teams/:id/budgets
 * Update category budgets (admin only).
 */
router.put('/:id/budgets', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can update budgets' });
      return;
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const { budgets } = req.body; // { category: amount }
    if (budgets && typeof budgets === 'object') {
      for (const [category, amount] of Object.entries(budgets)) {
        team.budgets.set(category, amount as number);
      }
      await team.save();
    }

    res.json({ team });
  } catch (err) {
    console.error('Update budgets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/teams/leave
 * Leave current team.
 */
router.post('/leave', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.userId, { teamId: null, role: 'member' });
    const token = generateToken(req.userId!, null);
    res.json({ message: 'Left team successfully', token });
  } catch (err) {
    console.error('Leave team error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
