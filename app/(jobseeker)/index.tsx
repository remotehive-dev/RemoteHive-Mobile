import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSupabase } from '../../src/lib/supabase';

export default function JobseekerHome() {
  const router = useRouter();
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ appsCount: 0, savedCount: 0, profileStrength: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: p } = await supabase.from('users').select('*').eq('clerk_id', user?.id).maybeSingle();
      setProfile(p);
      const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
      const { count: savedCount } = await supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);
      const strength = calcStrength(p);
      setStats({ appsCount: appsCount || 0, savedCount: savedCount || 0, profileStrength: strength });
    } catch {}
    setLoading(false);
  };

  const calcStrength = (p: any) => {
    if (!p) return 0;
    let s = 0;
    if (p.full_name) s += 15;
    if (p.headline) s += 15;
    if (p.bio) s += 10;
    if (p.skills?.length > 0) s += 20;
    if (p.phone_verified) s += 15;
    if (p.resume_url) s += 15;
    if (p.linkedin_url || p.portfolio_url) s += 10;
    return s;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</Text>
        <Text style={styles.subtitle}>Find your next remote opportunity</Text>
      </View>

      <View style={styles.strengthCard}>
        <View style={styles.strengthHeader}>
          <Text style={styles.strengthLabel}>Profile Strength</Text>
          <Text style={[styles.strengthScore, stats.profileStrength >= 70 ? styles.green : stats.profileStrength >= 40 ? styles.amber : styles.red]}>
            {stats.profileStrength}%
          </Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${stats.profileStrength}%`, backgroundColor: stats.profileStrength >= 70 ? colors.success : stats.profileStrength >= 40 ? colors.warning : colors.error }]} />
        </View>
        <TouchableOpacity onPress={() => router.push('/(jobseeker)/profile')}>
          <Text style={styles.boostLink}>{stats.profileStrength < 100 ? 'Complete your profile →' : 'View profile →'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.appsCount}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.savedCount}</Text>
          <Text style={styles.statLabel}>Saved Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Interviews</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/jobs')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionLabel}>Browse Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/activity')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>My Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/resume')}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionLabel}>Resume Builder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/companies')}>
            <Text style={styles.actionIcon}>🏢</Text>
            <Text style={styles.actionLabel}>Companies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/academy')}>
            <Text style={styles.actionIcon}>🎓</Text>
            <Text style={styles.actionLabel}>Academy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/store')}>
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionLabel}>Gadgets Store</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/auto-apply')}>
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={styles.actionLabel}>Auto-Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(jobseeker)/profile')}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {['Engineering', 'Design', 'Marketing', 'Sales', 'Data', 'Product', 'HR', 'Finance'].map(cat => (
            <TouchableOpacity key={cat} style={styles.categoryChip} onPress={() => router.push({ pathname: '/(jobseeker)/jobs', params: { category: cat } })}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(jobseeker)/activity')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {stats.appsCount === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyDesc}>Start applying to jobs to see your activity here</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(jobseeker)/jobs')}>
              <Text style={styles.primaryBtnText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.activityPlaceholder}>Your recent applications will appear here</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.primary },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  strengthCard: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strengthLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  strengthScore: { fontSize: 18, fontWeight: '700' },
  green: { color: colors.success }, amber: { color: colors.warning }, red: { color: colors.error },
  progressBg: { height: 8, backgroundColor: colors.inputBg, borderRadius: 4, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  boostLink: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.lg, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  section: { margin: spacing.lg, marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionCard: { width: '48%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  categoriesScroll: { marginTop: spacing.xs },
  categoryChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.card, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.primaryLight, marginRight: spacing.sm },
  categoryText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyState: { backgroundColor: colors.card, padding: spacing.xl, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  primaryBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  activityPlaceholder: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', padding: spacing.lg },
});
