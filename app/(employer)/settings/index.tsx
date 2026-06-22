import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { updateUserProfile } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function EmployerSettings() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    if (!clerkUser?.id) return;
    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('*').eq('clerk_id', clerkUser.id).maybeSingle();
    if (data) {
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setNotifications(data.notifications_enabled !== false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!clerkUser?.id) return;
    setSaving(true);
    try {
      await updateUserProfile(clerkUser.id, { full_name: fullName.trim(), phone } as any);
      Alert.alert('Saved', 'Settings updated');
    } catch (e: any) { Alert.alert('Error', e.message); }
    setSaving(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Account', 'This will permanently delete all data. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const supabase = getSupabase();
        await supabase.from('users').delete().eq('clerk_id', clerkUser?.id);
        await signOut();
        router.replace('/(auth)/role-select');
      }},
    ]);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={styles.saveLink}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.field}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor={colors.textTertiary} /></View>
          <View style={styles.field}><Text style={styles.label}>Email</Text><Text style={styles.readonlyValue}>{clerkUser?.emailAddresses?.[0]?.emailAddress || 'N/A'}</Text></View>
          <View style={styles.field}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Add phone number" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" /></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity style={styles.toggleRow} onPress={() => setNotifications(!notifications)}>
            <Text style={styles.toggleLabel}>Email Notifications</Text>
            <View style={[styles.toggle, notifications && styles.toggleActive]}>
              <View style={[styles.toggleThumb, notifications && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.toggleDesc}>Receive email alerts for new applicants and activity</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Password', 'Password change is handled by Clerk. Use the web dashboard.')}>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('Coming Soon', 'Notification preferences coming soon')}>
            <Text style={styles.menuText}>Notification Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(employer)/subscriptions')}>
            <Text style={styles.menuText}>Subscriptions & Billing</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.signOutRow]} onPress={() => { signOut(); router.replace('/(auth)/role-select'); }}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.deleteRow]} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
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
  saveLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  content: { flex: 1, padding: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text },
  readonlyValue: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.textTertiary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: colors.text },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, padding: 2 },
  toggleActive: { backgroundColor: colors.secondary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleThumbActive: { alignSelf: 'flex-end' },
  toggleDesc: { fontSize: 12, color: colors.textTertiary, marginTop: 4, marginLeft: spacing.xs },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  menuText: { fontSize: 14, fontWeight: '500', color: colors.text },
  menuArrow: { fontSize: 18, color: colors.textTertiary },
  signOutRow: { borderColor: colors.warning, marginTop: spacing.md },
  signOutText: { fontSize: 14, fontWeight: '600', color: colors.warning },
  deleteRow: { borderColor: colors.error },
  deleteText: { fontSize: 14, fontWeight: '600', color: colors.error },
});
