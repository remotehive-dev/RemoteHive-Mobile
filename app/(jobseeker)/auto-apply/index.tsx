import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getCampaigns, updateCampaign } from '@/lib/api';

export default function AutoApply() {
  const router = useRouter();
  const { user } = useUser();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getCampaigns(user.id);
    setCampaigns(data);
    setLoading(false);
  };

  const toggleStatus = async (campaign: any) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaign(campaign.id, { status: newStatus });
    loadCampaigns();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Auto-Apply</Text>
        <TouchableOpacity onPress={() => router.push('/(jobseeker)/auto-apply/create')}>
          <Text style={styles.createLink}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Automate Your Job Search</Text>
        <Text style={styles.heroDesc}>Set up campaigns that automatically find and apply to matching jobs</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : campaigns.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>No campaigns yet</Text>
          <Text style={styles.emptyDesc}>Create your first auto-apply campaign to start automating your job applications</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(jobseeker)/auto-apply/create')}>
            <Text style={styles.primaryBtnText}>Create Campaign</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {campaigns.map(campaign => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: campaign.status === 'active' ? colors.success + '20' : campaign.status === 'paused' ? colors.warning + '20' : colors.inputBg }]}>
                  <Text style={[styles.statusText, { color: campaign.status === 'active' ? colors.success : campaign.status === 'paused' ? colors.warning : colors.textTertiary }]}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.targetRole}>🎯 {campaign.target_role}</Text>
              {campaign.target_location && <Text style={styles.targetLocation}>📍 {campaign.target_location}</Text>}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressCount}>{campaign.applications_sent || 0}/{campaign.max_applications}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, ((campaign.applications_sent || 0) / campaign.max_applications) * 100)}%` }]} />
                </View>
              </View>
              <View style={styles.campaignActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: campaign.status === 'active' ? colors.warning : colors.success }]} onPress={() => toggleStatus(campaign)}>
                  <Text style={styles.actionBtnText}>{campaign.status === 'active' ? 'Pause' : 'Resume'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Results</Text>
                </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  createLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  hero: { padding: spacing.lg, backgroundColor: colors.primary },
  heroTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  primaryBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  list: { padding: spacing.lg },
  campaignCard: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  campaignTitle: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  targetRole: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  targetLocation: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  progressSection: { marginTop: spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: colors.textSecondary },
  progressCount: { fontSize: 12, color: colors.text, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: colors.inputBg, borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  campaignActions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});
