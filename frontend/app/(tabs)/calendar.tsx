/**
 * Calendar Screen — heatmap view of daily spending.
 *
 * Features:
 * - Month navigation (prev/next)
 * - Grid of days with color-coded spend indicators
 * - Drill-down: tap a day to see that day's expenses
 * - Heat legend (Low / Med / High)
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const cellSize = (width - 72) / 7;

export default function CalendarScreen() {
  const { expenses, isDarkMode } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const bg = isDarkMode ? '#0D1117' : '#F8F9FE';
  const card = isDarkMode ? '#161B22' : '#FFFFFF';
  const text = isDarkMode ? '#F0F6FC' : '#1A1A2E';
  const textSec = isDarkMode ? '#8B949E' : '#636E72';
  const border = isDarkMode ? '#21262D' : '#E8ECF4';
  const fmt = (a: number) => `₹${a.toLocaleString('en-IN')}`;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Daily spend totals
  const daily = useMemo(() => {
    const m: Record<number, number> = {};
    expenses.forEach(e => {
      const d = new Date(e.dateTime);
      if (d.getMonth() === month && d.getFullYear() === year) {
        m[d.getDate()] = (m[d.getDate()] || 0) + e.amount;
      }
    });
    return m;
  }, [expenses, month, year]);

  const maxSpend = useMemo(
    () => Math.max(...Object.values(daily), 1),
    [daily],
  );

  // Expenses for the selected date
  const selExp = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter(e => {
      const d = new Date(e.dateTime);
      return (
        d.getDate() === selectedDate &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  }, [selectedDate, expenses, month, year]);

  const heatColor = (a: number | undefined) => {
    if (!a) return 'transparent';
    const intensity = a / maxSpend;
    return intensity > 0.7 ? '#E17055' : intensity > 0.4 ? '#FDAA5E' : '#55EFC4';
  };

  // Build calendar cells
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<View key={`e${i}`} style={styles.cell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const s = daily[d];
    const sel = selectedDate === d;
    const today =
      d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    cells.push(
      <TouchableOpacity
        key={d}
        style={[
          styles.cell,
          sel && styles.cellSel,
          today && !sel && styles.cellToday,
        ]}
        onPress={() => setSelectedDate(d)}
      >
        <Text
          style={[
            styles.dayTxt,
            { color: sel ? '#FFF' : text },
            today && !sel && { color: '#6C5CE7', fontWeight: '800' },
          ]}
        >
          {d}
        </Text>
        {s > 0 && (
          <View
            style={[
              styles.dot,
              { backgroundColor: sel ? '#FFF' : heatColor(s) },
            ]}
          />
        )}
      </TouchableOpacity>,
    );
  }

  return (
    <View style={[styles.ctr, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        style={styles.hdr}
      >
        <Text style={styles.hdrTxt}>Calendar</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Month navigation */}
        <View
          style={[styles.mnav, { backgroundColor: card, borderColor: border }]}
        >
          <TouchableOpacity
            onPress={() => {
              setCurrentDate(new Date(year, month - 1, 1));
              setSelectedDate(null);
            }}
            style={styles.nbtn}
          >
            <Ionicons name="chevron-back" size={22} color="#6C5CE7" />
          </TouchableOpacity>
          <Text style={[styles.mTxt, { color: text }]}>
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setCurrentDate(new Date(year, month + 1, 1));
              setSelectedDate(null);
            }}
            style={styles.nbtn}
          >
            <Ionicons name="chevron-forward" size={22} color="#6C5CE7" />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View
          style={[
            styles.calCard,
            { backgroundColor: card, borderColor: border },
          ]}
        >
          <View style={styles.wkHdr}>
            {DAYS.map(d => (
              <View key={d} style={styles.wkDay}>
                <Text style={[styles.wkTxt, { color: textSec }]}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.grid}>{cells}</View>
          <View style={styles.legend}>
            {(
              [
                ['#55EFC4', 'Low'],
                ['#FDAA5E', 'Med'],
                ['#E17055', 'High'],
              ] as const
            ).map(([c, l]) => (
              <View key={l} style={styles.legItem}>
                <View style={[styles.legDot, { backgroundColor: c }]} />
                <Text style={[styles.legTxt, { color: textSec }]}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected date details */}
        {selectedDate && (
          <View style={styles.detSec}>
            <Text style={[styles.detTitle, { color: text }]}>
              {new Date(year, month, selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            {selExp.length > 0 ? (
              <>
                <View style={[styles.dayTot, { backgroundColor: '#6C5CE715' }]}>
                  <Ionicons name="wallet" size={18} color="#6C5CE7" />
                  <Text
                    style={{
                      color: '#6C5CE7',
                      fontWeight: '700',
                      fontSize: 15,
                    }}
                  >
                    Total: {fmt(selExp.reduce((s, e) => s + e.amount, 0))}
                  </Text>
                </View>
                {selExp.map(e => {
                  const c =
                    CATEGORIES.find(x => x.name === e.category) || CATEGORIES[5];
                  return (
                    <View
                      key={e.id}
                      style={[
                        styles.eCard,
                        { backgroundColor: card, borderColor: border },
                      ]}
                    >
                      <View
                        style={[
                          styles.eIcon,
                          { backgroundColor: c.color + '15' },
                        ]}
                      >
                        <Ionicons
                          name={c.icon as keyof typeof Ionicons.glyphMap}
                          size={18}
                          color={c.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.eNote, { color: text }]}>
                          {e.note}
                        </Text>
                        <Text style={[styles.eMeta, { color: textSec }]}>
                          {e.memberName}
                        </Text>
                      </View>
                      <Text style={styles.eAmt}>-{fmt(e.amount)}</Text>
                    </View>
                  );
                })}
              </>
            ) : (
              <View
                style={[
                  styles.empty,
                  { backgroundColor: card, borderColor: border },
                ]}
              >
                <Ionicons name="checkmark-circle" size={32} color="#55EFC4" />
                <Text style={{ color: textSec }}>No expenses</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ctr: { flex: 1 },
  hdr: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  hdrTxt: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  mnav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  nbtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#6C5CE710',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mTxt: { fontSize: 17, fontWeight: '700' },
  calCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  wkHdr: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  wkDay: { width: cellSize, alignItems: 'center' },
  wkTxt: { fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: cellSize,
    height: cellSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cellSel: { backgroundColor: '#6C5CE7' },
  cellToday: { borderWidth: 2, borderColor: '#6C5CE7' },
  dayTxt: { fontSize: 14, fontWeight: '500' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
  },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legDot: { width: 8, height: 8, borderRadius: 4 },
  legTxt: { fontSize: 11 },
  detSec: { paddingHorizontal: 20, marginTop: 16 },
  detTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  dayTot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  eCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  eIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eNote: { fontSize: 14, fontWeight: '600' },
  eMeta: { fontSize: 11, marginTop: 2 },
  eAmt: { fontSize: 15, fontWeight: '700', color: '#E17055' },
  empty: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
});
