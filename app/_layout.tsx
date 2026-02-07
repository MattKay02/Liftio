import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib/database/db';
import { useSettingsStore } from '@/lib/stores/settingsStore';

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="workout/active"
        options={{ gestureEnabled: false }}
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
  );
}
