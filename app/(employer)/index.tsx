import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { useUser } from '@clerk/clerk-expo';
import { getEmployerDashboardStats } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function EmployerDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [stats, setStats] = useState<any>({ activeJobs: 0, draftJobs: 0, totalApplications: 0, viewsLast30Days: 0 });
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    (async () => {
      if (!user?.id) return;
      const supabase = getSupabase();
      const { data: profile } = await supabase.from('users').select('*').eq('clerk_id', user.id).maybeSingle();
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        const s = await getEmployerDashboardStats(profile.company_id);
        setStats(s);
      }
      setLoading(false);
    })();
  });

  const getApplyRate = () => {
    if (stats.viewsLast30Days > 0) return ((stats.totalApplications / stats.viewsLast30Days) * 100).toFixed(1) + '%';
    return '0%';
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employer Dashboard</Text>
        <Text style={styles.subtitle}>Manage your remote hiring</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.activeJobs}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.totalApplications}</Text>
          <Text style={styles.statLabel}>Total Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.viewsLast30Days > 0 ? stats.viewsLast30Days : '—'}</Text>
          <Text style={styles.statLabel}>Views (30d)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{getApplyRate()}</Text>
          <Text style={styles.statLabel}>Apply Rate</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Applications (Last 7 Days)</Text>
        <View style={styles.chartContainer}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const height = Math.max(4, Math.floor(Math.random() * 60) + 8);
            return (
              <View key={day} style={styles.barCol}>
                <View style={[styles.bar, { height }]} />
                <Text style={styles.barLabel}>{day.slice(0, 3)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Job Health</Text>
          <TouchableOpacity onPress={() => router.push('/(employer)/jobs')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.healthCard}>
          <View style={styles.healthRow}>
            <View style={[styles.healthDot, { backgroundColor: colors.success }]} />
            <Text style={styles.healthLabel}>Active</Text>
            <Text style={styles.healthValue}>{stats.activeJobs}</Text>
          </View>
          <View style={styles.healthRow}>
            <View style={[styles.healthDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.healthLabel}>Drafts</Text>
            <Text style={styles.healthValue}>{stats.draftJobs}</Text>
          </View>
          <View style={styles.healthRow}>
            <View style={[styles.healthDot, { backgroundColor: colors.error }]} />
            <Text style={styles.healthLabel}>Expiring Soon</Text>
            <Text style={styles.healthValue}>0</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(employer)/jobs/post')}>
          <Text style={styles.actionBtnText}>Post a New Job →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(employer)/applicants')}>
          <Text style={styles.secondaryBtnText}>Review Applicants →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(employer)/subscriptions')}>
          <Text style={styles.secondaryBtnText}>Subscriptions & Billing →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(employer)/settings')}>
          <Text style={styles.secondaryBtnText}>Employer Settings →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityDot} />
          <View><Text style={styles.activityTitle}>New application for Senior React Dev</Text><Text style={styles.activityTime}>2 hours ago</Text></View>
        </View>
        <View style={styles.activityCard}>
          <View style={[styles.activityDot, { backgroundColor: colors.warning }]} />
          <View><Text style={styles.activityTitle}>Job "UX Designer" is expiring soon</Text><Text style={styles.activityTime}>1 day ago</Text></View>
        </View>
        <View style={styles.activityCard}>
          <View style={[styles.activityDot, { backgroundColor: colors.success }]} />
          <View><Text style={styles.activityTitle}>3 new applicants for Python Developer</Text><Text style={styles.activityTime}>3 days ago</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.secondary },
  title: { fontSize: 22, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', margin: spacing.lg, marginBottom: 0, gap: spacing.sm },
  statCard: { width: '48%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  chartSection: { margin: spacing.lg, marginBottom: 0 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, height: 120, marginTop: spacing.sm },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, backgroundColor: colors.secondary, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: colors.textTertiary, marginTop: 4 },
  section: { margin: spacing.lg, marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  healthCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  healthRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  healthDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  healthLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  healthValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  actionBtn: { backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.sm },
  actionBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: { backgroundColor: colors.card, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  secondaryBtnText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  activityCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: spacing.sm },
  activityTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  activityTime: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
});
