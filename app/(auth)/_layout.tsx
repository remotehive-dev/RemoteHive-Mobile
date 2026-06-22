import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-select" />
      <Stack.Screen name="jobseeker-auth" />
      <Stack.Screen name="employer-auth" />
      <Stack.Screen name="jobseeker-onboarding" />
      <Stack.Screen name="employer-onboarding" />

    </Stack>
  );
}
