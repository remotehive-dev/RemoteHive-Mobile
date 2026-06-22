import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';

export default function Wallet() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Wallet</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹0.00</Text>
        <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>Add Money</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  balanceCard: { margin: spacing.lg, padding: spacing.xl, backgroundColor: colors.primary, borderRadius: borderRadius.lg, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: colors.white, marginVertical: spacing.sm },
  addBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.full },
  addBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  section: { margin: spacing.lg, marginTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyState: { backgroundColor: colors.card, padding: spacing.xl, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 14, color: colors.textTertiary },
});
