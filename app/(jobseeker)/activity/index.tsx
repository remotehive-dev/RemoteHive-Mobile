import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getSupabase } from '@/lib/supabase';

type TabType = 'applications' | 'saved';

export default function ActivityScreen() {
  const { user } = useUser();
  const [tab, setTab] = useState<TabType>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      if (tab === 'applications') {
        const { data } = await supabase.from('applications').select('*, job:job_id(*)').eq('user_id', user?.id).order('created_at', { ascending: false });
        setApplications(data || []);
      } else {
        const { data } = await supabase.from('saved_jobs').select('*, job:job_id(*)').eq('user_id', user?.id).order('created_at', { ascending: false });
        setSavedJobs(data || []);
      }
    } catch {}
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    applied: colors.warning, screening: colors.primary, interview: colors.secondary,
    offer: colors.success, rejected: colors.error, withdrawn: colors.textTertiary,
  };

  const handleWithdraw = async (id: string) => {
    await getSupabase().from('applications').update({ status: 'withdrawn' }).eq('id', id);
    loadData();
  };

  const handleUnsave = async (id: string) => {
    await getSupabase().from('saved_jobs').delete().eq('id', id);
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Activity</Text>
      </View>

      <View style={styles.tabBar}>
        {(['applications', 'saved'] as TabType[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'applications' ? 'Applications' : 'Saved Jobs'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : tab === 'applications' && applications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptyDesc}>Start applying to jobs to track your progress here</Text>
        </View>
      ) : tab === 'saved' && savedJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No saved jobs</Text>
          <Text style={styles.emptyDesc}>Save jobs you're interested in to review later</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
          {(tab === 'applications' ? applications : savedJobs).map((item: any) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <View style={styles.companyIcon}>
                    <Text style={styles.companyLetter}>{item.job?.company_name?.[0] || '?'}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
                    <Text style={styles.companyName}>{item.job?.company_name || 'Unknown Company'}</Text>
                  </View>
                </View>
                {tab === 'applications' && (
                  <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || colors.textTertiary) + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColors[item.status] || colors.textTertiary }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                {item.created_at && (
                  <Text style={styles.dateText}>Applied {new Date(item.created_at).toLocaleDateString()}</Text>
                )}
                {tab === 'applications' && (item.status === 'applied' || item.status === 'screening') && (
                  <TouchableOpacity onPress={() => handleWithdraw(item.id)}>
                    <Text style={styles.withdrawText}>Withdraw</Text>
                  </TouchableOpacity>
                )}
                {tab === 'saved' && (
                  <TouchableOpacity onPress={() => handleUnsave(item.id)}>
                    <Text style={styles.unsaveText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.primary },
  title: { fontSize: 22, fontWeight: '700', color: colors.white },
  tabBar: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.inputBg, borderRadius: borderRadius.md, padding: 2 },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1, padding: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardRow: { flexDirection: 'row', flex: 1 },
  companyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  companyLetter: { fontSize: 18, fontWeight: '700', color: colors.primary },
  cardInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  companyName: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, marginLeft: spacing.sm },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  dateText: { fontSize: 11, color: colors.textTertiary },
  withdrawText: { fontSize: 12, color: colors.error, fontWeight: '600' },
  unsaveText: { fontSize: 12, color: colors.error, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});
