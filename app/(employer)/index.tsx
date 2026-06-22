import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';

export default function EmployerDashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employer Dashboard</Text>
        <Text style={styles.subtitle}>Manage your remote hiring</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { value: '12', label: 'Active Jobs', color: colors.primary },
          { value: '45', label: 'Total Apps', color: colors.secondary },
          { value: '1.2k', label: 'Views (30d)', color: colors.success },
          { value: '8.5%', label: 'Apply Rate', color: colors.warning },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
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
            <Text style={styles.healthLabel}>Active</Text>
            <Text style={styles.healthValue}>8</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Drafts</Text>
            <Text style={styles.healthValue}>3</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Expiring Soon</Text>
            <Text style={[styles.healthValue, { color: colors.warning }]}>2</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(employer)/jobs')}>
          <Text style={styles.actionBtnText}>Post a New Job →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(employer)/applicants')}>
          <Text style={styles.secondaryBtnText}>Review Applicants →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>New application for Senior React Dev</Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Job "UX Designer" is expiring soon</Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.secondary },
  title: { fontSize: 22, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', margin: spacing.lg, gap: spacing.sm },
  statCard: { width: '48%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  section: { margin: spacing.lg, marginBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  healthCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  healthLabel: { fontSize: 14, color: colors.textSecondary },
  healthValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  actionBtn: { backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.sm },
  actionBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: { backgroundColor: colors.card, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.secondary },
  secondaryBtnText: { color: colors.secondary, fontSize: 15, fontWeight: '600' },
  activityCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  activityTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  activityTime: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
});
