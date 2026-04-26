import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  note: string;
  dateTime: Date;
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  teamId: mongoose.Types.ObjectId;
  receiptUrl: string | null;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Travel', 'Food', 'Equipment', 'Software', 'Operations', 'Misc'],
    },
    note: { type: String, default: '' },
    dateTime: { type: Date, required: true, default: Date.now },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberName: { type: String, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index for efficient team-based queries sorted by date
expenseSchema.index({ teamId: 1, dateTime: -1 });
expenseSchema.index({ teamId: 1, category: 1 });
expenseSchema.index({ teamId: 1, memberId: 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);
