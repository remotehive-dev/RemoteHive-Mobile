import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius } from '@/theme';
import { getSupabase } from '@/lib/supabase';

type MenuItem = { icon: string; label: string; route?: any; danger?: boolean; action?: () => void };

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase().from('users').select('*').eq('clerk_id', user?.id).maybeSingle().then((res: any) => { const data = res?.data;
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/(auth)/role-select');
      }},
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await getSupabase().from('users').delete().eq('clerk_id', user?.id);
          await signOut();
          router.replace('/(auth)/role-select');
        } catch (e: any) {
          Alert.alert('Error', e.message);
        }
      }},
    ]);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Personal Information', route: '/(jobseeker)/profile/edit' },
        { icon: '📧', label: 'Email & Security', route: '/(jobseeker)/profile/security' },
        { icon: '🔔', label: 'Notifications', route: '/(jobseeker)/profile/notifications' },
      ],
    },
    {
      title: 'Wallet & Payments',
      items: [
        { icon: '💰', label: 'Wallet Balance', route: '/(jobseeker)/profile/wallet' },
        { icon: '🛒', label: 'Order History', route: '/(jobseeker)/profile/orders' },
      ],
    },
    {
      title: 'Job Management',
      items: [
        { icon: '📋', label: 'Application Tracking', route: '/(jobseeker)/activity' },
        { icon: '⭐', label: 'Saved Jobs', route: '/(jobseeker)/activity' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & FAQ', route: '/help' },
        { icon: '📝', label: 'Privacy Policy', route: '/privacy' },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.full_name?.[0] || user?.firstName?.[0] || '?').toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{profile?.email || user?.emailAddresses?.[0]?.emailAddress || ''}</Text>
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/(jobseeker)/profile/edit')}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {menuSections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                onPress={() => item.route && router.push(item.route)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, item.danger && { color: colors.error }]}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>RemoteHive v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: spacing.lg, backgroundColor: colors.primary },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  name: { fontSize: 20, fontWeight: '700', color: colors.white },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  editProfileBtn: { marginTop: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.full },
  editProfileText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  section: { margin: spacing.lg, marginBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
  menuCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { fontSize: 18, marginRight: spacing.sm },
  menuLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: colors.textTertiary, fontWeight: '300' },
  signOutBtn: { paddingVertical: 14, backgroundColor: colors.card, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginBottom: spacing.sm },
  signOutText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  deleteBtn: { paddingVertical: 14, backgroundColor: colors.card, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  deleteText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  footer: { alignItems: 'center', paddingVertical: spacing.xl },
  footerText: { fontSize: 12, color: colors.textTertiary },
});
