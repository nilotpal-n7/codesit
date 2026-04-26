/**
 * Dashboard / Home Screen.
 *
 * Displays:
 * - Gradient header with greeting, team name, dark mode toggle
 * - Budget card with progress bar
 * - Period filter tabs (daily/weekly/monthly/total)
 * - Smart insights cards
 * - Category breakdown grid
 * - Recent transactions list
 */
import { CATEGORIES } from "@/constants/categories";
import { useApp } from "@/context/app-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const {
    user,
    team,
    filteredExpenses,
    monthlySpend,
    totalBudget,
    budgetPercentage,
    categoryBreakdown,
    insights,
    filterPeriod,
    dispatch,
    isDarkMode,
  } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bg = isDarkMode ? "#0D1117" : "#F8F9FE";
  const card = isDarkMode ? "#161B22" : "#FFFFFF";
  const text = isDarkMode ? "#F0F6FC" : "#1A1A2E";
  const textSec = isDarkMode ? "#8B949E" : "#636E72";
  const border = isDarkMode ? "#21262D" : "#E8ECF4";

  const periods = ["daily", "weekly", "monthly", "total"] as const;

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString("en-IN")}`;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style="light" />

      {/* Gradient header */}
      <LinearGradient
        colors={["#6C5CE7", "#A29BFE"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user.name.split(" ")[0]} 👋
            </Text>
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => dispatch({ type: "TOGGLE_THEME" })}
            >
              <Ionicons
                name={isDarkMode ? "sunny" : "moon"}
                size={20}
                color="#FFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/(tabs)/team")}
            >
              <Ionicons name="people" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Monthly Spending</Text>
            <View
              style={[
                styles.badge,
                budgetPercentage > 80 ? styles.badgeDanger : styles.badgeSafe,
              ]}
            >
              <Text style={styles.badgeText}>
                {Math.round(budgetPercentage)}%
              </Text>
            </View>
          </View>
          <Text style={styles.budgetAmount}>
            {formatCurrency(monthlySpend)}
          </Text>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={
                budgetPercentage > 80
                  ? ["#FF6B6B", "#E17055"]
                  : ["#55EFC4", "#00B894"]
              }
              style={[
                styles.progressFill,
                { width: `${Math.min(budgetPercentage, 100)}%` },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.budgetSub}>
            of {formatCurrency(totalBudget)} budget
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Period Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodTabs}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodTab,
                  filterPeriod === p && styles.periodTabActive,
                ]}
                onPress={() =>
                  dispatch({ type: "SET_FILTER_PERIOD", payload: p })
                }
              >
                <Text
                  style={[
                    styles.periodTabText,
                    filterPeriod === p && styles.periodTabTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insights */}
          {insights.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>
                🧠 Smart Insights
              </Text>
              {insights.slice(0, 3).map((insight, i) => (
                <View
                  key={i}
                  style={[
                    styles.insightCard,
                    { backgroundColor: card, borderColor: border },
                  ]}
                >
                  <View
                    style={[
                      styles.insightIcon,
                      { backgroundColor: insight.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={insight.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={insight.color}
                    />
                  </View>
                  <Text
                    style={[styles.insightText, { color: text }]}
                    numberOfLines={2}
                  >
                    {insight.message}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Category Breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: text }]}>
                Category Breakdown
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/analytics")}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryGrid}>
              {categoryBreakdown
                .filter((c) => c.amount > 0)
                .slice(0, 6)
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: card, borderColor: border },
                    ]}
                    onPress={() =>
                      dispatch({
                        type: "SET_FILTER_CATEGORY",
                        payload: cat.name,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.catIcon,
                        { backgroundColor: cat.color + "15" },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={cat.color}
                      />
                    </View>
                    <Text style={[styles.catName, { color: text }]}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.catAmount, { color: text }]}>
                      {formatCurrency(cat.amount)}
                    </Text>
                    <View
                      style={[styles.catProgress, { backgroundColor: border }]}
                    >
                      <View
                        style={[
                          styles.catProgressFill,
                          {
                            width: `${Math.min(cat.budgetUsed, 100)}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: text }]}>
                Recent Transactions
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {filteredExpenses.slice(0, 8).map((expense) => {
              const cat =
                CATEGORIES.find((c) => c.name === expense.category) ||
                CATEGORIES[5];
              return (
                <TouchableOpacity
                  key={expense.id}
                  style={[
                    styles.txnCard,
                    { backgroundColor: card, borderColor: border },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.txnIcon,
                      { backgroundColor: cat.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={cat.color}
                    />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text
                      style={[styles.txnNote, { color: text }]}
                      numberOfLines={1}
                    >
                      {expense.note}
                    </Text>
                    <Text style={[styles.txnMeta, { color: textSec }]}>
                      {expense.memberName} ·{" "}
                      {new Date(expense.dateTime).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.txnAmount, { color: "#E17055" }]}>
                    -{formatCurrency(expense.amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  teamName: { fontSize: 20, fontWeight: "700", color: "#FFF", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  budgetCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeSafe: { backgroundColor: "rgba(85, 239, 196, 0.3)" },
  badgeDanger: { backgroundColor: "rgba(255, 107, 107, 0.3)" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#FFF" },
  budgetAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 4,
    letterSpacing: -1,
  },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  budgetSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },
  body: { flex: 1 },
  periodTabs: { marginTop: 16, marginBottom: 8 },
  periodTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  periodTabActive: { backgroundColor: "#6C5CE7" },
  periodTabText: { fontSize: 13, fontWeight: "600", color: "#636E72" },
  periodTabTextActive: { color: "#FFF" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600", color: "#6C5CE7" },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 18 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: {
    width: (width - 50) / 2,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  catName: { fontSize: 12, fontWeight: "500", marginBottom: 2 },
  catAmount: { fontSize: 16, fontWeight: "700" },
  catProgress: {
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  catProgressFill: { height: "100%", borderRadius: 2 },
  txnCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  txnIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txnInfo: { flex: 1 },
  txnNote: { fontSize: 14, fontWeight: "600" },
  txnMeta: { fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: "700" },
});
