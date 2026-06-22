import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { getCompanies } from '@/lib/api';

const COMPANY_TYPES = ['All', 'MNC', 'Startup', 'Agency'];

export default function CompaniesFeed() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const data = await getCompanies();
    setCompanies(data);
    setLoading(false);
  };

  const filtered = companies.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'All' || (c.tags || []).includes(activeType);
    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Companies</Text>
        <Text style={styles.headerSubtitle}>{companies.length} companies hiring</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search companies..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {COMPANY_TYPES.map(type => (
          <TouchableOpacity key={type} style={[styles.filterChip, activeType === type && styles.filterChipActive]} onPress={() => setActiveType(type)}>
            <Text style={[styles.filterChipText, activeType === type && styles.filterChipTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView style={styles.list}>
          {filtered.map(company => (
            <TouchableOpacity key={company.id} style={styles.companyCard} onPress={() => router.push(`/(jobseeker)/company/${company.id}`)}>
              <Image source={{ uri: company.logo_url || 'https://logo.clearbit.com/placeholder.com' }} style={styles.logo} />
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.name}</Text>
                <View style={styles.tagsRow}>
                  {(company.tags || []).map((tag: string, i: number) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}>⭐ {company.rating || 'N/A'}</Text>
                  <Text style={styles.reviews}>({company.review_count || 0} reviews)</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.locations}>{(company.locations || []).slice(0, 2).join(', ')}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.primary },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  searchContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  searchInput: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
  filterBar: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: spacing.lg },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  logo: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.inputBg },
  companyInfo: { flex: 1, marginLeft: spacing.md },
  companyName: { fontSize: 15, fontWeight: '600', color: colors.text },
  tagsRow: { flexDirection: 'row', marginTop: 4, gap: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: colors.primaryLight + '30', borderRadius: 4 },
  tagText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 12, color: colors.textSecondary },
  reviews: { fontSize: 12, color: colors.textTertiary, marginLeft: 2 },
  dot: { fontSize: 12, color: colors.textTertiary, marginHorizontal: 4 },
  locations: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  chevron: { fontSize: 20, color: colors.textTertiary, marginLeft: spacing.sm },
});
