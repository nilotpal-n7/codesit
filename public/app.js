/* ═══════════════════════════════════════════════════════════════════════════
   Team Budget Tracker — Web SPA
   ═══════════════════════════════════════════════════════════════════════════ */

const API_BASE = '/api';

const CATEGORIES = [
  { id:'travel', name:'Travel', icon:'airplane', color:'#6C5CE7' },
  { id:'food', name:'Food', icon:'fast-food', color:'#E17055' },
  { id:'equipment', name:'Equipment', icon:'construct', color:'#00B894' },
  { id:'software', name:'Software', icon:'laptop', color:'#0984E3' },
  { id:'operations', name:'Operations', icon:'cog', color:'#FDAA5E' },
  { id:'misc', name:'Misc', icon:'cube', color:'#636E72' },
];

/* ─── API Client ───────────────────────────────────────────────────────────── */
const api = {
  token: localStorage.getItem('bt_token'),

  async req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
    return data;
  },

  setToken(t) { this.token = t; localStorage.setItem('bt_token', t); },
  clearToken() { this.token = null; localStorage.removeItem('bt_token'); localStorage.removeItem('bt_user'); },

  login: (e, p) => api.req('POST', '/auth/login', { email: e, password: p }),
  register: (n, e, p) => api.req('POST', '/auth/register', { name: n, email: e, password: p }),
  getMe: () => api.req('GET', '/auth/me'),
  createTeam: (n) => api.req('POST', '/teams', { name: n }),
  joinTeam: (c) => api.req('POST', '/teams/join', { inviteCode: c }),
  getTeam: (id) => api.req('GET', `/teams/${id}`),
  leaveTeam: () => api.req('POST', '/teams/leave'),
  listExpenses: () => api.req('GET', '/expenses'),
  createExpense: (d) => api.req('POST', '/expenses', d),
  deleteExpense: (id) => api.req('DELETE', `/expenses/${id}`),
  getInsights: () => api.req('GET', '/analytics/insights'),
};

/* ─── State ────────────────────────────────────────────────────────────────── */
const state = {
  user: null, team: null, members: [], expenses: [],
  filterPeriod: 'monthly', insights: [],
  isDark: localStorage.getItem('bt_theme') !== 'light',
  currentView: 'login',
  chartInstance: null
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;
const catOf = (n) => CATEGORIES.find(c => c.name === n) || CATEGORIES[5];
const app = $('#app');

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
  localStorage.setItem('bt_theme', state.isDark ? 'dark' : 'light');
}

function toast(msg, type = 'info') {
  const t = el('div', `toast toast-${type}`, msg);
  $('#toast-container').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
}

function filterExpenses() {
  const now = new Date();
  return state.expenses.filter(e => {
    const d = new Date(e.dateTime);
    if (state.filterPeriod === 'daily') return d.toDateString() === now.toDateString();
    if (state.filterPeriod === 'weekly') return d >= new Date(now - 7*864e5);
    if (state.filterPeriod === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  }).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
}

/* ─── Router ───────────────────────────────────────────────────────────────── */
function navigate(view) {
  state.currentView = view;
  location.hash = view;
  render();
}

window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1) || 'login';
  if (!state.user && h !== 'login') return navigate('login');
  state.currentView = h;
  render();
});

/* ─── Render ───────────────────────────────────────────────────────────────── */
function render() {
  applyTheme();
  if (state.chartInstance) { state.chartInstance.destroy(); state.chartInstance = null; }
  const v = state.currentView;
  if (!state.user && v !== 'login') return navigate('login');
  if (v === 'login') return renderLogin();
  renderApp();
}

/* ─── Login View ───────────────────────────────────────────────────────────── */
function renderLogin() {
  let isLogin = true, loading = false;
  function draw() {
    app.innerHTML = `
      <div class="login-page">
        <div class="login-header">
          <div class="login-logo"><ion-icon name="wallet"></ion-icon></div>
          <h1>${isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>Track your team's expenses smartly</p>
        </div>
        <div class="login-form-wrap">
          <div class="login-card">
            <div class="tab-bar" style="margin-bottom:20px">
              <div class="tab ${isLogin ? 'active' : ''}" id="tab-signin">Sign In</div>
              <div class="tab ${!isLogin ? 'active' : ''}" id="tab-signup">Sign Up</div>
            </div>
            ${isLogin ? `<div class="login-hint"><ion-icon name="information-circle"></ion-icon> Demo: arjun@team.com / password123</div>` : ''}
            ${!isLogin ? `<div class="input-group"><span class="icon"><ion-icon name="person"></ion-icon></span><input id="inp-name" placeholder="Full Name"></div>` : ''}
            <div class="input-group"><span class="icon"><ion-icon name="mail"></ion-icon></span><input id="inp-email" type="email" placeholder="Email Address"></div>
            <div class="input-group"><span class="icon"><ion-icon name="lock-closed"></ion-icon></span><input id="inp-pass" type="password" placeholder="Password"></div>
            <button class="btn btn-primary w-full" id="btn-submit" ${loading ? 'disabled' : ''}>
              ${loading ? '<div class="spinner"></div>' : (isLogin ? 'Sign In →' : 'Create Account →')}
            </button>
          </div>
        </div>
      </div>`;

    $('#tab-signin').onclick = () => { isLogin = true; draw(); };
    $('#tab-signup').onclick = () => { isLogin = false; draw(); };
    $('#btn-submit').onclick = async () => {
      const email = $('#inp-email').value.trim();
      const pass = $('#inp-pass').value.trim();
      if (!email || !pass) return toast('Please fill all fields', 'error');
      loading = true; draw();
      try {
        if (isLogin) {
          const data = await api.login(email, pass);
          api.setToken(data.token);
          state.user = data.user;
        } else {
          const name = $('#inp-name').value.trim();
          if (!name) { loading = false; draw(); return toast('Name is required', 'error'); }
          const data = await api.register(name, email, pass);
          api.setToken(data.token);
          state.user = data.user;
        }
        localStorage.setItem('bt_user', JSON.stringify(state.user));
        await loadData();
        navigate('dashboard');
        toast('Welcome! 🎉', 'success');
      } catch (err) { toast(err.message, 'error'); }
      loading = false; draw();
    };
    $$('.input-group input').forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-submit').click(); });
    });
  }
  draw();
}

/* ─── Data Loading ─────────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const [expData] = await Promise.all([api.listExpenses()]);
    state.expenses = expData.expenses || [];
    if (state.user?.teamId) {
      try {
        const td = await api.getTeam(state.user.teamId);
        state.team = td.team; state.members = td.members || [];
      } catch { state.team = null; state.members = []; }
    }
    try { const ins = await api.getInsights(); state.insights = ins.insights || []; } catch {}
  } catch {}
}

/* ─── App Shell ────────────────────────────────────────────────────────────── */
function renderApp() {
  const v = state.currentView;
  app.innerHTML = `
    <div class="app-shell">
      <!-- Desktop Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon"><ion-icon name="wallet"></ion-icon></div>
          <span>Budget Tracker</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-item ${v==='dashboard'?'active':''}" data-nav="dashboard"><span class="nav-icon"><ion-icon name="home"></ion-icon></span>Dashboard</div>
          <div class="nav-item ${v==='analytics'?'active':''}" data-nav="analytics"><span class="nav-icon"><ion-icon name="pie-chart"></ion-icon></span>Analytics</div>
          <div class="nav-item ${v==='calendar'?'active':''}" data-nav="calendar"><span class="nav-icon"><ion-icon name="calendar"></ion-icon></span>Calendar</div>
          <div class="nav-item ${v==='team'?'active':''}" data-nav="team"><span class="nav-icon"><ion-icon name="people"></ion-icon></span>Team</div>
          <div class="nav-item" id="nav-add"><span class="nav-icon"><ion-icon name="add-circle"></ion-icon></span>Add Expense</div>
        </nav>
        <div class="sidebar-footer">
          <div class="nav-item" id="btn-theme"><span class="nav-icon"><ion-icon name="${state.isDark?'sunny':'moon'}"></ion-icon></span>${state.isDark?'Light':'Dark'} Mode</div>
          <div class="nav-item" id="btn-logout"><span class="nav-icon"><ion-icon name="log-out"></ion-icon></span>Sign Out</div>
        </div>
      </aside>
      
      <main class="main-content" id="main"></main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <div class="b-nav-item ${v==='dashboard'?'active':''}" data-nav="dashboard">
          <ion-icon name="${v==='dashboard'?'home':'home-outline'}"></ion-icon><span>Home</span>
        </div>
        <div class="b-nav-item ${v==='analytics'?'active':''}" data-nav="analytics">
          <ion-icon name="${v==='analytics'?'pie-chart':'pie-chart-outline'}"></ion-icon><span>Analytics</span>
        </div>
        <div class="b-nav-add" id="mobile-add"><ion-icon name="add"></ion-icon></div>
        <div class="b-nav-item ${v==='calendar'?'active':''}" data-nav="calendar">
          <ion-icon name="${v==='calendar'?'calendar':'calendar-outline'}"></ion-icon><span>Calendar</span>
        </div>
        <div class="b-nav-item ${v==='team'?'active':''}" data-nav="team">
          <ion-icon name="${v==='team'?'people':'people-outline'}"></ion-icon><span>Team</span>
        </div>
      </nav>
    </div>`;

  $$('[data-nav]').forEach(n => n.onclick = () => navigate(n.dataset.nav));
  $('#nav-add').onclick = () => showAddExpense();
  $('#mobile-add').onclick = () => showAddExpense();
  $('#btn-theme').onclick = () => { state.isDark = !state.isDark; render(); };
  $('#btn-logout').onclick = () => { api.clearToken(); state.user = null; state.team = null; state.expenses = []; navigate('login'); };

  const main = $('#main');
  if (v === 'dashboard') renderDashboard(main);
  else if (v === 'analytics') renderAnalytics(main);
  else if (v === 'calendar') renderCalendar(main);
  else if (v === 'team') renderTeam(main);
  else renderDashboard(main);
}

/* ─── Dashboard View ───────────────────────────────────────────────────────── */
function renderDashboard(container) {
  const filtered = filterExpenses();
  const now = new Date();
  const monthlyExps = state.expenses.filter(e => { const d = new Date(e.dateTime); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); });
  const monthlySpend = monthlyExps.reduce((s,e) => s + e.amount, 0);
  const totalBudget = 19500;
  const remaining = Math.max(totalBudget - monthlySpend, 0);
  const pct = totalBudget > 0 ? Math.round(monthlySpend / totalBudget * 100) : 0;
  
  const periods = ['daily','weekly','monthly','total'];

  container.innerHTML += `
    <div class="animate-in">
      <div class="topbar">
        <div class="topbar-greeting">
          <div class="greeting-sub">${greeting()}</div>
          <h2>${state.user?.name?.split(' ')[0] || 'there'} 👋</h2>
        </div>
        <div class="topbar-actions">
          <button class="btn-icon" id="btn-refresh" title="Refresh"><ion-icon name="refresh"></ion-icon></button>
          <button class="btn-icon mobile-only" id="btn-theme-mobile" style="display:${window.innerWidth<768?'flex':'none'}"><ion-icon name="${state.isDark?'sunny':'moon'}"></ion-icon></button>
          <button class="btn-icon mobile-only" id="btn-logout-mobile" style="display:${window.innerWidth<768?'flex':'none'}"><ion-icon name="log-out"></ion-icon></button>
        </div>
      </div>

      <div class="balance-card">
        <div class="label">Monthly Spending</div>
        <div class="amount">${fmt(monthlySpend)}</div>
        <div class="balance-meta">
          <span class="team-name">${state.team?.name || 'Solo Mode'}</span>
          <span class="badge ${pct>80?'badge-danger':'badge-success'}">${pct}% used</span>
        </div>
        <div class="progress-bg" style="margin-top:12px">
          <div class="progress-fill" style="width:${Math.min(pct,100)}%;background:${pct>80?'#FF7675':'#55EFC4'}"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon spent"><ion-icon name="arrow-up-circle"></ion-icon></div><div class="stat-label">Spent</div><div class="stat-value">${fmt(monthlySpend)}</div></div>
        <div class="stat-card"><div class="stat-icon remaining"><ion-icon name="wallet"></ion-icon></div><div class="stat-label">Remaining</div><div class="stat-value">${fmt(remaining)}</div></div>
        <div class="stat-card"><div class="stat-icon txns"><ion-icon name="receipt"></ion-icon></div><div class="stat-label">Transactions</div><div class="stat-value">${filtered.length}</div></div>
      </div>

      <div class="filter-row">
        ${periods.map(p => `<div class="filter-tab ${state.filterPeriod===p?'active':''}" data-period="${p}">${p[0].toUpperCase()+p.slice(1)}</div>`).join('')}
      </div>

      ${state.insights.length ? `
        <div style="margin-bottom:20px">
          <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:12px">🧠 Smart Insights</h3>
          ${state.insights.slice(0,2).map(ins => `
            <div class="insight-card">
              <div class="insight-icon" style="background:${ins.color}15;color:${ins.color}"><ion-icon name="${ins.icon==='trending-up'?'trending-up':ins.icon==='warning'?'warning':'person'}"></ion-icon></div>
              <div class="insight-msg">${ins.message}</div>
            </div>`).join('')}
        </div>` : ''}

      <div class="txn-section">
        <h3>Recent Transactions</h3>
        <div class="txn-list">
          ${filtered.length ? filtered.slice(0,10).map(e => {
            const c = catOf(e.category);
            return `<div class="txn-row" data-id="${e._id}">
              <div class="txn-icon" style="background:${c.color}12; color:${c.color}"><ion-icon name="${c.icon}"></ion-icon></div>
              <div class="txn-info">
                <div class="txn-note">${e.note || e.category}</div>
                <div class="txn-meta">${e.memberName} · ${new Date(e.dateTime).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
              </div>
              <div class="txn-amount">-${fmt(e.amount)}</div>
              <button class="btn btn-ghost btn-sm del-btn" data-del="${e._id}" title="Delete"><ion-icon name="trash"></ion-icon></button>
            </div>`;
          }).join('') : '<div class="empty-state"><div class="empty-icon"><ion-icon name="receipt-outline"></ion-icon></div><p>No transactions yet</p></div>'}
        </div>
      </div>
    </div>`;

  $$('[data-period]').forEach(t => t.onclick = () => { state.filterPeriod = t.dataset.period; render(); });
  $('#btn-refresh').onclick = async () => { await loadData(); render(); toast('Refreshed!', 'success'); };
  if($('#btn-theme-mobile')) $('#btn-theme-mobile').onclick = () => { state.isDark = !state.isDark; render(); };
  if($('#btn-logout-mobile')) $('#btn-logout-mobile').onclick = () => { api.clearToken(); navigate('login'); };

  $$('.del-btn').forEach(b => b.onclick = async (ev) => {
    ev.stopPropagation();
    if (!confirm('Delete this expense?')) return;
    try { await api.deleteExpense(b.dataset.del); await loadData(); render(); toast('Deleted', 'success'); } catch(err) { toast(err.message,'error'); }
  });
}

/* ─── Analytics View ───────────────────────────────────────────────────────── */
function renderAnalytics(container) {
  const filtered = filterExpenses();
  const catMap = {};
  filtered.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + e.amount; });
  const catBreakdown = CATEGORIES.map(c => ({
    ...c, amount: catMap[c.name]||0,
    budgetUsed: Math.min((catMap[c.name]||0) / ({Travel:5000,Food:3000,Equipment:4000,Software:2500,Operations:3500,Misc:1500}[c.name]||1500) * 100, 100)
  })).filter(c => c.amount > 0).sort((a,b)=>b.amount-a.amount);

  const memMap = {};
  filtered.forEach(e => {
    if(!memMap[e.memberId]) memMap[e.memberId] = { name: e.memberName, amount: 0, count: 0 };
    memMap[e.memberId].amount += e.amount;
    memMap[e.memberId].count += 1;
  });
  const leaderBoard = Object.values(memMap).sort((a,b) => b.amount - a.amount);

  container.innerHTML += `
    <div class="animate-in">
      <div class="topbar"><div class="topbar-greeting"><h2>📈 Analytics</h2></div></div>
      
      <div class="chart-container">
        <canvas id="categoryChart" height="250"></canvas>
      </div>

      <div class="category-section">
        <h3>Category Breakdown</h3>
        <div class="category-grid" style="grid-template-columns: 1fr; gap: 12px; margin-bottom: 24px;">
          ${catBreakdown.length ? catBreakdown.map(c => `
            <div class="category-card" style="display:flex; align-items:center; gap:16px">
              <div class="cat-icon" style="background:${c.color}15; color:${c.color}"><ion-icon name="${c.icon}"></ion-icon></div>
              <div style="flex:1">
                <div class="cat-name" style="margin-top:0; font-size:0.875rem; font-weight:600; color:var(--text)">${c.name}</div>
                <div class="cat-bar" style="margin-top:4px; background:var(--input)"><div class="cat-bar-fill" style="width:${c.budgetUsed}%;background:${c.color}"></div></div>
              </div>
              <div class="cat-amount" style="margin-top:0">${fmt(c.amount)}</div>
            </div>`).join('') : '<div class="empty-state"><div class="empty-icon"><ion-icon name="pie-chart-outline"></ion-icon></div><p>No data</p></div>'}
        </div>
      </div>

      <div class="txn-section">
        <h3>Spending Leaderboard</h3>
        <div class="txn-list">
          ${leaderBoard.map((m, i) => `
            <div class="txn-row">
              <div class="txn-icon" style="background:${i===0?'#FDCB6E':i===1?'#B2BEC3':i===2?'#E17055':'var(--input)'}; color:${i<3?'#fff':'var(--text)'}; font-size:0.9rem; font-weight:800">#${i+1}</div>
              <div class="txn-info">
                <div class="txn-note">${m.name}</div>
                <div class="txn-meta">${m.count} expenses</div>
              </div>
              <div class="txn-amount" style="color:var(--text)">${fmt(m.amount)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  // Render Chart.js
  setTimeout(() => {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const isDark = state.isDark;
    state.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: catBreakdown.map(c => c.name),
        datasets: [{
          data: catBreakdown.map(c => c.amount),
          backgroundColor: catBreakdown.map(c => c.color),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: isDark ? '#E8E9F0' : '#1A1B2E', font: { family: 'Inter' } } }
        },
        cutout: '70%'
      }
    });
  }, 100);
}

/* ─── Calendar View ────────────────────────────────────────────────────────── */
function renderCalendar(container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const dailyTotals = {};
  state.expenses.forEach(e => {
    const d = new Date(e.dateTime);
    if(d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
    }
  });
  
  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const getHeatmapColor = (amount) => {
    if (!amount) return 'var(--input)';
    const intensity = amount / maxDaily;
    if (intensity < 0.2) return 'rgba(108, 92, 231, 0.2)';
    if (intensity < 0.5) return 'rgba(108, 92, 231, 0.5)';
    if (intensity < 0.8) return 'rgba(108, 92, 231, 0.8)';
    return '#6C5CE7';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const gridCells = [];
  
  for (let i = 0; i < firstDayIndex; i++) { gridCells.push('<div></div>'); }
  for (let d = 1; d <= daysInMonth; d++) {
    const amt = dailyTotals[d] || 0;
    const color = getHeatmapColor(amt);
    gridCells.push(`
      <div class="cal-cell ${amt>0?'has-expense':''}" style="background:${color}" title="${fmt(amt)}">
        ${d}
      </div>`);
  }

  container.innerHTML += `
    <div class="animate-in">
      <div class="topbar"><div class="topbar-greeting"><h2>📅 Calendar</h2><div class="greeting-sub">${now.toLocaleString('default', { month: 'long' })} ${year}</div></div></div>
      
      <div class="chart-container">
        <div class="calendar-grid">
          ${days.map(day => `<div class="cal-day-header">${day}</div>`).join('')}
          ${gridCells.join('')}
        </div>
      </div>
      
      <div class="txn-section">
        <h3>Highest Spending Days</h3>
        <div class="txn-list">
          ${Object.entries(dailyTotals).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([d, amt], i) => `
            <div class="txn-row">
              <div class="txn-icon" style="background:var(--accent-soft); color:var(--accent)"><ion-icon name="calendar"></ion-icon></div>
              <div class="txn-info">
                <div class="txn-note">${now.toLocaleString('default', { month: 'short' })} ${d}</div>
              </div>
              <div class="txn-amount" style="color:var(--text)">${fmt(amt)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ─── Add Expense Modal ────────────────────────────────────────────────────── */
function showAddExpense() {
  const overlay = el('div', 'modal-overlay');
  overlay.innerHTML = `
    <div class="modal">
      <h2>Add Expense</h2>
      <div class="input-group"><span class="icon"><ion-icon name="wallet"></ion-icon></span><input id="exp-amount" type="number" placeholder="Amount (₹)" min="0"></div>
      <div class="input-group"><span class="icon"><ion-icon name="folder-open"></ion-icon></span>
        <select id="exp-category" style="flex:1;padding:16px 0;color:var(--text);background:transparent">
          ${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="input-group"><span class="icon"><ion-icon name="document-text"></ion-icon></span><input id="exp-note" placeholder="Note (optional)"></div>
      <div class="input-group"><span class="icon"><ion-icon name="calendar"></ion-icon></span><input id="exp-date" type="date" value="${new Date().toISOString().split('T')[0]}" style="flex:1;padding:16px 0;color:var(--text)"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="exp-cancel">Cancel</button>
        <button class="btn btn-primary" id="exp-save">Save Expense</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  $('#exp-cancel').onclick = () => overlay.remove();
  $('#exp-save').onclick = async () => {
    const amount = parseFloat($('#exp-amount').value);
    if (!amount || amount <= 0) return toast('Enter a valid amount', 'error');
    try {
      await api.createExpense({
        amount,
        category: $('#exp-category').value,
        note: $('#exp-note').value || $('#exp-category').value,
        dateTime: new Date($('#exp-date').value).toISOString(),
        memberId: state.user._id,
        memberName: state.user.name,
      });
      overlay.remove();
      await loadData(); render();
      toast('Expense added! 🎉', 'success');
    } catch (err) { toast(err.message, 'error'); }
  };
}

/* ─── Team View ────────────────────────────────────────────────────────────── */
function renderTeam(container) {
  if (!state.team) return renderNoTeam(container);
  container.innerHTML += `
    <div class="animate-in">
      <div class="topbar">
        <div class="topbar-greeting"><h2>👥 Team Profile</h2></div>
      </div>
      <div class="team-header-card">
        <div style="font-size:0.75rem;opacity:0.7;margin-bottom:4px">Team Name</div>
        <div style="font-size:1.5rem;font-weight:800">${state.team.name}</div>
        <div style="margin-top:16px;font-size:0.75rem;opacity:0.7">Invite Code (click to copy)</div>
        <div class="invite-code" id="copy-code">${state.team.inviteCode}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="font-size:1.125rem;font-weight:700">Members (${state.members.length})</h3>
        <button class="btn btn-danger btn-sm" id="btn-leave">Leave Team</button>
      </div>
      <div class="member-list">
        ${state.members.map(m => `
          <div class="member-row">
            <div class="member-avatar">${m.name?.[0] || '?'}</div>
            <div class="member-info">
              <div class="member-name">${m.name}${m._id===state.user._id?' (You)':''}</div>
              <div class="member-role">${m.role === 'admin' ? '👑 Admin' : 'Member'} · ${m.email}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  $('#copy-code').onclick = () => {
    navigator.clipboard.writeText(state.team.inviteCode).then(() => toast('Code copied!','success'));
  };
  $('#btn-leave').onclick = async () => {
    if (!confirm('Leave this team?')) return;
    try {
      const data = await api.leaveTeam();
      api.setToken(data.token);
      state.team = null; state.members = [];
      const me = await api.getMe(); state.user = me.user;
      localStorage.setItem('bt_user', JSON.stringify(state.user));
      render(); toast('Left team', 'info');
    } catch(err) { toast(err.message,'error'); }
  };
}

function renderNoTeam(container) {
  container.innerHTML += `
    <div class="animate-in">
      <div class="topbar"><div class="topbar-greeting"><h2>👥 Team</h2></div></div>
      <div class="no-team-card">
        <div style="font-size:3rem"><ion-icon name="business"></ion-icon></div>
        <h3>No Team Yet</h3>
        <p>Create a new team or join one with an invite code.</p>
        <div class="no-team-actions">
          <button class="btn btn-primary" id="btn-create-team">Create Team</button>
          <button class="btn btn-secondary" id="btn-join-team">Join Team</button>
        </div>
      </div>
    </div>`;
  $('#btn-create-team').onclick = () => showTeamModal('create');
  $('#btn-join-team').onclick = () => showTeamModal('join');
}

function showTeamModal(mode) {
  const overlay = el('div', 'modal-overlay');
  overlay.innerHTML = `
    <div class="modal">
      <h2>${mode==='create'?'Create Team':'Join Team'}</h2>
      <div class="input-group">
        <span class="icon"><ion-icon name="${mode==='create'?'pencil':'key'}"></ion-icon></span>
        <input id="team-input" placeholder="${mode==='create'?'Team Name':'Invite Code'}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="team-cancel">Cancel</button>
        <button class="btn btn-primary" id="team-save">${mode==='create'?'Create':'Join'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.onclick = e => { if (e.target===overlay) overlay.remove(); };
  $('#team-cancel').onclick = () => overlay.remove();
  $('#team-save').onclick = async () => {
    const val = $('#team-input').value.trim();
    if (!val) return toast('Please enter a value', 'error');
    try {
      const data = mode === 'create' ? await api.createTeam(val) : await api.joinTeam(val);
      api.setToken(data.token);
      const me = await api.getMe(); state.user = me.user;
      localStorage.setItem('bt_user', JSON.stringify(state.user));
      await loadData(); overlay.remove(); render();
      toast(mode==='create'?'Team created! 🎉':'Joined team! 🎉', 'success');
    } catch(err) { toast(err.message, 'error'); }
  };
}

/* ─── Init ─────────────────────────────────────────────────────────────────── */
async function init() {
  applyTheme();
  const cached = localStorage.getItem('bt_user');
  if (api.token && cached) {
    try {
      const data = await api.getMe();
      state.user = data.user;
      localStorage.setItem('bt_user', JSON.stringify(state.user));
      await loadData();
      navigate(location.hash.slice(1) || 'dashboard');
    } catch {
      api.clearToken(); state.user = null;
      navigate('login');
    }
  } else {
    navigate('login');
  }
}

init();
