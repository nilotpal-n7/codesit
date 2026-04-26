/**
 * Dashboard / Home Screen.
 *
 * Redesigned to match the Expense Tracker UI Kit:
 * - Clean white/dark card-based layout
 * - Large balance display with gradient accent bar
 * - Quick stat pills (income/expense/budget)
 * - Clean transaction list with category icons
 * - Period filter tabs
 * - Smart insights section
 */
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const {
    user, team, filteredExpenses, monthlySpend, totalBudget,
    budgetPercentage, categoryBreakdown, insights, filterPeriod, dispatch, isDarkMode,
  } = useApp();

  const t = getTheme(isDarkMode);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periods = ['daily', 'weekly', 'monthly', 'total'] as const;
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const remaining = Math.max(totalBudget - monthlySpend, 0);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <View>
          <Text style={[Typography.caption, { color: t.textSecondary }]}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
          </Text>
          <Text style={[Typography.headingLarge, { color: t.text, marginTop: 2 }]}>
            {user?.name?.split(' ')[0] || 'there'} 👋
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: t.accentSoft }]}
            onPress={() => dispatch({ type: 'TOGGLE_THEME' })}
          >
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={18} color={t.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: t.accentSoft }]}
            onPress={() => router.push('/(tabs)/team')}
          >
            <Ionicons name="people" size={18} color={t.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Balance Card ── */}
          <View style={styles.balanceSection}>
            <LinearGradient
              colors={isDarkMode ? ['#2A1F5E', '#1A1D30'] : ['#6C5CE7', '#A29BFE']}
              style={[styles.balanceCard, Shadows.cardStrong(isDarkMode)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>
                Monthly Spending
              </Text>
              <Text style={[Typography.displayLarge, { color: '#FFF', marginTop: 4 }]}>
                {fmt(monthlySpend)}
              </Text>
              <View style={styles.balanceMeta}>
                <Text style={[Typography.captionSmall, { color: 'rgba(255,255,255,0.6)' }]}>
                  {team?.name || 'Solo Mode'}
                </Text>
                <View style={[
                  styles.badge,
                  { backgroundColor: budgetPercentage > 80 ? 'rgba(255,107,107,0.3)' : 'rgba(85,239,196,0.3)' },
                ]}>
                  <Text style={[Typography.captionSmall, { color: '#FFF', fontWeight: '700' }]}>
                    {Math.round(budgetPercentage)}% used
                  </Text>
                </View>
              </View>
              {/* Progress */}
              <View style={styles.progressBg}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor: budgetPercentage > 80 ? '#FF7675' : '#55EFC4',
                  },
                ]} />
              </View>
            </LinearGradient>
          </View>

          {/* ── Quick Stats ── */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
              <View style={[styles.statIcon, { backgroundColor: t.dangerSoft }]}>
                <Ionicons name="arrow-up" size={16} color={t.danger} />
              </View>
              <Text style={[Typography.captionSmall, { color: t.textSecondary }]}>Spent</Text>
              <Text style={[Typography.headingSmall, { color: t.text }]}>{fmt(monthlySpend)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
              <View style={[styles.statIcon, { backgroundColor: t.successSoft }]}>
                <Ionicons name="wallet" size={16} color={t.success} />
              </View>
              <Text style={[Typography.captionSmall, { color: t.textSecondary }]}>Remaining</Text>
              <Text style={[Typography.headingSmall, { color: t.text }]}>{fmt(remaining)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
              <View style={[styles.statIcon, { backgroundColor: t.infoSoft }]}>
                <Ionicons name="receipt" size={16} color={t.info} />
              </View>
              <Text style={[Typography.captionSmall, { color: t.textSecondary }]}>Txns</Text>
              <Text style={[Typography.headingSmall, { color: t.text }]}>{filteredExpenses.length}</Text>
            </View>
          </View>

          {/* ── Period Filter ── */}
          <View style={[styles.filterRow, { backgroundColor: t.card, borderColor: t.border }]}>
            {periods.map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.filterTab,
                  filterPeriod === p && { backgroundColor: t.accent },
                ]}
                onPress={() => dispatch({ type: 'SET_FILTER_PERIOD', payload: p })}
              >
                <Text style={[
                  Typography.caption,
                  { color: filterPeriod === p ? '#FFF' : t.textSecondary },
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Insights ── */}
          {insights.length > 0 && (
            <View style={styles.section}>
              <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>
                🧠 Smart Insights
              </Text>
              {insights.slice(0, 3).map((ins, i) => (
                <View key={i} style={[styles.insightCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
                  <View style={[styles.insightDot, { backgroundColor: ins.color + '20' }]}>
                    <Ionicons name={ins.icon as keyof typeof Ionicons.glyphMap} size={16} color={ins.color} />
                  </View>
                  <Text style={[Typography.bodyMedium, { color: t.text, flex: 1 }]} numberOfLines={2}>
                    {ins.message}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Category Breakdown ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingMedium, { color: t.text }]}>Categories</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
                <Text style={[Typography.bodySemibold, { color: t.accent }]}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryGrid}>
              {categoryBreakdown
                .filter(c => c.amount > 0)
                .slice(0, 6)
                .map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}
                    onPress={() => dispatch({ type: 'SET_FILTER_CATEGORY', payload: cat.name })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconBg, { backgroundColor: cat.color + '15' }]}>
                      <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.color} />
                    </View>
                    <Text style={[Typography.caption, { color: t.textSecondary, marginTop: 8 }]}>{cat.name}</Text>
                    <Text style={[Typography.headingSmall, { color: t.text, marginTop: 2 }]}>{fmt(cat.amount)}</Text>
                    <View style={[styles.catBar, { backgroundColor: t.divider, marginTop: 8 }]}>
                      <View style={[styles.catBarFill, { width: `${Math.min(cat.budgetUsed, 100)}%`, backgroundColor: cat.color }]} />
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* ── Recent Transactions ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingMedium, { color: t.text }]}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={[Typography.bodySemibold, { color: t.accent }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.txnList, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
              {filteredExpenses.slice(0, 8).map((exp, i) => {
                const cat = CATEGORIES.find(c => c.name === exp.category) || CATEGORIES[5];
                return (
                  <View
                    key={exp._id}
                    style={[
                      styles.txnRow,
                      i < Math.min(filteredExpenses.length, 8) - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                    ]}
                  >
                    <View style={[styles.txnIcon, { backgroundColor: cat.color + '12' }]}>
                      <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.bodySemibold, { color: t.text }]} numberOfLines={1}>
                        {exp.note}
                      </Text>
                      <Text style={[Typography.captionSmall, { color: t.textTertiary, marginTop: 2 }]}>
                        {exp.memberName} · {new Date(exp.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={[Typography.bodySemibold, { color: t.danger }]}>
                      -{fmt(exp.amount)}
                    </Text>
                  </View>
                );
              })}
              {filteredExpenses.length === 0 && (
                <View style={styles.empty}>
                  <Ionicons name="receipt-outline" size={40} color={t.textTertiary} />
                  <Text style={[Typography.body, { color: t.textTertiary, marginTop: 8 }]}>No transactions yet</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Balance
  balanceSection: { paddingHorizontal: 20, marginTop: 16 },
  balanceCard: {
    borderRadius: Radius.xxl,
    padding: 24,
  },
  balanceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  progressBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  // Filter
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  // Sections
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Insights
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  insightDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  catIconBg: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  // Transactions
  txnList: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  txnIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});
