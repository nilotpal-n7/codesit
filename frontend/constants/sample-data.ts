/**
 * Sample data for the Team Budget Tracker.
 * Provides mock team, users, and expense records for development.
 */

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  memberId: string;
  memberName: string;
  teamId: string;
  dateTime: string;
  note: string;
  receiptUrl: string | null;
}

const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();

const makeDate = (day: number, monthOffset: number = 0): string => {
  return new Date(thisYear, thisMonth + monthOffset, day).toISOString();
};

export const SAMPLE_TEAM: Team = {
  id: 'team_001',
  name: 'Innov8 Labs',
  inviteCode: 'INNOV8X',
  createdAt: makeDate(1, -2),
};

export const SAMPLE_USERS: User[] = [
  { id: 'user_001', name: 'Arjun Mehta', email: 'arjun@team.com', role: 'admin', avatar: null },
  { id: 'user_002', name: 'Priya Sharma', email: 'priya@team.com', role: 'member', avatar: null },
  { id: 'user_003', name: 'Ravi Kumar', email: 'ravi@team.com', role: 'member', avatar: null },
  { id: 'user_004', name: 'Sneha Patel', email: 'sneha@team.com', role: 'member', avatar: null },
];

export const SAMPLE_EXPENSES: Expense[] = [
  // This month
  { id: 'exp_001', amount: 1250, category: 'Travel', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(2), note: 'Cab to client office', receiptUrl: null },
  { id: 'exp_002', amount: 450, category: 'Food', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(3), note: 'Team lunch at office', receiptUrl: null },
  { id: 'exp_003', amount: 3200, category: 'Software', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(4), note: 'Figma Pro subscription', receiptUrl: null },
  { id: 'exp_004', amount: 780, category: 'Food', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(5), note: 'Client dinner', receiptUrl: null },
  { id: 'exp_005', amount: 2100, category: 'Equipment', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(6), note: 'Wireless keyboard + mouse', receiptUrl: null },
  { id: 'exp_006', amount: 560, category: 'Operations', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(7), note: 'Printing & stationery', receiptUrl: null },
  { id: 'exp_007', amount: 4500, category: 'Travel', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(8), note: 'Flight to Bangalore', receiptUrl: null },
  { id: 'exp_008', amount: 320, category: 'Food', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(9), note: 'Coffee supplies', receiptUrl: null },
  { id: 'exp_009', amount: 1800, category: 'Software', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(10), note: 'AWS monthly bill', receiptUrl: null },
  { id: 'exp_010', amount: 950, category: 'Operations', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(11), note: 'Office cleaning service', receiptUrl: null },
  { id: 'exp_011', amount: 650, category: 'Misc', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(12), note: 'Team building supplies', receiptUrl: null },
  { id: 'exp_012', amount: 2800, category: 'Equipment', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(13), note: 'Monitor stand + cables', receiptUrl: null },
  { id: 'exp_013', amount: 1100, category: 'Travel', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(14), note: 'Uber rides - week total', receiptUrl: null },
  { id: 'exp_014', amount: 380, category: 'Food', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(15), note: 'Snacks for sprint review', receiptUrl: null },
  { id: 'exp_015', amount: 1500, category: 'Operations', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(16), note: 'Courier & logistics', receiptUrl: null },
  { id: 'exp_016', amount: 720, category: 'Food', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(18), note: 'Team pizza Friday', receiptUrl: null },
  { id: 'exp_017', amount: 3400, category: 'Travel', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(19), note: 'Train tickets to Mumbai', receiptUrl: null },
  { id: 'exp_018', amount: 990, category: 'Software', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(20), note: 'GitHub Pro upgrade', receiptUrl: null },
  { id: 'exp_019', amount: 450, category: 'Misc', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(21), note: 'Birthday celebration', receiptUrl: null },
  { id: 'exp_020', amount: 1650, category: 'Equipment', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(22), note: 'USB-C hub + adapters', receiptUrl: null },

  // Last month
  { id: 'exp_021', amount: 2200, category: 'Travel', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(5, -1), note: 'Cab to conference', receiptUrl: null },
  { id: 'exp_022', amount: 890, category: 'Food', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(8, -1), note: 'Team dinner', receiptUrl: null },
  { id: 'exp_023', amount: 1500, category: 'Software', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(12, -1), note: 'Notion subscription', receiptUrl: null },
  { id: 'exp_024', amount: 3100, category: 'Equipment', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(15, -1), note: 'Webcam + headset', receiptUrl: null },
  { id: 'exp_025', amount: 670, category: 'Operations', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(18, -1), note: 'Electricity bill', receiptUrl: null },
  { id: 'exp_026', amount: 1800, category: 'Travel', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(20, -1), note: 'Client visit - Delhi', receiptUrl: null },
  { id: 'exp_027', amount: 420, category: 'Food', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(22, -1), note: 'Working lunch', receiptUrl: null },
  { id: 'exp_028', amount: 2400, category: 'Software', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(25, -1), note: 'Jira annual plan', receiptUrl: null },

  // Two months ago
  { id: 'exp_029', amount: 1900, category: 'Travel', memberId: 'user_003', memberName: 'Ravi Kumar', teamId: 'team_001', dateTime: makeDate(3, -2), note: 'Airport transfer', receiptUrl: null },
  { id: 'exp_030', amount: 550, category: 'Food', memberId: 'user_004', memberName: 'Sneha Patel', teamId: 'team_001', dateTime: makeDate(10, -2), note: 'Catering for event', receiptUrl: null },
  { id: 'exp_031', amount: 4200, category: 'Equipment', memberId: 'user_001', memberName: 'Arjun Mehta', teamId: 'team_001', dateTime: makeDate(14, -2), note: 'Standing desk', receiptUrl: null },
  { id: 'exp_032', amount: 780, category: 'Operations', memberId: 'user_002', memberName: 'Priya Sharma', teamId: 'team_001', dateTime: makeDate(20, -2), note: 'Internet upgrade', receiptUrl: null },
];
