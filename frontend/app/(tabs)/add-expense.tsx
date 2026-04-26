/**
 * Add / Edit Expense Screen.
 *
 * Form with:
 * - Amount input
 * - Category chip selector
 * - Team member selector
 * - Date display
 * - Note textarea
 * - Receipt upload placeholder
 * - Save / Delete buttons
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { CATEGORIES } from '@/constants/categories';

export default function AddExpenseScreen() {
  const { dispatch, members, user, team, isDarkMode } = useApp();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [selectedMember, setSelectedMember] = useState(user.id);
  const [date] = useState(new Date());

  const bg = isDarkMode ? '#0D1117' : '#F8F9FE';
  const card = isDarkMode ? '#161B22' : '#FFFFFF';
  const text = isDarkMode ? '#F0F6FC' : '#1A1A2E';
  const textSec = isDarkMode ? '#8B949E' : '#636E72';
  const border = isDarkMode ? '#21262D' : '#E8ECF4';
  const inputBg = isDarkMode ? '#1C2333' : '#F8F9FE';

  const handleSave = () => {
    if (!amount || !category) {
      Alert.alert('Missing Fields', 'Please enter amount and select a category.');
      return;
    }

    const expense = {
      id: 'exp_' + Date.now(),
      amount: parseFloat(amount),
      category,
      memberId: selectedMember,
      memberName: members.find(m => m.id === selectedMember)?.name || user.name,
      teamId: team.id,
      dateTime: date.toISOString(),
      note: note || `${category} expense`,
      receiptUrl: null,
    };

    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    // Navigate to dashboard
    router.push('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.header}>
        <Text style={styles.headerTitle}>Add Expense</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Amount Input */}
        <View
          style={[styles.amountCard, { backgroundColor: card, borderColor: border }]}
        >
          <Text style={[styles.label, { color: textSec }]}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: '#6C5CE7' }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#B2BEC3"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textSec }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: card,
                    borderColor: category === cat.name ? cat.color : border,
                  },
                  category === cat.name && {
                    backgroundColor: cat.color + '15',
                  },
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Ionicons
                  name={cat.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={cat.color}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: category === cat.name ? cat.color : text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Member Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textSec }]}>Team Member</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {members.map(member => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberChip,
                  {
                    backgroundColor: card,
                    borderColor:
                      selectedMember === member.id ? '#6C5CE7' : border,
                  },
                  selectedMember === member.id && {
                    backgroundColor: '#6C5CE715',
                  },
                ]}
                onPress={() => setSelectedMember(member.id)}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        selectedMember === member.id ? '#6C5CE7' : '#B2BEC3',
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>{member.name[0]}</Text>
                </View>
                <Text
                  style={[
                    styles.memberName,
                    {
                      color:
                        selectedMember === member.id ? '#6C5CE7' : text,
                    },
                  ]}
                >
                  {member.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textSec }]}>Date</Text>
          <View
            style={[
              styles.dateCard,
              { backgroundColor: inputBg, borderColor: border },
            ]}
          >
            <Ionicons name="calendar-outline" size={20} color="#6C5CE7" />
            <Text style={[styles.dateText, { color: text }]}>
              {date.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textSec }]}>Note</Text>
          <TextInput
            style={[
              styles.noteInput,
              { backgroundColor: inputBg, color: text, borderColor: border },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="What's this expense for?"
            placeholderTextColor="#B2BEC3"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Receipt Upload */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textSec }]}>Receipt</Text>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              { backgroundColor: inputBg, borderColor: border },
            ]}
          >
            <Ionicons name="camera-outline" size={24} color="#6C5CE7" />
            <Text style={[styles.uploadText, { color: textSec }]}>
              Tap to upload receipt
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6C5CE7', '#A29BFE']}
              style={styles.saveBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Expense</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  body: { flex: 1, paddingHorizontal: 20 },
  amountCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 36, fontWeight: '700', marginRight: 4 },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    minWidth: 100,
    textAlign: 'center',
  },
  section: { marginTop: 20 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  catChipText: { fontSize: 13, fontWeight: '600' },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
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
  avatarText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  memberName: { fontSize: 13, fontWeight: '600' },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  dateText: { fontSize: 15, fontWeight: '500' },
  noteInput: {
    padding: 16,
    borderRadius: 14,
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: { fontSize: 14, fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
