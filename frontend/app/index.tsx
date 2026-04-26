/**
 * Splash Screen — animated landing that auto-redirects to the login page.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient
      colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconBg}>
            <Ionicons name="wallet" size={48} color="#6C5CE7" />
          </View>
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={styles.title}>Team Budget</Text>
          <Text style={styles.subtitle}>Tracker</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          Smart spending, together.
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <Animated.View key={i} style={[styles.dot, { opacity: fadeAnim }]} />
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  iconContainer: { marginBottom: 24 },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: -4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    letterSpacing: 1,
  },
  footer: { position: 'absolute', bottom: 60 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
