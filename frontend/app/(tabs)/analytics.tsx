/**
 * Analytics Screen.
 *
 * Shows:
 * - Summary header (total spent, transactions, categories)
 * - Chart type tabs (pie / bar / line)
 * - Category details table
 * - Spending leaderboard
 *
 * Uses react-native-chart-kit for pie, bar, and line charts.
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

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

export default function AnalyticsScreen() {
  const {
    categoryBreakdown, memberBreakdown, monthlyTrend,
    totalSpend, filteredExpenses, isDarkMode,
  } = useApp();
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');

  const bg = isDarkMode ? '#0D1117' : '#F8F9FE';
  const card = isDarkMode ? '#161B22' : '#FFFFFF';
  const text = isDarkMode ? '#F0F6FC' : '#1A1A2E';
  const textSec = isDarkMode ? '#8B949E' : '#636E72';
  const border = isDarkMode ? '#21262D' : '#E8ECF4';

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#161B22' : '#FFFFFF',
    backgroundGradientTo: isDarkMode ? '#161B22' : '#FFFFFF',
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(162, 155, 254, ${opacity})`
        : `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDarkMode
        ? `rgba(240, 246, 252, ${opacity})`
        : `rgba(26, 26, 46, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalCount: 0,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: isDarkMode ? '#21262D' : '#F1F3F8',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
  };

  const pieData = categoryBreakdown
    .filter(c => c.amount > 0)
    .map(c => ({
      name: c.name,
      amount: c.amount,
      color: c.color,
      legendFontColor: textSec,
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
        <Text style={[styles.noData, { color: textSec }]}>
          Chart library not installed. Run: npm install react-native-chart-kit
        </Text>
      );
    }

    if (activeChart === 'pie') {
      return pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={chartWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend
        />
      ) : (
        <Text style={[styles.noData, { color: textSec }]}>
          No data for this period
        </Text>
      );
    }

    if (activeChart === 'bar') {
      return memberBreakdown.length > 0 ? (
        <BarChart
          data={barData}
          width={chartWidth - 32}
          height={260}
          chartConfig={{ ...chartConfig, barPercentage: 0.7 }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
          withInnerLines
          yAxisLabel="₹"
          yAxisSuffix=""
        />
      ) : (
        <Text style={[styles.noData, { color: textSec }]}>
          No data for this period
        </Text>
      );
    }

    // line chart
    return (
      <LineChart
        data={lineData}
        width={chartWidth - 32}
        height={260}
        chartConfig={{
          ...chartConfig,
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#6C5CE7',
            fill: '#A29BFE',
          },
        }}
        style={styles.chart}
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
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSpend)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>{filteredExpenses.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Categories</Text>
            <Text style={styles.summaryValue}>
              {categoryBreakdown.filter(c => c.amount > 0).length}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Chart Type Tabs */}
        <View style={styles.chartTabs}>
          {chartTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.chartTab,
                activeChart === tab.key && styles.chartTabActive,
              ]}
              onPress={() => setActiveChart(tab.key)}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={activeChart === tab.key ? '#FFF' : '#6C5CE7'}
              />
              <Text
                style={[
                  styles.chartTabText,
                  activeChart === tab.key && styles.chartTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts */}
        <View
          style={[styles.chartCard, { backgroundColor: card, borderColor: border }]}
        >
          <Text style={[styles.chartTitle, { color: text }]}>
            {activeChart === 'pie'
              ? 'Category Breakdown'
              : activeChart === 'bar'
              ? 'Member-wise Spending'
              : 'Monthly Spending Trend'}
          </Text>
          {renderChart()}
        </View>

        {/* Category Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            Category Details
          </Text>
          {categoryBreakdown.map(cat => (
            <View
              key={cat.id}
              style={[
                styles.detailRow,
                { backgroundColor: card, borderColor: border },
              ]}
            >
              <View style={styles.detailLeft}>
                <View
                  style={[styles.detailDot, { backgroundColor: cat.color }]}
                />
                <View>
                  <Text style={[styles.detailName, { color: text }]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.detailCount, { color: textSec }]}>
                    {filteredExpenses.filter(e => e.category === cat.name).length}{' '}
                    transactions
                  </Text>
                </View>
              </View>
              <View style={styles.detailRight}>
                <Text style={[styles.detailAmount, { color: text }]}>
                  {formatCurrency(cat.amount)}
                </Text>
                <Text
                  style={[
                    styles.detailPct,
                    { color: cat.budgetUsed > 80 ? '#FF6B6B' : '#00B894' },
                  ]}
                >
                  {Math.round(cat.budgetUsed)}% of budget
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            Spending Leaderboard
          </Text>
          {memberBreakdown.map((member, i) => (
            <View
              key={member.memberId}
              style={[
                styles.leaderRow,
                { backgroundColor: card, borderColor: border },
              ]}
            >
              <View
                style={[
                  styles.rank,
                  {
                    backgroundColor:
                      i === 0
                        ? '#FDCB6E'
                        : i === 1
                        ? '#B2BEC3'
                        : i === 2
                        ? '#E17055'
                        : '#F1F3F8',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    { color: i < 3 ? '#FFF' : textSec },
                  ]}
                >
                  #{i + 1}
                </Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={[styles.leaderName, { color: text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.leaderCount, { color: textSec }]}>
                  {member.count} expenses
                </Text>
              </View>
              <Text style={[styles.leaderAmount, { color: text }]}>
                {formatCurrency(member.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  chartTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  chartTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#6C5CE715',
    gap: 6,
  },
  chartTabActive: { backgroundColor: '#6C5CE7' },
  chartTabText: { fontSize: 12, fontWeight: '600', color: '#6C5CE7' },
  chartTabTextActive: { color: '#FFF' },
  chartCard: {
    margin: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chart: { borderRadius: 16, marginLeft: -8 },
  noData: { textAlign: 'center', padding: 40 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailDot: { width: 10, height: 10, borderRadius: 5 },
  detailName: { fontSize: 14, fontWeight: '600' },
  detailCount: { fontSize: 11, marginTop: 2 },
  detailRight: { alignItems: 'flex-end' },
  detailAmount: { fontSize: 15, fontWeight: '700' },
  detailPct: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 12, fontWeight: '800' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 14, fontWeight: '600' },
  leaderCount: { fontSize: 11, marginTop: 2 },
  leaderAmount: { fontSize: 15, fontWeight: '700' },
});
