import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSupabase } from '../../src/lib/supabase';

export default function RoleSelect() {
  const router = useRouter();
  const { isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const redirected = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (redirected.current) return;
    if (isSignedIn && clerkUser) {
      redirected.current = true;
      (async () => {
        try {
          const token = await getToken({ template: 'supabase' });
          const supabase = getSupabase(token || undefined);
          const { data } = await supabase.from('users').select('id').eq('clerk_id', clerkUser.id).maybeSingle();
          router.replace(data ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
        } catch {
          router.replace('/(auth)/jobseeker-onboarding');
        }
      })();
    }
  }, [isSignedIn, clerkUser]);

  if (isSignedIn) return null;

  const handleGetStarted = () => {
    router.push('/(auth)/jobseeker-auth');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Image source={require('../../assets/logo-original.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>RemoteHive</Text>
        <Text style={styles.subtitle}>Find your dream remote job</Text>
      </Animated.View>

      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Browse 10,000+ remote jobs</Text>
              <Text style={styles.featureDesc}>From top companies worldwide</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>One-tap apply</Text>
              <Text style={styles.featureDesc}>Apply to jobs in seconds</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Track applications</Text>
              <Text style={styles.featureDesc}>Stay updated on your job search</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleGetStarted} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  topSection: { 
    alignItems: 'center', 
    paddingTop: 100, 
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 36, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: colors.white, opacity: 0.85, marginTop: 8 },
  bottomSection: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 20,
  },
  featureList: { marginBottom: spacing.xl },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: { fontSize: 24, marginRight: spacing.md, width: 32 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  featureDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryBtnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 12, color: colors.textTertiary },
});
