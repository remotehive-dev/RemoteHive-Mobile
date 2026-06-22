import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors } from '../src/theme';
import { useEmployerAuth } from '../src/components/EmployerAuthProvider';
import { getSupabase } from '../src/lib/supabase';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { isLoading: empLoading, user: empUser } = useEmployerAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!clerkLoaded || empLoading) return;
    const timer = setTimeout(async () => {
      try {
        if (clerkSignedIn && clerkUser) {
          const token = await getToken({ template: 'supabase' });
          const supabase = getSupabase(token || undefined);
          const { data: profile } = await supabase.from('users').select('id').eq('clerk_id', clerkUser.id).maybeSingle();
          router.replace(profile ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
          return;
        }
        if (empUser) {
          const supabase = getSupabase();
          const { data: profile } = await supabase.from('users').select('company_id').eq('supabase_id', empUser.id).maybeSingle();
          router.replace(profile?.company_id ? '/(employer)' : '/(auth)/employer-onboarding');
          return;
        }
      } catch (e) {
        console.error('Auth check failed', e);
      }
      router.replace('/(auth)/role-select');
    }, 1000);
    return () => clearTimeout(timer);
  }, [clerkLoaded, empLoading, clerkSignedIn, clerkUser, empUser]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo-original.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color={colors.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 180, height: 120, marginBottom: 20 },
  loader: { position: 'absolute', bottom: 80 },
});
