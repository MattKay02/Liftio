import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeDatabase } from '@/lib/database/db';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { Colors } from '@/constants';
import { FloatingWorkoutTimer } from '@/components/shared/FloatingWorkoutTimer';
import { KeyboardDismissButton } from '@/components/shared/KeyboardDismissButton';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        loadSettings();
      } catch (e) {
        console.error('Database init failed:', e);
      } finally {
        setDbReady(true);
        SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/active"
          options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="workout/add-exercise"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="workout/finish"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="workout/[id]" />
      </Stack>
      <FloatingWorkoutTimer />
      <KeyboardDismissButton />
    </GestureHandlerRootView>
  );
}
