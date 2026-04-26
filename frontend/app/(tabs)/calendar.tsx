/**
 * Calendar Screen — redesigned heatmap calendar with clean card UI.
 */
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

export default function CalendarScreen() {
  const { expenses, isDarkMode } = useApp();
  const t = getTheme(isDarkMode);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const now = new Date();
  const [year, month] = [now.getFullYear(), now.getMonth()];
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Compute daily spending
  const dailySpend = useMemo(() => {
    const map: Record<number, number> = {};
    expenses.forEach(e => {
      const d = new Date(e.dateTime);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        map[day] = (map[day] || 0) + e.amount;
      }
    });
    return map;
  }, [expenses, month, year]);

  const maxDaily = Math.max(...Object.values(dailySpend), 1);
  const totalThisMonth = Object.values(dailySpend).reduce((s, v) => s + v, 0);
  const activeDays = Object.keys(dailySpend).length;

  // Get heatmap color
  const getHeatColor = (amount: number) => {
    if (amount === 0) return 'transparent';
    const intensity = amount / maxDaily;
    if (isDarkMode) {
      if (intensity > 0.7) return '#7C6EF7';
      if (intensity > 0.4) return '#5B50C9';
      return '#3A3470';
    } else {
      if (intensity > 0.7) return '#6C5CE7';
      if (intensity > 0.4) return '#A29BFE';
      return '#EDE9FF';
    }
  };

  // Build calendar grid
  const calendarCells: { day: number | null; amount: number }[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push({ day: null, amount: 0 });
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push({ day: d, amount: dailySpend[d] || 0 });
  // Pad remaining
  while (calendarCells.length % 7 !== 0) calendarCells.push({ day: null, amount: 0 });

  // Today's expenses
  const todayExpenses = expenses.filter(e => new Date(e.dateTime).toDateString() === now.toDateString());

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[Typography.headingLarge, { color: t.text }]}>Calendar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Month Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
            <Ionicons name="calendar" size={20} color={t.accent} />
            <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 4 }]}>Month</Text>
            <Text style={[Typography.headingSmall, { color: t.text }]}>{fmt(totalThisMonth)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
            <Ionicons name="flash" size={20} color={t.warning} />
            <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 4 }]}>Active Days</Text>
            <Text style={[Typography.headingSmall, { color: t.text }]}>{activeDays}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
            <Ionicons name="stats-chart" size={20} color={t.success} />
            <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 4 }]}>Daily Avg</Text>
            <Text style={[Typography.headingSmall, { color: t.text }]}>
              {fmt(activeDays > 0 ? Math.round(totalThisMonth / activeDays) : 0)}
            </Text>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={[styles.calCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
          <Text style={[Typography.headingMedium, { color: t.text, textAlign: 'center', marginBottom: 16 }]}>
            {monthName}
          </Text>
          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {weekdays.map(w => (
              <View key={w} style={styles.weekCell}>
                <Text style={[Typography.captionSmall, { color: t.textTertiary }]}>{w}</Text>
              </View>
            ))}
          </View>
          {/* Date grid */}
          <View style={styles.calGrid}>
            {calendarCells.map((cell, i) => {
              const isToday = cell.day === now.getDate();
              return (
                <View key={i} style={styles.dayCell}>
                  {cell.day ? (
                    <View style={[
                      styles.dayInner,
                      cell.amount > 0 && { backgroundColor: getHeatColor(cell.amount) },
                      isToday && { borderWidth: 2, borderColor: t.accent },
                    ]}>
                      <Text style={[
                        Typography.captionSmall,
                        {
                          color: cell.amount > 0 && !isDarkMode
                            ? (cell.amount / maxDaily > 0.4 ? '#FFF' : t.text)
                            : cell.amount > 0 && isDarkMode
                            ? '#FFF'
                            : t.text,
                          fontWeight: isToday ? '800' : '500',
                        },
                      ]}>
                        {cell.day}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={[Typography.captionSmall, { color: t.textTertiary }]}>Less</Text>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: getHeatColor(maxDaily * v) }]} />
            ))}
            <Text style={[Typography.captionSmall, { color: t.textTertiary }]}>More</Text>
          </View>
        </View>

        {/* Today's Expenses */}
        <View style={styles.section}>
          <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>
            Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
          </Text>
          <View style={[styles.listCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            {todayExpenses.length > 0 ? todayExpenses.map((exp, i) => {
              const cat = CATEGORIES.find(c => c.name === exp.category) || CATEGORIES[5];
              return (
                <View
                  key={exp._id}
                  style={[
                    styles.txnRow,
                    i < todayExpenses.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                  ]}
                >
                  <View style={[styles.txnIcon, { backgroundColor: cat.color + '12' }]}>
                    <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodySemibold, { color: t.text }]}>{exp.note}</Text>
                    <Text style={[Typography.captionSmall, { color: t.textTertiary, marginTop: 2 }]}>{exp.memberName}</Text>
                  </View>
                  <Text style={[Typography.bodySemibold, { color: t.danger }]}>-{fmt(exp.amount)}</Text>
                </View>
              );
            }) : (
              <View style={styles.empty}>
                <Ionicons name="sunny-outline" size={32} color={t.textTertiary} />
                <Text style={[Typography.body, { color: t.textTertiary, marginTop: 8 }]}>No expenses today</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  calCard: {
    margin: 20,
    padding: 20,
    borderRadius: Radius.xxl,
    borderWidth: 1,
  },
  weekRow: { flexDirection: 'row' },
  weekCell: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 3 },
  dayInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0001',
  },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  section: { paddingHorizontal: 20, marginTop: 4 },
  listCard: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  txnRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  txnIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { padding: 40, alignItems: 'center' },
});
