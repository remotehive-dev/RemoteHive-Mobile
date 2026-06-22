import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';

export default function Security() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete all your data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const supabase = (await import('@/lib/supabase')).getSupabase();
          await supabase.from('users').delete().eq('clerk_id', user?.id);
          await signOut();
          router.replace('/(auth)/role-select');
        } catch (e: any) { Alert.alert('Error', e.message); }
        setLoading(false);
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.emailAddresses?.[0]?.emailAddress || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Email Verified</Text>
              <Text style={[styles.value, { color: colors.success }]}>{user?.emailAddresses?.[0]?.verification?.status === 'verified' ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.error} /> : <Text style={styles.deleteBtnText}>Delete My Account</Text>}
          </TouchableOpacity>
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
  content: { padding: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, color: colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  deleteBtn: { paddingVertical: 14, backgroundColor: colors.card, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  deleteBtnText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});
