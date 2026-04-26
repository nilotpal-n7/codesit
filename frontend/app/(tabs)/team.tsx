/**
 * Team & Profile Screen.
 *
 * Displays:
 * - User profile header (avatar, name, email, role badge)
 * - Team info card with invite code
 * - Team member list with monthly spending
 * - Budget limits per category with progress bars
 * - Action buttons (export, share, sign out)
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';

export default function TeamScreen() {
  const {
    user, team, members, expenses, budgets, isDarkMode, dispatch, categoryBreakdown,
    logout,
  } = useApp();
  const router = useRouter();

  const bg = isDarkMode ? '#0D1117' : '#F8F9FE';
  const card = isDarkMode ? '#161B22' : '#FFFFFF';
  const text = isDarkMode ? '#F0F6FC' : '#1A1A2E';
  const textSec = isDarkMode ? '#8B949E' : '#636E72';
  const border = isDarkMode ? '#21262D' : '#E8ECF4';
  const fmt = (a: number) => `₹${a.toLocaleString('en-IN')}`;

  const getMemberSpend = (id: string) =>
    expenses
      .filter(e => {
        const d = new Date(e.dateTime);
        return e.memberId === id && d.getMonth() === new Date().getMonth();
      })
      .reduce((s, e) => s + e.amount, 0);

  return (
    <View style={[styles.ctr, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        style={styles.hdr}
      >
        <View style={styles.hdrRow}>
          <Text style={styles.hdrTxt}>Team & Profile</Text>
          <TouchableOpacity
            onPress={() => dispatch({ type: 'TOGGLE_THEME' })}
            style={styles.themeBtn}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgTxt}>{user?.name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
              size={14}
              color="#FFF"
            />
            <Text style={styles.roleText}>
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Team Info */}
        {team && (
          <View
            style={[styles.teamCard, { backgroundColor: card, borderColor: border }]}
          >
            <View style={styles.teamRow}>
              <View>
                <Text style={[styles.teamName, { color: text }]}>{team.name}</Text>
                <Text style={[styles.teamSub, { color: textSec }]}>
                  {members.length} members
                </Text>
              </View>
              <View style={[styles.codeBox, { backgroundColor: '#6C5CE715' }]}>
                <Text style={styles.codeLabel}>Invite Code</Text>
                <Text style={styles.codeVal}>{team.inviteCode}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Members */}
        <View style={styles.sec}>
          <Text style={[styles.secTitle, { color: text }]}>Team Members</Text>
          {members.map(m => {
            const spend = getMemberSpend(m._id);
            return (
              <View
                key={m._id}
                style={[
                  styles.memberCard,
                  { backgroundColor: card, borderColor: border },
                ]}
              >
                <View
                  style={[
                    styles.memAvatar,
                    {
                      backgroundColor:
                        m.role === 'admin' ? '#6C5CE7' : '#00B894',
                    },
                  ]}
                >
                  <Text style={styles.memAvatarTxt}>{m.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.memRow}>
                    <Text style={[styles.memName, { color: text }]}>
                      {m.name}
                    </Text>
                    {m.role === 'admin' && (
                      <View style={styles.adminTag}>
                        <Text style={styles.adminTagTxt}>Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.memEmail, { color: textSec }]}>
                    {m.email}
                  </Text>
                </View>
                <Text style={[styles.memSpend, { color: text }]}>
                  {fmt(spend)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Budget Settings */}
        <View style={styles.sec}>
          <Text style={[styles.secTitle, { color: text }]}>Budget Limits</Text>
          {CATEGORIES.map(cat => {
            const used = categoryBreakdown.find(c => c.id === cat.id);
            const pct = used ? used.budgetUsed : 0;
            return (
              <View
                key={cat.id}
                style={[
                  styles.budgetRow,
                  { backgroundColor: card, borderColor: border },
                ]}
              >
                <View
                  style={[
                    styles.budgetIcon,
                    { backgroundColor: cat.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={cat.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.budgetInfo}>
                    <Text style={[styles.budgetName, { color: text }]}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.budgetAmt, { color: text }]}>
                      {fmt(budgets[cat.name])}
                    </Text>
                  </View>
                  <View
                    style={[styles.budgetBar, { backgroundColor: border }]}
                  >
                    <View
                      style={[
                        styles.budgetFill,
                        {
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor:
                            pct > 80 ? '#FF6B6B' : cat.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.sec}>
          {[
            {
              icon: 'download-outline' as const,
              label: 'Export Report (CSV)',
              color: '#00B894',
            },
            {
              icon: 'document-text-outline' as const,
              label: 'Export PDF Report',
              color: '#0984E3',
            },
            {
              icon: 'share-outline' as const,
              label: 'Share Team Invite',
              color: '#6C5CE7',
            },
            {
              icon: 'log-out-outline' as const,
              label: 'Sign Out',
              color: '#E17055',
            },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.actionBtn,
                { backgroundColor: card, borderColor: border },
              ]}
              onPress={async () => {
                if (item.label === 'Sign Out') {
                  await logout();
                  router.replace('/login');
                } else {
                  Alert.alert(item.label, 'Feature ready for production!');
                }
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: item.color + '15' },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.actionLabel, { color: text }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={textSec} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ctr: { flex: 1 },
  hdr: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  hdrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hdrTxt: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: { alignItems: 'center', marginTop: 20 },
  avatarLg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLgTxt: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 4,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  teamCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: { fontSize: 18, fontWeight: '700' },
  teamSub: { fontSize: 12, marginTop: 2 },
  codeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 10, color: '#6C5CE7', fontWeight: '500' },
  codeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6C5CE7',
    letterSpacing: 2,
  },
  sec: { paddingHorizontal: 20, marginTop: 20 },
  secTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  memAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memAvatarTxt: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  memRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memName: { fontSize: 14, fontWeight: '600' },
  memEmail: { fontSize: 11, marginTop: 2 },
  adminTag: {
    backgroundColor: '#6C5CE715',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminTagTxt: { fontSize: 10, fontWeight: '700', color: '#6C5CE7' },
  memSpend: { fontSize: 14, fontWeight: '700' },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  budgetIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetName: { fontSize: 14, fontWeight: '600' },
  budgetAmt: { fontSize: 14, fontWeight: '700' },
  budgetBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  budgetFill: { height: '100%', borderRadius: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});
