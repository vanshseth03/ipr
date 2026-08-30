import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../api/queryClient';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

import '../i18n';

export default function RootLayout() {
  useEffect(() => {
    useAuthStore.getState().bootstrapAuth();
    useSettingsStore.getState().loadSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
