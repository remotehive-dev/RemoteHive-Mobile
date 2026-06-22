import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getCompany, updateCompany } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function CompanyProfile() {
  const router = useRouter();
  const { user } = useUser();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCompany(); }, []);

  const loadCompany = async () => {
    if (!user?.id) return;
    const supabase = getSupabase();
    const { data: profile } = await supabase.from('users').select('company_id').eq('clerk_id', user.id).maybeSingle();
    if (profile?.company_id) {
      const c = await getCompany(profile.company_id);
      setCompany(c);
    }
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  if (!company) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Company</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyTitle}>No company profile</Text>
          <Text style={styles.emptyDesc}>Set up your company to start posting jobs</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Company</Text>
        <TouchableOpacity onPress={() => router.push('/(employer)/company/edit')}>
          <Text style={styles.editBtn}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: company.logo_url || 'https://logo.clearbit.com/placeholder.com' }} style={styles.logo} />
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companySlug}>@{company.slug}</Text>
          {(company.tags || []).length > 0 && (
            <View style={styles.tagsRow}>
              {(company.tags || []).map((tag: string, i: number) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>{company.description || 'No description added yet'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Locations</Text><Text style={styles.infoValue}>{(company.locations || []).join(', ') || 'Not set'}</Text></View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Rating</Text><Text style={styles.infoValue}>⭐ {company.rating || 'N/A'} ({company.review_count || 0} reviews)</Text></View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Domain Verified</Text><Text style={[styles.infoValue, { color: company.domain_verified ? colors.success : colors.warning }]}>{company.domain_verified ? 'Yes' : 'No'}</Text></View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>SSO</Text><Text style={[styles.infoValue, { color: company.sso_enabled ? colors.success : colors.textTertiary }]}>{company.sso_enabled ? 'Enabled' : 'Disabled'}</Text></View>
          </View>
        </View>

        {company.website_url && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.websiteBtn} onPress={() => Linking.openURL(company.website_url)}>
              <Text style={styles.websiteBtnText}>🌐 Visit Website</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(employer)/company/edit')}>
            <Text style={styles.linkIcon}>✏️</Text>
            <Text style={styles.linkText}>Edit Company Profile</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(employer)/jobs/post')}>
            <Text style={styles.linkIcon}>📋</Text>
            <Text style={styles.linkText}>Post a Job</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(employer)/subscriptions')}>
            <Text style={styles.linkIcon}>💳</Text>
            <Text style={styles.linkText}>Subscriptions & Billing</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(employer)/settings')}>
            <Text style={styles.linkIcon}>⚙️</Text>
            <Text style={styles.linkText}>Employer Settings</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.secondary },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  editBtn: { fontSize: 14, color: colors.white, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  content: { flex: 1 },
  hero: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.inputBg, marginBottom: spacing.md },
  companyName: { fontSize: 22, fontWeight: '700', color: colors.text },
  companySlug: { fontSize: 14, color: colors.textTertiary, marginTop: 2 },
  tagsRow: { flexDirection: 'row', marginTop: spacing.sm, gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: colors.secondary + '20', borderRadius: 6 },
  tagText: { fontSize: 12, color: colors.secondary, fontWeight: '600' },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  infoText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  infoCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  websiteBtn: { backgroundColor: colors.card, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  websiteBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  linkIcon: { fontSize: 18, marginRight: spacing.md },
  linkText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  linkArrow: { fontSize: 18, color: colors.textTertiary },
});
