import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { getCompany, getCompanyJobs } from '@/lib/api';

export default function CompanyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [c, j] = await Promise.all([getCompany(id), getCompanyJobs(id, 20)]);
    setCompany(c);
    setJobs(j);
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (!company) {
    return <View style={styles.loadingContainer}><Text style={{ color: colors.text }}>Company not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Company</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.hero}>
          <Image source={{ uri: company.logo_url || 'https://logo.clearbit.com/placeholder.com' }} style={styles.logo} />
          <Text style={styles.name}>{company.name}</Text>
          <View style={styles.tagsRow}>
            {(company.tags || []).map((tag: string, i: number) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {company.rating || 'N/A'}</Text>
            <Text style={styles.reviews}>({company.review_count || 0} reviews)</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {(company.locations || []).join(', ')}</Text>
          </View>
          {company.website_url && (
            <TouchableOpacity style={styles.websiteBtn} onPress={() => Linking.openURL(company.website_url)}>
              <Text style={styles.websiteBtnText}>Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{company.description || `${company.name} is a leading company in the ${(company.tags || []).join(', ')} space. They are looking for talented remote professionals to join their growing team.`}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Positions ({jobs.length})</Text>
          </View>
          {jobs.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyText}>No open positions right now</Text></View>
          ) : jobs.map(job => (
            <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => router.push(`/(jobseeker)/jobs/${job.id}`)}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>{job.type} · {job.location}</Text>
              {job.salary_range && <Text style={styles.jobSalary}>{job.salary_range}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  logo: { width: 72, height: 72, borderRadius: 16, backgroundColor: colors.inputBg, marginBottom: spacing.md },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  tagsRow: { flexDirection: 'row', marginTop: spacing.sm, gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: colors.primaryLight + '30', borderRadius: 6 },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  rating: { fontSize: 14, color: colors.textSecondary },
  reviews: { fontSize: 14, color: colors.textTertiary, marginLeft: 4 },
  locationRow: { marginTop: spacing.xs },
  locationText: { fontSize: 13, color: colors.textSecondary },
  websiteBtn: { marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.full },
  websiteBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  section: { padding: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  emptyState: { backgroundColor: colors.card, padding: spacing.xl, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 14, color: colors.textTertiary },
  jobCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  jobMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  jobSalary: { fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 2 },
});
