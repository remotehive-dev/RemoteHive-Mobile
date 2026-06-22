import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import { useEmployerAuth } from '../../src/components/EmployerAuthProvider';
import { getSupabase } from '../../src/lib/supabase';

export default function RoleSelect() {
  const router = useRouter();
  const { isSignedIn, user: clerkUser } = useUser();
  const { user: empUser } = useEmployerAuth();

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      getSupabase().from('users').select('id').eq('clerk_id', clerkUser.id).maybeSingle().then(({ data }) => {
        router.replace(data ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
      });
    } else if (empUser) {
      getSupabase().from('users').select('company_id').eq('supabase_id', empUser.id).maybeSingle().then(({ data }) => {
        router.replace(data?.company_id ? '/(employer)' : '/(auth)/employer-onboarding');
      });
    }
  }, [isSignedIn, empUser]);

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image source={require('../../assets/logo-original.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>RemoteHive</Text>
        <Text style={styles.subtitle}>Find or hire remote talent worldwide</Text>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.heading}>I am a...</Text>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(auth)/jobseeker-auth')} activeOpacity={0.9}>
          <View style={[styles.iconWrap, { backgroundColor: colors.indigo.light }]}>
            <View style={[styles.iconInner, { backgroundColor: colors.indigo.main }]}>
              <Text style={styles.iconText}>J</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Job Seeker</Text>
            <Text style={styles.cardDesc}>Find your dream remote job</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(auth)/employer-auth')} activeOpacity={0.9}>
          <View style={[styles.iconWrap, { backgroundColor: colors.purple.light }]}>
            <View style={[styles.iconInner, { backgroundColor: colors.purple.main }]}>
              <Text style={styles.iconText}>E</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Employer</Text>
            <Text style={styles.cardDesc}>Hire top remote talent</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topSection: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 6 },
  cardSection: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.lg,
    borderRadius: borderRadius.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconInner: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardContent: { marginLeft: spacing.md, flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
