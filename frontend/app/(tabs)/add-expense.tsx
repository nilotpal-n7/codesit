/**
 * Add Expense Screen — redesigned with clean card UI.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

export default function AddExpenseScreen() {
  const { addExpense, members, user, isDarkMode } = useApp();
  const router = useRouter();
  const t = getTheme(isDarkMode);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [selectedMember, setSelectedMember] = useState(user?._id || '');
  const [date] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert('Missing Fields', 'Please enter amount and select a category.');
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        memberId: selectedMember || user?._id,
        memberName: members.find(m => m._id === selectedMember)?.name || user?.name || 'You',
        dateTime: date.toISOString(),
        note: note || `${category} expense`,
      });
      setAmount(''); setCategory(''); setNote('');
      router.push('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <Text style={[Typography.headingLarge, { color: t.text }]}>Add Expense</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
          <Text style={[Typography.label, { color: t.textSecondary }]}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: t.accent }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: t.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={t.textTertiary}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[Typography.label, { color: t.textSecondary, marginBottom: 10 }]}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => {
              const active = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: active ? cat.color + '18' : t.card, borderColor: active ? cat.color : t.border },
                    Shadows.card(isDarkMode),
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={18} color={cat.color} />
                  <Text style={[Typography.caption, { color: active ? cat.color : t.text }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Member Selector */}
        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.label, { color: t.textSecondary, marginBottom: 10 }]}>Team Member</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.map(m => {
                const active = selectedMember === m._id;
                return (
                  <TouchableOpacity
                    key={m._id}
                    style={[
                      styles.memberChip,
                      { backgroundColor: active ? t.accentSoft : t.card, borderColor: active ? t.accent : t.border },
                    ]}
                    onPress={() => setSelectedMember(m._id)}
                  >
                    <View style={[styles.avatar, { backgroundColor: active ? t.accent : t.textTertiary }]}>
                      <Text style={styles.avatarTxt}>{m.name[0]}</Text>
                    </View>
                    <Text style={[Typography.caption, { color: active ? t.accent : t.text }]}>
                      {m.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Date */}
        <View style={styles.section}>
          <Text style={[Typography.label, { color: t.textSecondary, marginBottom: 10 }]}>Date</Text>
          <View style={[styles.dateRow, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}>
            <Ionicons name="calendar-outline" size={20} color={t.accent} />
            <Text style={[Typography.bodyMedium, { color: t.text }]}>
              {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={[Typography.label, { color: t.textSecondary, marginBottom: 10 }]}>Note</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
            value={note}
            onChangeText={setNote}
            placeholder="What's this expense for?"
            placeholderTextColor={t.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Receipt */}
        <View style={styles.section}>
          <Text style={[Typography.label, { color: t.textSecondary, marginBottom: 10 }]}>Receipt</Text>
          <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: t.card, borderColor: t.border }]}>
            <Ionicons name="camera-outline" size={24} color={t.accent} />
            <Text style={[Typography.bodyMedium, { color: t.textSecondary }]}>Tap to upload</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} disabled={saving}>
            <LinearGradient
              colors={isDarkMode ? ['#7C6EF7', '#5B50C9'] : ['#6C5CE7', '#A29BFE']}
              style={[styles.saveBtn, saving && { opacity: 0.7 }, Shadows.button(isDarkMode)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={[Typography.headingSmall, { color: '#FFF' }]}>Save Expense</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  amountCard: {
    margin: 20,
    padding: 24,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  currency: { fontSize: 36, fontWeight: '700', marginRight: 4 },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    minWidth: 100,
    textAlign: 'center',
  },
  section: { paddingHorizontal: 20, marginTop: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 6,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginRight: 8,
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  noteInput: {
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    gap: 8,
    marginTop: 8,
  },
});
