import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { getSupabase } from '@/lib/supabase';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useState(() => {
    getSupabase().from('jobs').select('*, company:companies(*)').eq('id', id).single().then(({ data }) => {
      setJob(data);
      setLoading(false);
    });
  });

  const handleSubmit = async () => {
    if (!user) { Alert.alert('Sign In', 'Sign in to apply'); return; }
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('applications').insert({
        job_id: id,
        user_id: user.id,
        status: 'applied',
        cover_letter: coverLetter,
      });
      if (error) { Alert.alert('Error', error.message); return; }
      Alert.alert('Applied!', 'Your application has been submitted.', [
        { text: 'OK', onPress: () => router.replace('/(jobseeker)/activity') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobSummary}>
          <Text style={styles.jobTitle}>{job?.title}</Text>
          <Text style={styles.jobCompany}>{job?.company_name || job?.company?.name}</Text>
        </View>

        <Text style={styles.label}>Cover Letter (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell the employer why you're a great fit for this role..."
          placeholderTextColor={colors.textTertiary}
          value={coverLetter}
          onChangeText={setCoverLetter}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Before you apply</Text>
          <Text style={styles.infoText}>Your profile information (name, email, phone, resume) will be shared with the employer.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { flex: 1, padding: spacing.lg },
  jobSummary: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  jobTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  jobCompany: { fontSize: 14, color: colors.primary, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  textArea: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, fontSize: 14, color: colors.text, minHeight: 160, textAlignVertical: 'top' },
  infoCard: { backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.lg },
  infoTitle: { fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: spacing.xs },
  infoText: { fontSize: 13, color: colors.primaryDark, lineHeight: 18 },
  footer: { padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 32 },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center' },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
