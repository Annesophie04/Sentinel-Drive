/**
 * Sentinel Drive Sense — Main App entry point
 *
 * Sets up:
 * - Navigation stack
 * - Settings + Drive context providers
 * - Database initialization
 * - Onboarding gate
 */
import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDatabase } from './src/services/database';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { DriveProvider } from './src/context/DriveContext';
import { Colors } from './src/constants/theme';

// Screens
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DriveScreen } from './src/screens/DriveScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TripDetailScreen } from './src/screens/TripDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

/** Navigation param list — exported for screen type safety */
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Drive: undefined;
  Summary: { tripId: string };
  History: undefined;
  TripDetail: { tripId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Dark navigation theme matching our design system */
const DarkNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.bg,
    card: Colors.bg,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.primary,
  },
};

/** App navigator — conditionally shows onboarding */
function AppNavigator() {
  const { settings, ready } = useSettings();

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      {!settings.onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Drive"
            component={DriveScreen}
            options={{
              gestureEnabled: false, // Prevent accidental swipe back during drive
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setDbReady(true); // Continue anyway, will use defaults
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <SettingsProvider>
        <DriveProvider>
          <NavigationContainer theme={DarkNavTheme}>
            <AppNavigator />
          </NavigationContainer>
        </DriveProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
