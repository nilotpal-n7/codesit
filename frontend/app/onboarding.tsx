/**
 * Onboarding Screen — shown after registration.
 * User can create a team, join with invite code, or skip (solo mode).
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

export default function OnboardingScreen() {
  const { createTeam, joinTeam, isLoading, user } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    if (!teamName.trim()) {
      Alert.alert('Missing Name', 'Enter a team name.');
      return;
    }
    try {
      await createTeam(teamName.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Missing Code', 'Enter the invite code.');
      return;
    }
    try {
      await joinTeam(inviteCode.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.header}>
        <Ionicons name="people" size={48} color="#FFF" />
        <Text style={styles.title}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </Text>
        <Text style={styles.subtitle}>Set up your team or go solo</Text>
      </LinearGradient>

      <View style={styles.body}>
        {mode === 'choice' && (
          <>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode('create')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#6C5CE715' }]}>
                <Ionicons name="add-circle" size={28} color="#6C5CE7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Create a Team</Text>
                <Text style={styles.optionDesc}>
                  Start a new team and invite members
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode('join')}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#00B89415' }]}>
                <Ionicons name="enter" size={28} color="#00B894" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Join a Team</Text>
                <Text style={styles.optionDesc}>
                  Enter an invite code from your team admin
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now — go solo</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'create' && (
          <View style={styles.formCard}>
            <TouchableOpacity onPress={() => setMode('choice')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#6C5CE7" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Create Team</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="business-outline" size={20} color="#A29BFE" style={{ marginLeft: 16 }} />
              <TextInput
                style={styles.input}
                placeholder="Team Name"
                placeholderTextColor="#B2BEC3"
                value={teamName}
                onChangeText={setTeamName}
              />
            </View>
            <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
              <LinearGradient
                colors={['#6C5CE7', '#A29BFE']}
                style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>Create Team</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'join' && (
          <View style={styles.formCard}>
            <TouchableOpacity onPress={() => setMode('choice')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#6C5CE7" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Join Team</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="key-outline" size={20} color="#A29BFE" style={{ marginLeft: 16 }} />
              <TextInput
                style={[styles.input, { letterSpacing: 4, fontWeight: '700' }]}
                placeholder="INVITE CODE"
                placeholderTextColor="#B2BEC3"
                value={inviteCode}
                onChangeText={t => setInviteCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            <TouchableOpacity onPress={handleJoin} disabled={isLoading}>
              <LinearGradient
                colors={['#00B894', '#55EFC4']}
                style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>Join Team</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', marginTop: 16 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  body: { flex: 1, padding: 20 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  optionDesc: { fontSize: 12, color: '#636E72', marginTop: 2 },
  skipBtn: { alignItems: 'center', marginTop: 24 },
  skipText: { fontSize: 14, color: '#6C5CE7', fontWeight: '600' },
  formCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 14, color: '#6C5CE7', fontWeight: '600' },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 20 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1A1A2E',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
