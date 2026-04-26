/**
 * Team & Profile Screen — redesigned with clean card UI.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

export default function TeamScreen() {
  const {
    user, team, members, expenses, budgets, isDarkMode, dispatch,
    categoryBreakdown, logout,
  } = useApp();
  const router = useRouter();
  const t = getTheme(isDarkMode);
  const fmt = (a: number) => `₹${a.toLocaleString('en-IN')}`;

  const getMemberSpend = (id: string) =>
    expenses
      .filter(e => {
        const d = new Date(e.dateTime);
        return e.memberId === id && d.getMonth() === new Date().getMonth();
      })
      .reduce((s, e) => s + e.amount, 0);

  const handleShare = async () => {
    if (team?.inviteCode) {
      await Share.share({
        message: `Join our team "${team.name}" on Budget Tracker!\nInvite code: ${team.inviteCode}`,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[Typography.headingLarge, { color: t.text }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: t.accentSoft }]}
          onPress={() => dispatch({ type: 'TOGGLE_THEME' })}
        >
          <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={18} color={t.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
          <View style={[styles.avatarLg, { backgroundColor: t.accentSoft }]}>
            <Text style={[styles.avatarLgTxt, { color: t.accent }]}>{user?.name?.[0] || '?'}</Text>
          </View>
          <Text style={[Typography.headingLarge, { color: t.text, marginTop: 12 }]}>{user?.name || 'User'}</Text>
          <Text style={[Typography.caption, { color: t.textSecondary, marginTop: 2 }]}>{user?.email || ''}</Text>
          <View style={[styles.roleBadge, { backgroundColor: t.accentSoft }]}>
            <Ionicons name={user?.role === 'admin' ? 'shield-checkmark' : 'person'} size={14} color={t.accent} />
            <Text style={[Typography.captionSmall, { color: t.accent, fontWeight: '700' }]}>
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </Text>
          </View>
        </View>

        {/* Team Info */}
        {team && (
          <View style={[styles.teamCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            <View style={styles.teamRow}>
              <View>
                <Text style={[Typography.headingMedium, { color: t.text }]}>{team.name}</Text>
                <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 2 }]}>
                  {members.length} members
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.codeBox, { backgroundColor: t.accentSoft }]}
                onPress={handleShare}
              >
                <Text style={[Typography.captionSmall, { color: t.accent }]}>Invite Code</Text>
                <Text style={[styles.codeVal, { color: t.accent }]}>{team.inviteCode}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Members */}
        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>Team Members</Text>
            <View style={[styles.listCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
              {members.map((m, i) => {
                const spend = getMemberSpend(m._id);
                return (
                  <View
                    key={m._id}
                    style={[
                      styles.memberRow,
                      i < members.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                    ]}
                  >
                    <View style={[styles.memAvatar, { backgroundColor: m.role === 'admin' ? t.accent : t.success }]}>
                      <Text style={styles.memAvatarTxt}>{m.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[Typography.bodySemibold, { color: t.text }]}>{m.name}</Text>
                        {m.role === 'admin' && (
                          <View style={[styles.adminTag, { backgroundColor: t.accentSoft }]}>
                            <Text style={[Typography.captionSmall, { color: t.accent, fontWeight: '700', fontSize: 9 }]}>
                              Admin
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[Typography.captionSmall, { color: t.textTertiary, marginTop: 2 }]}>{m.email}</Text>
                    </View>
                    <Text style={[Typography.bodySemibold, { color: t.text }]}>{fmt(spend)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Budget Limits */}
        <View style={styles.section}>
          <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>Budget Limits</Text>
          <View style={[styles.listCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            {CATEGORIES.map((cat, i) => {
              const used = categoryBreakdown.find(c => c.id === cat.id);
              const pct = used ? used.budgetUsed : 0;
              return (
                <View
                  key={cat.id}
                  style={[
                    styles.budgetRow,
                    i < CATEGORIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                  ]}
                >
                  <View style={[styles.budgetIcon, { backgroundColor: cat.color + '15' }]}>
                    <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[Typography.bodySemibold, { color: t.text }]}>{cat.name}</Text>
                      <Text style={[Typography.bodySemibold, { color: t.text }]}>{fmt(budgets[cat.name])}</Text>
                    </View>
                    <View style={[styles.budgetBar, { backgroundColor: t.divider, marginTop: 6 }]}>
                      <View style={[styles.budgetFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 80 ? t.danger : cat.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {[
            { icon: 'download-outline' as const, label: 'Export CSV', color: t.success, bg: t.successSoft },
            { icon: 'document-text-outline' as const, label: 'Export PDF', color: t.info, bg: t.infoSoft },
            { icon: 'share-outline' as const, label: 'Share Invite', color: t.accent, bg: t.accentSoft },
            { icon: 'log-out-outline' as const, label: 'Sign Out', color: t.danger, bg: t.dangerSoft },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionBtn, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}
              onPress={async () => {
                if (item.label === 'Sign Out') {
                  await logout();
                  router.replace('/login');
                } else if (item.label === 'Share Invite') {
                  handleShare();
                } else {
                  Alert.alert(item.label, 'Feature ready for production!');
                }
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[Typography.bodySemibold, { color: t.text, flex: 1 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatarLg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLgTxt: { fontSize: 28, fontWeight: '800' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginTop: 10,
    gap: 4,
  },
  teamCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  codeVal: { fontSize: 16, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  listCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  memAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memAvatarTxt: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  adminTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  budgetIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
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
});
