import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getSupabase } from '@/lib/supabase';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', headline: '', bio: '', phone: '', city: '', country: '', linkedin_url: '', portfolio_url: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    getSupabase().from('users').select('*').eq('clerk_id', user?.id).maybeSingle().then((res: any) => {
      const p = res?.data;
      if (p) {
        setForm({ full_name: p.full_name || '', headline: p.headline || '', bio: p.bio || '', phone: p.phone || '', city: p.city || '', country: p.country || '', linkedin_url: p.linkedin_url || '', portfolio_url: p.portfolio_url || '' });
        setSkills(p.skills || []);
      }
      setLoading(false);
    });
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const handleSave = async () => {
    if (!form.full_name) { Alert.alert('Error', 'Name is required'); return; }
    setSaving(true);
    try {
      const token = await getToken({ template: 'supabase' });
      await getSupabase(token || undefined).from('users').upsert({ clerk_id: user?.id, ...form, skills, updated_at: new Date().toISOString() }, { onConflict: 'clerk_id' });
      Alert.alert('Saved', 'Profile updated successfully');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSaving(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={form.full_name} onChangeText={v => setForm(f => ({ ...f, full_name: v }))} placeholder="Your full name" placeholderTextColor={colors.textTertiary} />

        <Text style={styles.label}>Professional Headline</Text>
        <TextInput style={styles.input} value={form.headline} onChangeText={v => setForm(f => ({ ...f, headline: v }))} placeholder="e.g., Senior React Developer" placeholderTextColor={colors.textTertiary} />

        <Text style={styles.label}>Bio / Summary</Text>
        <TextInput style={[styles.input, styles.textArea]} value={form.bio} onChangeText={v => setForm(f => ({ ...f, bio: v }))} placeholder="Tell employers about yourself" placeholderTextColor={colors.textTertiary} multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles.label}>Skills</Text>
        <View style={styles.skillsRow}>
          {skills.map(s => (
            <TouchableOpacity key={s} style={styles.skillChip} onPress={() => setSkills(prev => prev.filter(x => x !== s))}>
              <Text style={styles.skillText}>{s} ×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.skillInputRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={skillInput} onChangeText={setSkillInput} placeholder="Add a skill" placeholderTextColor={colors.textTertiary} onSubmitEditing={addSkill} />
          <TouchableOpacity style={styles.addBtn} onPress={addSkill}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />

        <Text style={styles.label}>Location</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} value={form.city} onChangeText={v => setForm(f => ({ ...f, city: v }))} placeholder="City" placeholderTextColor={colors.textTertiary} />
          <TextInput style={[styles.input, { flex: 1 }]} value={form.country} onChangeText={v => setForm(f => ({ ...f, country: v }))} placeholder="Country" placeholderTextColor={colors.textTertiary} />
        </View>

        <Text style={styles.label}>Links</Text>
        <TextInput style={styles.input} value={form.linkedin_url} onChangeText={v => setForm(f => ({ ...f, linkedin_url: v }))} placeholder="LinkedIn URL" placeholderTextColor={colors.textTertiary} autoCapitalize="none" keyboardType="url" />
        <TextInput style={styles.input} value={form.portfolio_url} onChangeText={v => setForm(f => ({ ...f, portfolio_url: v }))} placeholder="Portfolio URL" placeholderTextColor={colors.textTertiary} autoCapitalize="none" keyboardType="url" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  form: { padding: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  skillChip: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  skillText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  skillInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  addBtn: { width: 44, height: 44, backgroundColor: colors.primary, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.white, fontSize: 22, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
