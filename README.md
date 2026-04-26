<p align="center">
  <img src="frontend/assets/images/icon.png" width="80" height="80" alt="Team Budget Tracker" />
</p>

<h1 align="center">Team Budget Tracker</h1>

<p align="center">
  A full-stack, real-time expense tracking app built for teams.<br/>
  Track spending, set budgets, analyze trends — together.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-8.x-47A248?logo=mongodb" alt="MongoDB" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
  - [1. Clone & Install](#1-clone--install)
  - [2. MongoDB Atlas Setup](#2-mongodb-atlas-setup)
  - [3. Server Configuration](#3-server-configuration)
  - [4. Seed the Database](#4-seed-the-database)
  - [5. Start Development](#5-start-development)
- [Connecting Your Phone](#-connecting-your-phone)
  - [Using Expo Go (Recommended)](#using-expo-go-recommended)
  - [Multiple Phones / Team Testing](#multiple-phones--team-testing)
  - [Android Emulator](#android-emulator)
  - [iOS Simulator](#ios-simulator)
- [API Base URL Configuration](#-api-base-url-configuration)
- [Building for Production](#-building-for-production)
  - [Production Server Deployment](#production-server-deployment)
  - [Production Mobile Build](#production-mobile-build)
- [API Reference](#-api-reference)
- [App Screens & User Flow](#-app-screens--user-flow)
- [Design System & Theming](#-design-system--theming)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Team Budget Tracker** is a monorepo mobile application that lets teams (or solo users) collaboratively track expenses, set category budgets, view analytics, and gain AI-like spending insights — all backed by a persistent cloud database.

It was built for the **Code Sprint** hackathon to demonstrate a production-grade, full-stack React Native application with modern architecture patterns.

### How It Works (High Level)

```
┌─────────────────┐      HTTPS/REST       ┌──────────────────┐      Mongoose       ┌──────────────┐
│   Expo / RN     │  ◄──────────────────►  │  Express Server  │  ◄───────────────►  │ MongoDB Atlas│
│   (Frontend)    │      JWT Auth          │  (Node.js API)   │     ODM             │  (Cloud DB)  │
└─────────────────┘                        └──────────────────┘                     └──────────────┘
       │                                          │
       ├─ React Context (state)                   ├─ Auth (JWT + bcrypt)
       ├─ AsyncStorage (cache)                    ├─ Team management
       ├─ Axios (HTTP client)                     ├─ Expense CRUD
       └─ Expo Router (navigation)                └─ Analytics engine
```

---

## ✨ Features

### 💰 Expense Tracking
- Add expenses with amount, category, note, date, and team member attribution
- 6 built-in categories: Travel, Food, Equipment, Software, Operations, Misc
- Edit and delete expenses (owner or admin)
- Real-time sync across team members

### 📊 Analytics & Insights
- **Pie chart** — category spending breakdown
- **Bar chart** — member spending comparison
- **Line chart** — 6-month trend analysis
- **Smart insights** — auto-detected budget alerts, spending trend warnings, top spender highlights
- Period filtering: daily / weekly / monthly / total

### 📅 Calendar View
- Heatmap calendar showing spending intensity per day
- Daily summary with transaction list
- Monthly stats (total, active days, daily average)

### 👥 Team Collaboration
- Create teams with auto-generated invite codes
- Join teams via 6-character alphanumeric code
- Admin/Member role system
- Per-category budget limits (admin configurable)
- Member spending leaderboard

### 🔐 Authentication
- JWT-based login/register
- bcrypt password hashing (10 salt rounds)
- Auto-login via cached token (AsyncStorage)
- Graceful token expiry handling

### 🌙 Dark Mode
- **Robust dark theme** — not just color inversion
- Hand-picked color palette for both themes (60+ tokens)
- Theme persisted across app restarts
- Toggle from dashboard or profile screen

### 🎯 Solo Mode
- Skip team creation — use the app individually
- All features work in solo mode
- Join a team later anytime

### 🌱 Seed Data
- Pre-loaded demo data for first-run experience
- 4 users, 1 team, 32 realistic expenses across 3 months
- Ready-to-use demo credentials

---

## 🏗 Architecture

The project follows a **monorepo** structure with two independent packages:

```
code-sprint/                  ← Root (monorepo orchestrator)
├── frontend/                 ← Expo / React Native app
│   ├── app/                  ← File-based routing (Expo Router)
│   ├── context/              ← Global state (React Context + API calls)
│   ├── services/             ← API client (Axios) + storage (AsyncStorage)
│   ├── constants/            ← Theme system, category definitions
│   └── components/           ← Reusable UI components
│
├── server/                   ← Node.js / Express backend
│   └── src/
│       ├── models/           ← Mongoose schemas (User, Team, Expense)
│       ├── routes/           ← REST endpoints (auth, teams, expenses, analytics)
│       ├── middleware/       ← JWT auth middleware
│       ├── seed.ts           ← Database seeder
│       └── index.ts          ← Server entry point
│
└── package.json              ← Root scripts (concurrently runs both)
```

### Data Flow

```
User Action → React Context → Axios API Call → Express Route → Mongoose → MongoDB Atlas
                  ↓                                                           ↓
            Local state update                                          Persisted data
                  ↓
            AsyncStorage cache (token, user, team, dark mode preference)
```

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Mobile UI** | React Native | 0.81 | Cross-platform mobile framework |
| **Framework** | Expo SDK | 54 | Managed workflow, OTA updates |
| **Navigation** | Expo Router | 6.x | File-based routing with typed routes |
| **Language** | TypeScript | 5.x | Type safety across full stack |
| **State** | React Context + useReducer | — | Global state management |
| **HTTP** | Axios | 1.x | API client with interceptors |
| **Cache** | AsyncStorage | 2.2 | Persistent local storage |
| **Charts** | react-native-chart-kit | 6.12 | Pie, bar, line charts |
| **Gradients** | expo-linear-gradient | 15.x | Gradient UI elements |
| **Icons** | @expo/vector-icons (Ionicons) | 15.x | 700+ icons |
| **Backend** | Express.js | 4.x | REST API server |
| **Database** | MongoDB Atlas | — | Cloud-hosted NoSQL |
| **ODM** | Mongoose | 8.x | Schema validation, hooks |
| **Auth** | jsonwebtoken + bcryptjs | — | JWT tokens + password hashing |
| **Validation** | express-validator | 7.x | Request body validation |

---

## 📁 Project Structure

```
code-sprint/
├── package.json                      # Monorepo scripts
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx               # Root layout (auth routing)
│   │   ├── index.tsx                 # Splash screen
│   │   ├── login.tsx                 # Login / Sign Up
│   │   ├── onboarding.tsx            # Team create / join / skip
│   │   └── (tabs)/
│   │       ├── _layout.tsx           # Tab navigator
│   │       ├── index.tsx             # Dashboard / Home
│   │       ├── analytics.tsx         # Charts & analytics
│   │       ├── add-expense.tsx       # Add expense form
│   │       ├── calendar.tsx          # Calendar heatmap
│   │       └── team.tsx              # Team & Profile
│   │
│   ├── context/
│   │   └── app-context.tsx           # Global state + API integration
│   │
│   ├── services/
│   │   ├── api.ts                    # Axios client + endpoints
│   │   └── storage.ts               # AsyncStorage wrapper
│   │
│   ├── constants/
│   │   ├── theme.ts                  # Design tokens (light + dark)
│   │   └── categories.ts            # Category definitions
│   │
│   ├── app.json                      # Expo configuration
│   └── package.json                  # Frontend dependencies
│
├── server/
│   ├── src/
│   │   ├── index.ts                  # Express entry + MongoDB connect
│   │   ├── seed.ts                   # Database seeder
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts              # User schema (bcrypt hooks)
│   │   │   ├── Team.ts              # Team schema (invite codes)
│   │   │   └── Expense.ts           # Expense schema (indexed)
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts              # POST /register, /login, GET /me
│   │   │   ├── teams.ts             # CRUD + join/leave
│   │   │   ├── expenses.ts          # CRUD + filters
│   │   │   └── analytics.ts         # Summary, breakdowns, insights
│   │   │
│   │   └── middleware/
│   │       └── auth.ts              # JWT verification middleware
│   │
│   ├── .env.example                  # Environment variable template
│   ├── package.json                  # Server dependencies
│   └── tsconfig.json                 # TS config
│
└── .gitignore
```

---

## 📋 Prerequisites

Before you begin, make sure you have:

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **Git** | any | `git --version` |
| **Expo Go** app | Latest | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779) |
| **MongoDB Atlas** account | Free tier | [cloud.mongodb.com](https://cloud.mongodb.com) |

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/AYUSHCODESIT/code-sprint.git
cd code-sprint

# Install all dependencies (root + frontend + server)
npm install
npm run install:all
```

### 2. MongoDB Atlas Setup

> Free tier (M0) is more than enough — no credit card required.

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → sign up / log in
2. Click **"Build a Database"** → select **M0 Free** → choose any region
3. **Create a Database User:**
   - Username: `youruser`
   - Password: `yourpassword` (save this!)
4. **Network Access** → click **"Add IP Address"** → select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. **Connect** → **"Drivers"** → **"Node.js"** → copy the connection string

Your connection string will look like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3. Server Configuration

```bash
# Create environment file
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
# Paste your MongoDB Atlas connection string
MONGODB_URI="mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/team-budget-tracker?retryWrites=true&w=majority"

# JWT secret — use a long random string in production
JWT_SECRET=your-super-secret-key-change-this

# Server port
PORT=5000
```

> ⚠️ **Important:** Add the database name (`team-budget-tracker`) at the end of the URI path before the `?` query params.

### 4. Seed the Database

```bash
cd server
npm run seed
```

Expected output:
```
🔗 Connected to MongoDB
🗑️  Cleared existing data
👥 Created 4 users
🏢 Created team: Innov8 Labs (code: INNOV8X)
💰 Created 32 expenses
✅ Seed complete!
─────────────────────────────────
Test login credentials:
  Email: arjun@team.com
  Password: password123
  Team invite code: INNOV8X
─────────────────────────────────
```

### 5. Start Development

From the **project root**:

```bash
# Start both frontend + server simultaneously
npm run dev
```

Or start them separately in two terminals:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

The server runs on `http://localhost:5000`. Verify it:
```bash
curl http://localhost:5000/api/health
# → {"status":"ok","timestamp":"2026-04-26T..."}
```

---

## 📱 Connecting Your Phone

### Using Expo Go (Recommended)

1. Install **Expo Go** from [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Start the frontend:
   ```bash
   cd frontend && npm run tunnel
   ```
   > `tunnel` mode makes the app accessible over the internet — no LAN config needed.
3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Multiple Phones / Team Testing

To test with multiple phones (e.g., different team members):

1. **Each phone** installs Expo Go
2. **Start with tunnel mode** so all phones can connect regardless of network:
   ```bash
   cd frontend && npm run tunnel
   ```
3. **All phones scan the same QR code**
4. Each person logs in with a different account:
   | Name | Email | Password |
   |------|-------|----------|
   | Arjun Mehta | arjun@team.com | password123 |
   | Priya Sharma | priya@team.com | password123 |
   | Ravi Kumar | ravi@team.com | password123 |
   | Sneha Patel | sneha@team.com | password123 |
5. They all share the same team data in real-time!

> 💡 **New user?** Sign up on any phone → use invite code `INNOV8X` to join the existing team.

### Android Emulator

```bash
cd frontend && npm run android
```

Requires Android SDK. The API URL is pre-configured to `10.0.2.2:5000` which maps to your machine's localhost from the emulator.

### iOS Simulator

```bash
cd frontend && npm run ios
```

Requires macOS with Xcode installed.

---

## 🌐 API Base URL Configuration

The API base URL is configured in `frontend/services/api.ts`:

```typescript
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'http://localhost:5000/api';
```

**Change this based on your setup:**

| Scenario | BASE_URL |
|----------|----------|
| Android Emulator | `http://10.0.2.2:5000/api` (default) |
| iOS Simulator | `http://localhost:5000/api` |
| Physical phone (same WiFi) | `http://YOUR_PC_IP:5000/api` |
| Tunnel mode (Expo Go) | `http://YOUR_PC_IP:5000/api` |
| Production server | `https://your-api.example.com/api` |

### Finding Your PC's IP Address

```bash
# Linux
hostname -I | awk '{print $1}'

# macOS
ipconfig getifaddr en0

# Windows
ipconfig | findstr IPv4
```

Example: If your IP is `192.168.1.42`, set:
```typescript
const BASE_URL = 'http://192.168.1.42:5000/api';
```

> ⚠️ **Tunnel mode note:** When using `npm run tunnel`, the frontend is served via Expo's cloud, but API calls still go to your machine. So you MUST set `BASE_URL` to your machine's IP (not `localhost`), and your server's port 5000 must be accessible.

---

## 🏭 Building for Production

### Production Server Deployment

1. **Build the server:**
   ```bash
   cd server
   npm run build        # Compiles TS → dist/
   ```

2. **Start in production:**
   ```bash
   NODE_ENV=production npm start   # Runs dist/index.js
   ```

3. **Deploy to a hosting platform** (Railway, Render, Fly.io, AWS, etc.):
   - Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`)
   - Start command: `npm start`
   - The platform will give you a public URL like `https://your-api.onrender.com`

4. **Update the frontend API URL:**
   ```typescript
   // frontend/services/api.ts
   const BASE_URL = 'https://your-api.onrender.com/api';
   ```

### Production Mobile Build

#### Development Build (APK / IPA for testing)

```bash
cd frontend

# Android APK
npx eas build --platform android --profile preview

# iOS (requires Apple Developer account)
npx eas build --platform ios --profile preview
```

#### Production Build (Play Store / App Store)

```bash
cd frontend

# Android AAB (Play Store)
npx eas build --platform android --profile production

# iOS (App Store Connect)
npx eas build --platform ios --profile production
```

> First-time EAS users: run `npx eas login` and `npx eas build:configure` first.

#### Distributing to Team

For testing builds without stores:

```bash
# Generates a shareable APK link
npx eas build --platform android --profile preview

# After build completes, EAS gives a download URL
# Share this URL with team members to install directly
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication required unless noted.

### Auth (`/api/auth`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | `{ name, email, password }` | Create account → returns JWT |
| `POST` | `/login` | `{ email, password }` | Login → returns JWT |
| `GET` | `/me` | — | Get current user (requires token) |

### Teams (`/api/teams`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/` | `{ name }` | Create team → returns invite code |
| `POST` | `/join` | `{ inviteCode }` | Join team by code |
| `GET` | `/:id` | — | Get team details + members |
| `PUT` | `/:id/budgets` | `{ budgets: { Travel: 5000, ... } }` | Update category budgets |
| `POST` | `/leave` | — | Leave current team |

### Expenses (`/api/expenses`)

| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| `GET` | `/` | `?period=monthly&member=id&category=Food` | List expenses (filtered) |
| `POST` | `/` | `{ amount, category, note?, dateTime?, memberId? }` | Create expense |
| `PUT` | `/:id` | `{ amount?, category?, note? }` | Update expense |
| `DELETE` | `/:id` | — | Delete expense |

### Analytics (`/api/analytics`)

| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| `GET` | `/summary` | `?period=monthly` | Total spend, txn count, categories |
| `GET` | `/category-breakdown` | `?period=monthly` | Per-category amounts + budget usage |
| `GET` | `/member-breakdown` | `?period=monthly` | Per-member spending + count |
| `GET` | `/monthly-trend` | — | Last 6 months of spending |
| `GET` | `/insights` | — | Smart budget alerts + trends |

### Auth Header

All authenticated requests must include:
```
Authorization: Bearer <jwt_token>
```

---

## 🖥 App Screens & User Flow

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│  Splash   │ ──► │  Login   │ ──► │ Onboarding │ ──► │  Tabs    │
│  Screen   │     │ Register │     │ Create/Join │     │  (Home)  │
└──────────┘     └──────────┘     │  or Skip   │     └──────────┘
                       ▲           └────────────┘          │
                       │                                    ▼
                  Token expired                     ┌──────────────┐
                  or logout                         │   Tab Bar     │
                                                    │───────────────│
                                                    │ Home          │
                                                    │ Analytics     │
                                                    │ + Add (FAB)   │
                                                    │ Calendar      │
                                                    │ Profile       │
                                                    └──────────────┘
```

| Screen | Description |
|--------|-------------|
| **Splash** | Animated logo, auto-redirects based on cached token |
| **Login** | Sign in / Sign up toggle, demo credentials hint |
| **Onboarding** | Create team, join with code, or skip to solo |
| **Home** | Balance card, quick stats, insights, category grid, recent transactions |
| **Analytics** | Pie/bar/line charts, category details, spending leaderboard |
| **Add Expense** | Amount, category chips, member selector, date, note, receipt upload |
| **Calendar** | Heatmap grid, daily spending, today's transactions |
| **Profile** | User info, team card with invite code, member list, budget bars, sign out |

---

## 🎨 Design System & Theming

The theme is defined in `frontend/constants/theme.ts` with **60+ design tokens**.

### Light Mode Palette
| Token | Color | Usage |
|-------|-------|-------|
| `bg` | `#F5F5FA` | Screen background |
| `card` | `#FFFFFF` | Card surfaces |
| `text` | `#1A1B2E` | Primary text |
| `accent` | `#6C5CE7` | Purple primary |
| `success` | `#00B894` | Positive indicators |
| `danger` | `#FF6B6B` | Warnings, overspend |

### Dark Mode Palette
| Token | Color | Usage |
|-------|-------|-------|
| `bg` | `#0B0D17` | Deep navy background |
| `card` | `#141625` | Dark card surfaces |
| `text` | `#E8E9F0` | Soft white text |
| `accent` | `#7C6EF7` | Brighter purple for contrast |
| `success` | `#55EFC4` | Boosted green |
| `danger` | `#FF7675` | Boosted red |

### Usage in Components

```typescript
import { getTheme, Typography, Radius, Shadows } from '@/constants/theme';

// In component:
const { isDarkMode } = useApp();
const t = getTheme(isDarkMode);

<View style={{ backgroundColor: t.card, borderRadius: Radius.xl }}>
  <Text style={[Typography.headingMedium, { color: t.text }]}>Hello</Text>
</View>
```

---

## 🗄 Database Schema

### User
```typescript
{
  name: string;          // "Arjun Mehta"
  email: string;         // unique, lowercase
  password: string;      // bcrypt hashed
  role: 'admin' | 'member';
  avatar: string | null;
  teamId: ObjectId | null;
  timestamps: true       // createdAt, updatedAt
}
```

### Team
```typescript
{
  name: string;          // "Innov8 Labs"
  inviteCode: string;    // "INNOV8X" (unique, 6 chars)
  createdBy: ObjectId;   // ref → User
  budgets: Map<string, number>;  // { Travel: 5000, Food: 3000, ... }
  timestamps: true
}
```

### Expense
```typescript
{
  amount: number;        // 1250
  category: string;      // "Travel"
  note: string;          // "Cab to client office"
  dateTime: Date;        // indexed for queries
  memberId: ObjectId;    // ref → User
  memberName: string;    // denormalized for performance
  teamId: ObjectId;      // ref → Team (indexed)
  receiptUrl: string | null;
  timestamps: true
}
// Compound index: { teamId: 1, dateTime: -1 }
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ | — | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWT tokens |
| `PORT` | ❌ | `5000` | Server port |

### Frontend (`frontend/services/api.ts`)

| Variable | Location | Description |
|----------|----------|-------------|
| `BASE_URL` | Line 14-16 | API server URL (change per environment) |

---

## 🐛 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| `Cannot find module 'axios'` | Run `cd frontend && npm install axios` |
| `Cannot find module '@react-native-async-storage/...'` | Run `cd frontend && npx expo install @react-native-async-storage/async-storage` |
| `MONGODB_URI not set` | Create `server/.env` from `.env.example` and fill in your Atlas URI |
| `MongoServerError: bad auth` | Check username/password in your Atlas URI. URL-encode special characters. |
| `Network Error` on phone | Set `BASE_URL` in `api.ts` to your computer's IP, not `localhost` |
| `Token expired` | The app auto-clears and redirects to login. Just log in again. |
| QR code not scanning | Use **tunnel mode**: `cd frontend && npm run tunnel` |
| `No Android SDK found` | Use Expo Go on a physical device instead of emulator |
| Server exits immediately | Check that MongoDB Atlas Network Access allows your IP (`0.0.0.0/0`) |
| `ECONNREFUSED` on emulator | Use `10.0.2.2` (Android) or `localhost` (iOS) as host in `BASE_URL` |
| Charts not rendering | Ensure `react-native-chart-kit` and `react-native-svg` are installed |

### Resetting Everything

```bash
# Re-seed the database (clears all data + recreates demo data)
cd server && npm run seed

# Clear frontend cache
cd frontend && npx expo start --clear

# Nuclear option — reinstall everything
rm -rf node_modules frontend/node_modules server/node_modules
npm install && npm run install:all
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Make your changes
4. Run lint: `cd frontend && npm run lint`
5. Commit (`git commit -m "feat: add amazing thing"`)
6. Push (`git push origin feature/amazing-thing`)
7. Open a Pull Request

### Code Style

- TypeScript strict mode across full stack
- Functional components with hooks
- All API calls go through `services/api.ts`
- All storage access through `services/storage.ts`
- Theme tokens from `constants/theme.ts` — no hardcoded colors
- File-based routing via Expo Router

---

## 📄 License

This project was built for the **Code Sprint** hackathon.

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  Built with 💜 by the Code Sprint team
</p>
