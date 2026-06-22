import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getEmployerJobs, updateEmployerJob } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

export default function EditJob() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [workplaceType, setWorkplaceType] = useState('remote');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    const supabase = getSupabase();
    const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (data) {
      setTitle(data.title || '');
      setLocation(data.location || '');
      setType(data.type || 'Full-time');
      setWorkplaceType(data.workplace_type || 'remote');
      setSalaryRange(data.salary_range || '');
      setDescription(data.description || '');
      setRequirements((data.requirements || []).join('\n'));
      setBenefits((data.benefits || []).join('\n'));
      setSkills((data.tags || []).join(', '));
      setStatus(data.status || 'draft');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Job title is required'); return; }
    setSaving(true);
    try {
      await updateEmployerJob(id, {
        title: title.trim(),
        location: location.trim(),
        type,
        workplace_type: workplaceType,
        salary_range: salaryRange.trim() || null,
        description: description.trim(),
        requirements: requirements.split('\n').filter(Boolean),
        benefits: benefits.split('\n').filter(Boolean),
        tags: skills ? skills.split(',').map((s: string) => s.trim()) : [],
        status,
      });
      Alert.alert('Saved', 'Job updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Edit Job</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={styles.saveLink}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.field}><Text style={styles.label}>Status</Text><View style={styles.chipRow}>{['active', 'draft', 'closed'].map(s => <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}><Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text></TouchableOpacity>)}</View></View>
        <View style={styles.field}><Text style={styles.label}>Job Title</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Location</Text><TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Type</Text><View style={styles.chipRow}>{['Full-time', 'Part-time', 'Contract', 'Freelance'].map(t => <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}><Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text></TouchableOpacity>)}</View></View>
        <View style={styles.field}><Text style={styles.label}>Workplace</Text><View style={styles.chipRow}>{['remote', 'hybrid', 'onsite'].map(t => <TouchableOpacity key={t} style={[styles.chip, workplaceType === t && styles.chipActive]} onPress={() => setWorkplaceType(t)}><Text style={[styles.chipText, workplaceType === t && styles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text></TouchableOpacity>)}</View></View>
        <View style={styles.field}><Text style={styles.label}>Salary Range</Text><TextInput style={styles.input} value={salaryRange} onChangeText={setSalaryRange} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Description</Text><TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={6} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Requirements (one per line)</Text><TextInput style={[styles.input, styles.textArea]} value={requirements} onChangeText={setRequirements} multiline numberOfLines={5} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Benefits (one per line)</Text><TextInput style={[styles.input, styles.textArea]} value={benefits} onChangeText={setBenefits} multiline numberOfLines={4} placeholderTextColor={colors.textTertiary} /></View>
        <View style={styles.field}><Text style={styles.label}>Skills (comma-separated)</Text><TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholderTextColor={colors.textTertiary} /></View>
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.white },
});
