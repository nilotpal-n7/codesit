import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  inviteCode: string;
  createdBy: mongoose.Types.ObjectId;
  budgets: Map<string, number>;
  createdAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    budgets: {
      type: Map,
      of: Number,
      default: () => new Map<string, number>([
        ['Travel', 5000],
        ['Food', 3000],
        ['Equipment', 4000],
        ['Software', 2500],
        ['Operations', 3500],
        ['Misc', 1500],
      ]),
    },
  },
  { timestamps: true }
);

/**
 * Generate a unique 6-character alphanumeric invite code.
 */
teamSchema.statics.generateInviteCode = async function (): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I/L)
  let code: string;
  let exists: boolean;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = !!(await this.findOne({ inviteCode: code }));
  } while (exists);
  return code;
};

export default mongoose.model<ITeam>('Team', teamSchema);
