/**
 * Analytics Screen — redesigned.
 *
 * Clean card layout with:
 * - Summary header (total, txns, categories)
 * - Chart type toggle
 * - Charts (pie, bar, line)
 * - Category details
 * - Spending leaderboard
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

const { width } = Dimensions.get('window');
const chartW = width - 72;

export default function AnalyticsScreen() {
  const {
    categoryBreakdown, memberBreakdown, monthlyTrend,
    totalSpend, filteredExpenses, isDarkMode,
  } = useApp();
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');

  const t = getTheme(isDarkMode);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const chartConfig = {
    backgroundGradientFrom: t.card,
    backgroundGradientTo: t.card,
    color: (opacity = 1) => isDarkMode
      ? `rgba(124, 110, 247, ${opacity})`
      : `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode
      ? `rgba(232, 233, 240, ${opacity})`
      : `rgba(26, 27, 46, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalCount: 0,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: t.divider,
      strokeWidth: 1,
    },
    propsForLabels: { fontSize: 11, fontWeight: '600' },
  };

  const pieData = categoryBreakdown
    .filter(c => c.amount > 0)
    .map(c => ({
      name: c.name,
      amount: c.amount,
      color: c.color,
      legendFontColor: t.textSecondary,
      legendFontSize: 12,
    }));

  const barData = {
    labels: memberBreakdown.slice(0, 5).map(m => m.name.split(' ')[0]),
    datasets: [{ data: memberBreakdown.slice(0, 5).map(m => m.amount) }],
  };

  const lineData = {
    labels: monthlyTrend.map(m => m.month),
    datasets: [{ data: monthlyTrend.map(m => m.amount || 0), strokeWidth: 3 }],
  };

  const chartTabs = [
    { key: 'pie' as const, icon: 'pie-chart', label: 'Categories' },
    { key: 'bar' as const, icon: 'bar-chart', label: 'Members' },
    { key: 'line' as const, icon: 'trending-up', label: 'Trends' },
  ];

  const renderChart = () => {
    if (!PieChart || !BarChart || !LineChart) {
      return (
        <View style={styles.empty}>
          <Ionicons name="analytics-outline" size={40} color={t.textTertiary} />
          <Text style={[Typography.body, { color: t.textTertiary, marginTop: 8 }]}>
            Install react-native-chart-kit
          </Text>
        </View>
      );
    }

    if (activeChart === 'pie') {
      return pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={chartW}
          height={200}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
          hasLegend
        />
      ) : <EmptyChart theme={t} />;
    }

    if (activeChart === 'bar') {
      return memberBreakdown.length > 0 ? (
        <BarChart
          data={barData}
          width={chartW}
          height={240}
          chartConfig={{ ...chartConfig, barPercentage: 0.7 }}
          style={{ borderRadius: Radius.lg, marginLeft: -8 }}
          showValuesOnTopOfBars
          fromZero
          withInnerLines
          yAxisLabel="₹"
          yAxisSuffix=""
        />
      ) : <EmptyChart theme={t} />;
    }

    return (
      <LineChart
        data={lineData}
        width={chartW}
        height={240}
        chartConfig={{
          ...chartConfig,
          propsForDots: { r: '5', strokeWidth: '2', stroke: t.accent, fill: t.accentLight },
        }}
        style={{ borderRadius: Radius.lg, marginLeft: -8 }}
        bezier
        withDots
        withShadow
        withInnerLines
        fromZero
        yAxisLabel="₹"
        yAxisSuffix=""
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[Typography.headingLarge, { color: t.text }]}>Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Total Spent', value: fmt(totalSpend), icon: 'trending-up' as const, color: t.danger, bg: t.dangerSoft },
            { label: 'Transactions', value: String(filteredExpenses.length), icon: 'receipt' as const, color: t.info, bg: t.infoSoft },
            { label: 'Categories', value: String(categoryBreakdown.filter(c => c.amount > 0).length), icon: 'grid' as const, color: t.accent, bg: t.accentSoft },
          ].map((item, i) => (
            <View key={i} style={[styles.summaryCard, { backgroundColor: t.card }, Shadows.card(isDarkMode)]}>
              <View style={[styles.summaryIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 6 }]}>{item.label}</Text>
              <Text style={[Typography.headingSmall, { color: t.text, marginTop: 2 }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Chart Type Tabs */}
        <View style={[styles.chartTabs, { backgroundColor: t.card, borderColor: t.border }]}>
          {chartTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.chartTab,
                activeChart === tab.key && { backgroundColor: t.accent },
              ]}
              onPress={() => setActiveChart(tab.key)}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={activeChart === tab.key ? '#FFF' : t.accent}
              />
              <Text style={[
                Typography.captionSmall,
                { color: activeChart === tab.key ? '#FFF' : t.accent },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
          <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>
            {activeChart === 'pie' ? 'Category Breakdown'
              : activeChart === 'bar' ? 'Member Spending'
              : 'Monthly Trend'}
          </Text>
          {renderChart()}
        </View>

        {/* Category Details */}
        <View style={styles.section}>
          <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>
            Category Details
          </Text>
          <View style={[styles.detailList, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            {categoryBreakdown.map((cat, i) => (
              <View
                key={cat.id}
                style={[
                  styles.detailRow,
                  i < categoryBreakdown.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                ]}
              >
                <View style={[styles.detailDot, { backgroundColor: cat.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodySemibold, { color: t.text }]}>{cat.name}</Text>
                  <Text style={[Typography.captionSmall, { color: t.textTertiary, marginTop: 2 }]}>
                    {filteredExpenses.filter(e => e.category === cat.name).length} transactions
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[Typography.bodySemibold, { color: t.text }]}>{fmt(cat.amount)}</Text>
                  <Text style={[
                    Typography.captionSmall,
                    { color: cat.budgetUsed > 80 ? t.danger : t.success, marginTop: 2 },
                  ]}>
                    {Math.round(cat.budgetUsed)}% of budget
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={[Typography.headingMedium, { color: t.text, marginBottom: 12 }]}>
            Spending Leaderboard
          </Text>
          <View style={[styles.detailList, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            {memberBreakdown.map((member, i) => (
              <View
                key={member.memberId}
                style={[
                  styles.leaderRow,
                  i < memberBreakdown.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                ]}
              >
                <View style={[
                  styles.rank,
                  { backgroundColor: i === 0 ? '#FDCB6E' : i === 1 ? '#B2BEC3' : i === 2 ? '#E17055' : t.divider },
                ]}>
                  <Text style={[Typography.captionSmall, { color: i < 3 ? '#FFF' : t.textSecondary, fontWeight: '800' }]}>
                    #{i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodySemibold, { color: t.text }]}>{member.name}</Text>
                  <Text style={[Typography.captionSmall, { color: t.textTertiary, marginTop: 2 }]}>
                    {member.count} expenses
                  </Text>
                </View>
                <Text style={[Typography.bodySemibold, { color: t.text }]}>{fmt(member.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EmptyChart({ theme }: { theme: any }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="analytics-outline" size={40} color={theme.textTertiary} />
      <Text style={[Typography.body, { color: theme.textTertiary, marginTop: 8 }]}>No data for this period</Text>
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
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  chartTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 4,
  },
  chartCard: {
    margin: 20,
    padding: 20,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  detailList: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  detailDot: { width: 10, height: 10, borderRadius: 5 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { padding: 40, alignItems: 'center' },
});
