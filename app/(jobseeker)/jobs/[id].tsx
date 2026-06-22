import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getSupabase } from '@/lib/supabase';

export default function JobDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);

  useState(() => {
    loadJob();
  });

  const loadJob = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from('jobs').select('*, company:companies(*)').eq('id', id).single();
    setJob(data ? { ...data, company_name: data.company?.name || 'Unknown' } : null);
    if (user) {
      const { data: savedData } = await supabase.from('saved_jobs').select('id').eq('job_id', id).eq('user_id', user.id).maybeSingle();
      setSaved(!!savedData);
    }
    setLoading(false);
  };

  const toggleSave = async () => {
    if (!user) { Alert.alert('Sign In', 'Sign in to save jobs'); return; }
    const supabase = getSupabase();
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('job_id', id).eq('user_id', user.id);
      setSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ job_id: id, user_id: user.id });
      setSaved(true);
    }
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out this job at RemoteHive: ${job?.title} at ${job?.company_name}` });
  };

  const handleApply = () => {
    if (!user) { Alert.alert('Sign In', 'Sign in to apply'); return; }
    router.push({ pathname: '/(jobseeker)/jobs/apply', params: { id: id as string } });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!job) {
    return <View style={styles.center}><Text style={{ color: colors.textSecondary }}>Job not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleSave} style={styles.headerBtn}>
            <Text style={[styles.headerBtnText, saved && { color: colors.error }]}>{saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{job.company_name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name}</Text>

          <View style={styles.metaRow}>
            {job.workplace_type && <View style={styles.metaBadge}><Text style={styles.metaText}>{job.workplace_type}</Text></View>}
            {job.type && <View style={styles.metaBadge}><Text style={styles.metaText}>{job.type}</Text></View>}
            {job.location && <View style={styles.metaBadge}><Text style={styles.metaText}>{job.location}</Text></View>}
          </View>

          {job.salary_range && (
            <View style={styles.salaryRow}>
              <Text style={styles.salaryLabel}>Salary</Text>
              <Text style={styles.salaryValue}>{job.salary_range}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{job.description || 'No description provided.'}</Text>
        </View>

        {job.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.split('\n').filter((l: string) => l.trim()).map((req: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{req.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        {job.benefits && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            {job.benefits.split('\n').filter((l: string) => l.trim()).map((ben: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{ben.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        {job.tags && job.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.tagRow}>
              {(Array.isArray(job.tags) ? job.tags : []).map((tag: string, i: number) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}

        {job.company?.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {job.company_name}</Text>
            <Text style={styles.description}>{job.company.description}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveFooterBtn} onPress={toggleSave}>
          <Text style={[styles.saveFooterBtnText, saved && { color: colors.error }]}>{saved ? '♥ Saved' : '♡ Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerBtn: { padding: spacing.sm },
  headerBtnText: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  headerRight: { flexDirection: 'row' },
  content: { flex: 1 },
  topSection: { padding: spacing.lg, alignItems: 'center', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  logoPlaceholder: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  company: { fontSize: 16, color: colors.primary, marginTop: 4, fontWeight: '500' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md, justifyContent: 'center' },
  metaBadge: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  metaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  salaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  salaryLabel: { fontSize: 13, color: colors.textTertiary },
  salaryValue: { fontSize: 18, fontWeight: '700', color: colors.success },
  section: { padding: spacing.lg, paddingBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', marginBottom: spacing.xs },
  bullet: { fontSize: 14, color: colors.textSecondary, marginRight: spacing.sm, lineHeight: 22 },
  bulletText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, flex: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  footer: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 32 },
  saveFooterBtn: { paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  saveFooterBtnText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  applyBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center' },
  applyBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
