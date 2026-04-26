import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/context/app-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

function AppNavigator() {
  const { isInitialized, isLoggedIn, initAuth } = useApp();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [isInitialized, isLoggedIn, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
