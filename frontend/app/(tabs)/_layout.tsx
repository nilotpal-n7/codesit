/**
 * Bottom tab navigator with 5 tabs:
 * Dashboard (Home), Analytics, Add Expense (center FAB), Calendar, Team.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/app-context';

export default function TabLayout() {
  const { isDarkMode } = useApp();
  const tabBg = isDarkMode ? '#161B22' : '#FFFFFF';
  const tabBorder = isDarkMode ? '#21262D' : '#F0F0F5';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#B2BEC3',
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: tabBorder,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#6C5CE7',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';

          if (route.name === 'index') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'analytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'add-expense') {
            // Center FAB-style icon
            return (
              <View style={styles.fabTab}>
                <LinearGradient
                  colors={['#6C5CE7', '#A29BFE']}
                  style={styles.fabTabGrad}
                >
                  <Ionicons name="add" size={26} color="#FFF" />
                </LinearGradient>
              </View>
            );
          } else if (route.name === 'calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'team') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{ tabBarLabel: '' }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tabs.Screen
        name="team"
        options={{ tabBarLabel: 'Team' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabTab: { marginTop: -20 },
  fabTabGrad: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
