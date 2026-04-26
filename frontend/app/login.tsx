/**
 * Login / Sign-Up Screen — redesigned with clean card UI + dark mode.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, ScrollView, Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/context/app-context';
import { getTheme, Radius, Shadows, Typography } from '@/constants/theme';

export default function LoginScreen() {
  const { login, register, isLoading, isDarkMode } = useApp();
  const router = useRouter();
  const t = getTheme(isDarkMode);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    try {
      if (isLogin) {
        await login(email.trim(), password);
        router.replace('/(tabs)');
      } else {
        if (!name.trim()) {
          Alert.alert('Missing Name', 'Please enter your full name.');
          return;
        }
        await register(name.trim(), email.trim(), password);
        router.replace('/onboarding' as any);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'light'} />

      {/* Header */}
      <LinearGradient
        colors={isDarkMode ? ['#2A1F5E', '#141625'] : ['#6C5CE7', '#A29BFE']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoIcon}>
            <Ionicons name="wallet" size={32} color="#6C5CE7" />
          </View>
          <Text style={[Typography.displayMedium, { color: '#FFF' }]}>Welcome Back</Text>
          <Text style={[Typography.body, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
            Track your team&apos;s expenses smartly
          </Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, opacity: fadeAnim }, Shadows.cardStrong(isDarkMode)]}>

            {/* Toggle */}
            <View style={[styles.tabBar, { backgroundColor: t.input }]}>
              <TouchableOpacity
                style={[styles.tab, isLogin && [styles.tabActive, { backgroundColor: t.card }, Shadows.card(isDarkMode)]]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[Typography.bodySemibold, { color: isLogin ? t.accent : t.textTertiary }]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && [styles.tabActive, { backgroundColor: t.card }, Shadows.card(isDarkMode)]]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[Typography.bodySemibold, { color: !isLogin ? t.accent : t.textTertiary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Demo hint */}
            {isLogin && (
              <View style={[styles.hint, { backgroundColor: t.accentSoft }]}>
                <Ionicons name="information-circle" size={16} color={t.accent} />
                <Text style={[Typography.captionSmall, { color: t.accent }]}>Demo: arjun@team.com / password123</Text>
              </View>
            )}

            {/* Name */}
            {!isLogin && (
              <View style={[styles.inputGroup, { backgroundColor: t.input, borderColor: t.border }]}>
                <Ionicons name="person-outline" size={20} color={t.accent} style={{ marginLeft: 16 }} />
                <TextInput
                  style={[styles.input, { color: t.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={t.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Email */}
            <View style={[styles.inputGroup, { backgroundColor: t.input, borderColor: t.border }]}>
              <Ionicons name="mail-outline" size={20} color={t.accent} style={{ marginLeft: 16 }} />
              <TextInput
                style={[styles.input, { color: t.text }]}
                placeholder="Email Address"
                placeholderTextColor={t.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={[styles.inputGroup, { backgroundColor: t.input, borderColor: t.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={t.accent} style={{ marginLeft: 16 }} />
              <TextInput
                style={[styles.input, { color: t.text }]}
                placeholder="Password"
                placeholderTextColor={t.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Submit */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} disabled={isLoading}>
              <LinearGradient
                colors={isDarkMode ? ['#7C6EF7', '#5B50C9'] : ['#6C5CE7', '#A29BFE']}
                style={[styles.loginBtn, isLoading && { opacity: 0.7 }, Shadows.button(isDarkMode)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={[Typography.headingSmall, { color: '#FFF' }]}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: { alignItems: 'center' },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  formContainer: { flex: 1, marginTop: -20 },
  scrollContent: { padding: 20 },
  card: {
    borderRadius: Radius.xxl,
    padding: 24,
    borderWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center' },
  tabActive: {},
  hint: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, borderRadius: Radius.md, marginBottom: 16, gap: 6,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, marginBottom: 14, borderWidth: 1,
  },
  input: {
    flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 15,
  },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: Radius.lg, gap: 8, marginTop: 8,
  },
});
