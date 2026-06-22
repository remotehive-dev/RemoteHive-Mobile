import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { EmployerAuthProvider } from '../src/components/EmployerAuthProvider';

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export default function RootLayout() {
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
        </EmployerAuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
