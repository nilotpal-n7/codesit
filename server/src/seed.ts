/**
 * Database seed script.
 * Creates sample team, users, and expenses for development.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User';
import Team from './models/Team';
import Expense from './models/Expense';

const now = new Date();
const thisMonth = now.getMonth();
const thisYear = now.getFullYear();

const makeDate = (day: number, monthOffset: number = 0): Date => {
  return new Date(thisYear, thisMonth + monthOffset, day);
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('🔗 Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Team.deleteMany({});
  await Expense.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users (password will be hashed by the pre-save hook)
  const users = await User.create([
    { name: 'Arjun Mehta', email: 'arjun@team.com', password: 'password123', role: 'admin' },
    { name: 'Priya Sharma', email: 'priya@team.com', password: 'password123', role: 'member' },
    { name: 'Ravi Kumar', email: 'ravi@team.com', password: 'password123', role: 'member' },
    { name: 'Sneha Patel', email: 'sneha@team.com', password: 'password123', role: 'member' },
  ]);
  console.log(`👥 Created ${users.length} users`);

  // Create team
  const team = await Team.create({
    name: 'Innov8 Labs',
    inviteCode: 'INNOV8X',
    createdBy: users[0]._id,
  });
  console.log(`🏢 Created team: ${team.name} (code: ${team.inviteCode})`);

  // Assign all users to the team
  for (const user of users) {
    user.teamId = team._id;
    await user.save();
  }

  // Create expenses
  const expenseData = [
    // This month
    { amount: 1250, category: 'Travel', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(2), note: 'Cab to client office' },
    { amount: 450, category: 'Food', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(3), note: 'Team lunch at office' },
    { amount: 3200, category: 'Software', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(4), note: 'Figma Pro subscription' },
    { amount: 780, category: 'Food', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(5), note: 'Client dinner' },
    { amount: 2100, category: 'Equipment', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(6), note: 'Wireless keyboard + mouse' },
    { amount: 560, category: 'Operations', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(7), note: 'Printing & stationery' },
    { amount: 4500, category: 'Travel', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(8), note: 'Flight to Bangalore' },
    { amount: 320, category: 'Food', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(9), note: 'Coffee supplies' },
    { amount: 1800, category: 'Software', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(10), note: 'AWS monthly bill' },
    { amount: 950, category: 'Operations', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(11), note: 'Office cleaning service' },
    { amount: 650, category: 'Misc', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(12), note: 'Team building supplies' },
    { amount: 2800, category: 'Equipment', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(13), note: 'Monitor stand + cables' },
    { amount: 1100, category: 'Travel', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(14), note: 'Uber rides - week total' },
    { amount: 380, category: 'Food', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(15), note: 'Snacks for sprint review' },
    { amount: 1500, category: 'Operations', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(16), note: 'Courier & logistics' },
    { amount: 720, category: 'Food', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(18), note: 'Team pizza Friday' },
    { amount: 3400, category: 'Travel', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(19), note: 'Train tickets to Mumbai' },
    { amount: 990, category: 'Software', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(20), note: 'GitHub Pro upgrade' },
    { amount: 450, category: 'Misc', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(21), note: 'Birthday celebration' },
    { amount: 1650, category: 'Equipment', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(22), note: 'USB-C hub + adapters' },
    // Last month
    { amount: 2200, category: 'Travel', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(5, -1), note: 'Cab to conference' },
    { amount: 890, category: 'Food', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(8, -1), note: 'Team dinner' },
    { amount: 1500, category: 'Software', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(12, -1), note: 'Notion subscription' },
    { amount: 3100, category: 'Equipment', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(15, -1), note: 'Webcam + headset' },
    { amount: 670, category: 'Operations', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(18, -1), note: 'Electricity bill' },
    { amount: 1800, category: 'Travel', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(20, -1), note: 'Client visit - Delhi' },
    { amount: 420, category: 'Food', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(22, -1), note: 'Working lunch' },
    { amount: 2400, category: 'Software', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(25, -1), note: 'Jira annual plan' },
    // Two months ago
    { amount: 1900, category: 'Travel', memberId: users[2]._id, memberName: 'Ravi Kumar', dateTime: makeDate(3, -2), note: 'Airport transfer' },
    { amount: 550, category: 'Food', memberId: users[3]._id, memberName: 'Sneha Patel', dateTime: makeDate(10, -2), note: 'Catering for event' },
    { amount: 4200, category: 'Equipment', memberId: users[0]._id, memberName: 'Arjun Mehta', dateTime: makeDate(14, -2), note: 'Standing desk' },
    { amount: 780, category: 'Operations', memberId: users[1]._id, memberName: 'Priya Sharma', dateTime: makeDate(20, -2), note: 'Internet upgrade' },
  ];

  const expenses = await Expense.create(
    expenseData.map(e => ({ ...e, teamId: team._id }))
  );
  console.log(`💰 Created ${expenses.length} expenses`);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Test login credentials:');
  console.log('  Email: arjun@team.com');
  console.log('  Password: password123');
  console.log(`  Team invite code: ${team.inviteCode}`);
  console.log('─────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
