import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getAllApplications, updateApplicationStatus } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

const PIPELINE_STAGES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];

export default function Applicants() {
  const router = useRouter();
  const { user } = useUser();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadApps(); }, []);

  const loadApps = async () => {
    if (!user?.id) return;
    setLoading(true);
    const supabase = getSupabase();
    const { data: profile } = await supabase.from('users').select('company_id').eq('clerk_id', user.id).maybeSingle();
    if (profile?.company_id) {
      const data = await getAllApplications(profile.company_id);
      setApplications(data);
    }
    setLoading(false);
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const stageCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach(s => stageCounts[s] = applications.filter(a => a.status === s).length);

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      loadApps();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const showStatusMenu = (app: any) => {
    const options = PIPELINE_STAGES.filter(s => s !== app.status).map(s => ({
      text: s.charAt(0).toUpperCase() + s.slice(1), onPress: () => { updateStatus(app.id, s); }
    }));
    Alert.alert('Update Status', `Current: ${app.status}`, [...options, { text: 'Cancel', style: 'cancel' as const, onPress: () => {} }]);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applicants</Text>
        <Text style={styles.headerCount}>{applications.length} total</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>All ({applications.length})</Text>
        </TouchableOpacity>
        {PIPELINE_STAGES.map(stage => (
          <TouchableOpacity key={stage} style={[styles.filterChip, filter === stage && styles.filterChipActive]} onPress={() => setFilter(stage)}>
            <Text style={[styles.filterChipText, filter === stage && styles.filterChipTextActive]}>{stage.charAt(0).toUpperCase() + stage.slice(1)} ({stageCounts[stage] || 0})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No applicants {filter !== 'all' ? `in "${filter}"` : 'yet'}</Text>
            <Text style={styles.emptyDesc}>Applications will appear here once candidates start applying</Text>
          </View>
        ) : filtered.map(app => (
          <View key={app.id} style={styles.appCard}>
            <View style={styles.appHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(app.user?.full_name?.[0] || '?').toUpperCase()}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.user?.full_name || 'Unknown Candidate'}</Text>
                <Text style={styles.appJob}>Applied for: {app.job?.title || 'Unknown Job'}</Text>
                <Text style={styles.appDate}>{(new Date(app.created_at)).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity style={[styles.statusPill, {
                backgroundColor: app.status === 'applied' ? colors.primary + '20' : app.status === 'screening' ? colors.warning + '20' : app.status === 'interview' ? colors.secondary + '20' : app.status === 'offer' ? colors.success + '20' : app.status === 'hired' ? colors.success + '30' : colors.error + '20'
              }]} onPress={() => showStatusMenu(app)}>
                <Text style={[styles.statusPillText, {
                  color: app.status === 'applied' ? colors.primary : app.status === 'screening' ? colors.warning : app.status === 'interview' ? colors.secondary : app.status === 'offer' || app.status === 'hired' ? colors.success : colors.error
                }]}>{app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}</Text>
              </TouchableOpacity>
            </View>
            {app.cover_letter && <Text style={styles.coverLetter} numberOfLines={2}>"{app.cover_letter}"</Text>}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => showStatusMenu(app)}><Text style={styles.actionBtnText}>Move to...</Text></TouchableOpacity>
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
  headerCount: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  filterBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  filterChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  list: { padding: spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  appCard: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  appHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 18 },
  appInfo: { flex: 1, marginLeft: spacing.md },
  appName: { fontSize: 15, fontWeight: '600', color: colors.text },
  appJob: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  appDate: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  coverLetter: { fontSize: 13, color: colors.textTertiary, fontStyle: 'italic', marginTop: spacing.sm },
  actionsRow: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: 8, backgroundColor: colors.secondary, borderRadius: borderRadius.md, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});
