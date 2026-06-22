import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { updateCompany } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function EditCompany() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [locations, setLocations] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => { loadCompany(); }, []);

  const loadCompany = async () => {
    if (!user?.id) return;
    const supabase = getSupabase();
    const { data: profile } = await supabase.from('users').select('company_id').eq('clerk_id', user.id).maybeSingle();
    if (profile?.company_id) {
      setCompanyId(profile.company_id);
      const { data } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setWebsiteUrl(data.website_url || '');
        setLocations((data.locations || []).join(', '));
        setTags((data.tags || []).join(', '));
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Company name is required'); return; }
    setSaving(true);
    try {
      await updateCompany(companyId, {
        name: name.trim(),
        description: description.trim(),
        website_url: websiteUrl.trim() || null,
        locations: locations ? locations.split(',').map(s => s.trim()) : [],
        tags: tags ? tags.split(',').map(s => s.trim()) : [],
      });
      Alert.alert('Saved', 'Company updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setSaving(false);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Company</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={styles.saveLink}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.field}><Text style={styles.label}>Company Name *</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Description</Text><TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={5} placeholder="Tell candidates about your company..." placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Website URL</Text><TextInput style={styles.input} value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="https://example.com" placeholderTextColor={colors.textTertiary} autoCapitalize="none" /></View>
        <View style={styles.field}><Text style={styles.label}>Locations (comma-separated)</Text><TextInput style={styles.input} value={locations} onChangeText={setLocations} placeholder="Remote, San Francisco, London" placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="MNC, Fintech, Startup" placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.domainSection}>
          <Text style={styles.domainTitle}>🔒 Domain Verification</Text>
          <Text style={styles.domainDesc}>Verify your domain to unlock SSO and get the verified badge. Add a TXT record to your DNS.</Text>
          <TouchableOpacity style={styles.domainBtn}><Text style={styles.domainBtnText}>Start Verification</Text></TouchableOpacity>
        </View>
        <View style={styles.domainSection}>
          <Text style={styles.domainTitle}>🔑 Single Sign-On (SSO)</Text>
          <Text style={styles.domainDesc}>Allow team members to sign in using your company email domain. Requires domain verification.</Text>
          <TouchableOpacity style={[styles.domainBtn, { backgroundColor: colors.inputBg }]}><Text style={[styles.domainBtnText, { color: colors.textTertiary }]}>Configure SSO</Text></TouchableOpacity>
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
  form: { padding: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  domainSection: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  domainTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  domainDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  domainBtn: { marginTop: spacing.sm, backgroundColor: colors.secondary, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center' },
  domainBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});
