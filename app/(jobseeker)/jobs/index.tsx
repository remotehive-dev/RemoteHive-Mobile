import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors, spacing, borderRadius } from '@/theme';
import { api } from '@/lib/api';

export default function AllJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', remote: false, date: '' });

  useEffect(() => {
    api.jobs({ limit: 50 }).then(setJobs).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    if (search && !j.title?.toLowerCase().includes(search.toLowerCase()) && !j.company_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type && j.type !== filters.type) return false;
    if (filters.remote && j.workplace_type !== 'Remote') return false;
    return true;
  });

  const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Jobs</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.searchBar} placeholder="Search jobs or companies..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterLabel}>Job Type</Text>
            <ScrollableChips items={JOB_TYPES} selected={filters.type} onSelect={v => setFilters(f => ({ ...f, type: v === f.type ? '' : v }))} />
            <TouchableOpacity style={[styles.filterChip, filters.remote && styles.filterChipActive]} onPress={() => setFilters(f => ({ ...f, remote: !f.remote }))}>
              <Text style={[styles.filterChipText, filters.remote && styles.filterChipTextActive]}>Remote Only</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(jobseeker)/jobs/[id]', params: { id: item.id } })}>
              <View style={styles.cardTop}>
                <View style={styles.companyIcon}>
                  <Text style={styles.companyLetter}>{item.company_name?.[0] || '?'}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.jobTitle}>{item.title}</Text>
                  <Text style={styles.companyName}>{item.company_name}</Text>
                </View>
                <TouchableOpacity style={styles.saveBtn}>
                  <Text style={styles.saveIcon}>♡</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tags}>
                {item.type && <View style={styles.tag}><Text style={styles.tagText}>{item.type}</Text></View>}
                {item.workplace_type && <View style={styles.tag}><Text style={styles.tagText}>{item.workplace_type}</Text></View>}
                {item.location && <View style={styles.tag}><Text style={styles.tagText}>{item.location}</Text></View>}
              </View>
              <View style={styles.cardBottom}>
                {item.salary_range && <Text style={styles.salary}>{item.salary_range}</Text>}
                {item.created_at && <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function ScrollableChips({ items, selected, onSelect }: { items: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
      {items.map(item => (
        <TouchableOpacity key={item} style={[styles.filterChip, selected === item && styles.filterChipActive]} onPress={() => onSelect(item)}>
          <Text style={[styles.filterChipText, selected === item && styles.filterChipTextActive]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.primary },
  title: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', gap: spacing.sm },
  searchBar: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, color: colors.white },
  filterBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  filterBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  filtersPanel: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  filterChipText: { fontSize: 12, color: colors.textSecondary },
  filterChipTextActive: { color: colors.primary, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  companyLetter: { fontSize: 18, fontWeight: '700', color: colors.primary },
  cardInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  companyName: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  saveBtn: { padding: spacing.xs },
  saveIcon: { fontSize: 20, color: colors.textTertiary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  tagText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  salary: { fontSize: 14, fontWeight: '600', color: colors.success },
  date: { fontSize: 11, color: colors.textTertiary },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
