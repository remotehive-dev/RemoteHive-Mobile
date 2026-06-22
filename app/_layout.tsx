import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { EmployerAuthProvider } from '../src/components/EmployerAuthProvider';
import { checkForUpdate } from '../src/lib/updateChecker';
import UpdateDialog from '../src/components/UpdateDialog';

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export default function RootLayout() {
  const [updateInfo, setUpdateInfo] = useState<{ apkUrl: string; releaseNotes?: string } | null>(null);

  useEffect(() => {
    checkForUpdate().then((info) => {
      if (info) {
        setUpdateInfo({ apkUrl: info.apkUrl, releaseNotes: info.releaseNotes });
      }
    });
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <EmployerAuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(jobseeker)" options={{ headerShown: false }} />
            <Stack.Screen name="(employer)" options={{ headerShown: false }} />
          </Stack>
          <UpdateDialog
            visible={!!updateInfo}
            apkUrl={updateInfo?.apkUrl || ''}
            releaseNotes={updateInfo?.releaseNotes}
            onClose={() => setUpdateInfo(null)}
          />
        </EmployerAuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
