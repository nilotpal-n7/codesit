/**
 * Onboarding Screen — create/join team or skip to solo mode.
 * Redesigned with theme system + dark mode.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

export default function OnboardingScreen() {
  const { createTeam, joinTeam, isLoading, user, isDarkMode } = useApp();
  const router = useRouter();
  const t = getTheme(isDarkMode);

  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    if (!teamName.trim()) { Alert.alert('Missing Name', 'Enter a team name.'); return; }
    try { await createTeam(teamName.trim()); router.replace('/(tabs)'); }
    catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { Alert.alert('Missing Code', 'Enter the invite code.'); return; }
    try { await joinTeam(inviteCode.trim()); router.replace('/(tabs)'); }
    catch (err: any) { Alert.alert('Error', err.message); }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={isDarkMode ? ['#2A1F5E', '#141625'] : ['#6C5CE7', '#A29BFE']}
        style={styles.header}
      >
        <Ionicons name="people" size={48} color="#FFF" />
        <Text style={[Typography.displayMedium, { color: '#FFF', marginTop: 16 }]}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </Text>
        <Text style={[Typography.body, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
          Set up your team or go solo
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {mode === 'choice' && (
          <>
            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}
              onPress={() => setMode('create')}
            >
              <View style={[styles.optionIcon, { backgroundColor: t.accentSoft }]}>
                <Ionicons name="add-circle" size={28} color={t.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.headingSmall, { color: t.text }]}>Create a Team</Text>
                <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 2 }]}>
                  Start a new team and invite members
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.card(isDarkMode)]}
              onPress={() => setMode('join')}
            >
              <View style={[styles.optionIcon, { backgroundColor: t.successSoft }]}>
                <Ionicons name="enter" size={28} color={t.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.headingSmall, { color: t.text }]}>Join a Team</Text>
                <Text style={[Typography.captionSmall, { color: t.textSecondary, marginTop: 2 }]}>
                  Enter an invite code from your admin
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={[Typography.bodySemibold, { color: t.accent }]}>Skip for now — go solo</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'create' && (
          <View style={[styles.formCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.cardStrong(isDarkMode)]}>
            <TouchableOpacity onPress={() => setMode('choice')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={t.accent} />
              <Text style={[Typography.bodySemibold, { color: t.accent }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[Typography.headingLarge, { color: t.text, marginBottom: 20 }]}>Create Team</Text>
            <View style={[styles.inputGroup, { backgroundColor: t.input, borderColor: t.border }]}>
              <Ionicons name="business-outline" size={20} color={t.accent} style={{ marginLeft: 16 }} />
              <TextInput
                style={[styles.input, { color: t.text }]}
                placeholder="Team Name"
                placeholderTextColor={t.textTertiary}
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>
            <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
              <LinearGradient
                colors={isDarkMode ? ['#7C6EF7', '#5B50C9'] : ['#6C5CE7', '#A29BFE']}
                style={[styles.submitBtn, isLoading && { opacity: 0.7 }, Shadows.button(isDarkMode)]}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={[Typography.headingSmall, { color: '#FFF' }]}>Create Team</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'join' && (
          <View style={[styles.formCard, { backgroundColor: t.card, borderColor: t.border }, Shadows.cardStrong(isDarkMode)]}>
            <TouchableOpacity onPress={() => setMode('choice')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={t.accent} />
              <Text style={[Typography.bodySemibold, { color: t.accent }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[Typography.headingLarge, { color: t.text, marginBottom: 20 }]}>Join Team</Text>
            <View style={[styles.inputGroup, { backgroundColor: t.input, borderColor: t.border }]}>
              <Ionicons name="key-outline" size={20} color={t.accent} style={{ marginLeft: 16 }} />
              <TextInput
                style={[styles.input, { color: t.text, letterSpacing: 4, fontWeight: '700' }]}
                placeholder="INVITE CODE"
                placeholderTextColor={t.textTertiary}
                value={inviteCode}
                onChangeText={v => setInviteCode(v.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            <TouchableOpacity onPress={handleJoin} disabled={isLoading}>
              <LinearGradient
                colors={isDarkMode ? ['#44C9A5', '#2D9B7E'] : ['#00B894', '#55EFC4']}
                style={[styles.submitBtn, isLoading && { opacity: 0.7 }, Shadows.button(isDarkMode)]}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={[Typography.headingSmall, { color: '#FFF' }]}>Join Team</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  body: { flex: 1, padding: 20 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderRadius: Radius.xl, marginBottom: 12, borderWidth: 1,
  },
  optionIcon: {
    width: 52, height: 52, borderRadius: Radius.lg,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  skipBtn: { alignItems: 'center', marginTop: 24 },
  formCard: {
    padding: 24, borderRadius: Radius.xxl, borderWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, marginBottom: 16, borderWidth: 1,
  },
  input: {
    flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 15,
  },
  submitBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: Radius.lg,
  },
});
