import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getEmployerJobs, updateEmployerJob } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function MyJobs() {
  const router = useRouter();
  const { user } = useUser();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    if (!user?.id) return;
    setLoading(true);
    const supabase = getSupabase();
    const { data: profile } = await supabase.from('users').select('company_id').eq('clerk_id', user.id).maybeSingle();
    if (profile?.company_id) {
      const data = await getEmployerJobs(profile.company_id);
      setJobs(data);
    }
    setLoading(false);
  };

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
  const counts = { all: jobs.length, active: jobs.filter(j => j.status === 'active' || j.status === 'published').length, draft: jobs.filter(j => j.status === 'draft').length, closed: jobs.filter(j => j.status === 'closed' || j.status === 'archived').length };

  const toggleStatus = async (job: any) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    await updateEmployerJob(job.id, { status: newStatus });
    loadJobs();
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Job Listings</Text>
        <TouchableOpacity onPress={() => router.push('/(employer)/jobs/post')}>
          <Text style={styles.postBtn}>+ Post New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'active', label: `Active (${counts.active})` },
          { key: 'draft', label: `Drafts (${counts.draft})` },
          { key: 'closed', label: `Closed (${counts.closed})` },
        ].map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{filter === 'all' ? '📋' : '📭'}</Text>
            <Text style={styles.emptyTitle}>{filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}</Text>
            <Text style={styles.emptyDesc}>Post your first job to start receiving applications</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(employer)/jobs/post')}>
              <Text style={styles.emptyBtnText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMeta}>{job.type} · {job.location} · {job.workplace_type}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: job.status === 'active' || job.status === 'published' ? colors.success + '20' : job.status === 'draft' ? colors.warning + '20' : colors.inputBg
                }]}>
                  <Text style={[styles.statusText, {
                    color: job.status === 'active' || job.status === 'published' ? colors.success : job.status === 'draft' ? colors.warning : colors.textTertiary
                  }]}>{job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Apps</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Views</Text></View>
              <View style={styles.statItem}><Text style={styles.statValue}>{job.salary_range || '—'}</Text><Text style={styles.statLabel}>Salary</Text></View>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={() => toggleStatus(job)}>
                <Text style={styles.actionBtnText}>{job.status === 'active' ? 'Close' : 'Reopen'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.secondary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  postBtn: { fontSize: 14, color: colors.white, fontWeight: '600' },
  filterBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  filterChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  list: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  emptyBtn: { marginTop: spacing.lg, backgroundColor: colors.secondary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  emptyBtnText: { color: colors.white, fontWeight: '600' },
  jobCard: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  jobHeader: { marginBottom: spacing.sm },
  jobInfo: {},
  jobTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  jobMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: spacing.xs },
  statusText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});
