import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius } from '../../src/theme';
import { CheckCircle } from 'lucide-react-native';

export default function OnboardingComplete() {
  const router = useRouter();
  const { user } = useUser();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const name = user?.fullName || user?.firstName || 'there';
    const email = user?.emailAddresses?.[0]?.emailAddress || '';
    const phone = user?.phoneNumbers?.[0]?.phoneNumber || '';
    const apiUrl = Constants.expoConfig?.extra?.djangoApiUrl || process.env.EXPO_PUBLIC_DJANGO_API_URL || 'https://admin.remotehive.in';
    if (email) {
      fetch(`${apiUrl}/api/send-welcome-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role: 'jobseeker' }),
      }).catch(() => {});
    }
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <CheckCircle size={64} color={colors.white} strokeWidth={2.5} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Profile Complete!</Text>
        <Text style={styles.subtitle}>
          Your profile is ready. Start exploring remote opportunities tailored for you.
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(jobseeker)')} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: { marginBottom: spacing.xl },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  button: { backgroundColor: colors.white, paddingVertical: 18, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.md },
  buttonText: { color: colors.primary, fontSize: 17, fontWeight: '700' },
});
