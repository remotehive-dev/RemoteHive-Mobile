import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { createCampaign } from '@/lib/api';

export default function CreateCampaign() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxApps, setMaxApps] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !targetRole.trim()) {
      Alert.alert('Required', 'Campaign title and target role are required');
      return;
    }
    setSubmitting(true);
    try {
      await createCampaign({
        user_id: user?.id,
        title: title.trim(),
        target_role: targetRole.trim(),
        target_location: targetLocation.trim() || null,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
        min_salary: minSalary ? parseInt(minSalary) : null,
        max_applications: parseInt(maxApps) || 50,
        applications_sent: 0,
        status: 'active',
      });
      Alert.alert('Success', 'Campaign created! Auto-apply will start shortly.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>New Campaign</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Campaign Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Senior React Jobs" placeholderTextColor={colors.textTertiary} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Target Role *</Text>
          <TextInput style={styles.input} value={targetRole} onChangeText={setTargetRole} placeholder="e.g. React Developer" placeholderTextColor={colors.textTertiary} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Target Location (optional)</Text>
          <TextInput style={styles.input} value={targetLocation} onChangeText={setTargetLocation} placeholder="e.g. Remote" placeholderTextColor={colors.textTertiary} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Keywords (comma-separated)</Text>
          <TextInput style={styles.input} value={keywords} onChangeText={setKeywords} placeholder="e.g. react, typescript, next.js" placeholderTextColor={colors.textTertiary} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Minimum Salary (optional)</Text>
          <TextInput style={styles.input} value={minSalary} onChangeText={setMinSalary} placeholder="e.g. 50000" keyboardType="numeric" placeholderTextColor={colors.textTertiary} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Max Applications</Text>
          <TextInput style={styles.input} value={maxApps} onChangeText={setMaxApps} placeholder="50" keyboardType="numeric" placeholderTextColor={colors.textTertiary} />
        </View>

        <TouchableOpacity style={[styles.submitBtn, (!title.trim() || !targetRole.trim() || submitting) && styles.submitBtnDisabled]} onPress={handleCreate} disabled={!title.trim() || !targetRole.trim() || submitting}>
          <Text style={styles.submitBtnText}>{submitting ? 'Creating...' : 'Create Campaign'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  form: { padding: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
