import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '@/theme';
import { createEmployerJob } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

const STEPS = ['Core Details', 'Role & Skills', 'AI & Filters', 'Preview'];

export default function PostJob() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [companyId, setCompanyId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [workplaceType, setWorkplaceType] = useState('remote');
  const [salaryRange, setSalaryRange] = useState('');

  // Step 2
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');

  // Step 3
  const [tags, setTags] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    getSupabase().from('users').select('company_id').eq('clerk_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.company_id) setCompanyId(data.company_id);
    });
  }, [user]);

  const handleNext = () => {
    if (step === 0 && !title.trim()) { Alert.alert('Required', 'Job title is required'); return; }
    if (step === 1 && !description.trim()) { Alert.alert('Required', 'Job description is required'); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePublish = async () => {
    if (!companyId) { Alert.alert('Error', 'No company profile found. Create your company first.'); return; }
    setSubmitting(true);
    try {
      await createEmployerJob({
        company_id: companyId,
        title: title.trim(),
        location: location.trim() || 'Remote',
        type,
        workplace_type: workplaceType,
        salary_range: salaryRange.trim() || null,
        description: description.trim(),
        requirements: requirements ? requirements.split('\n').filter(Boolean) : [],
        benefits: benefits ? benefits.split('\n').filter(Boolean) : [],
        tags: skills ? skills.split(',').map(s => s.trim()) : [],
        experience_level: experienceLevel,
        status: 'active',
        posted_at: new Date().toISOString(),
      });
      Alert.alert('Success', 'Job posted successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.progressBar}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progressStep, i <= step ? styles.progressActive : styles.progressInactive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</Text>

      <ScrollView style={styles.form}>
        {step === 0 && (
          <>
            <View style={styles.field}><Text style={styles.label}>Job Title *</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Senior React Developer" placeholderTextColor={colors.textTertiary} /></View>
            <View style={styles.field}><Text style={styles.label}>Location</Text><TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Remote / San Francisco" placeholderTextColor={colors.textTertiary} /></View>
            <View style={styles.field}><Text style={styles.label}>Employment Type</Text><View style={styles.chipRow}>{['Full-time', 'Part-time', 'Contract', 'Freelance'].map(t => <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}><Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text></TouchableOpacity>)}</View></View>
            <View style={styles.field}><Text style={styles.label}>Workplace Type</Text><View style={styles.chipRow}>{['remote', 'hybrid', 'onsite'].map(t => <TouchableOpacity key={t} style={[styles.chip, workplaceType === t && styles.chipActive]} onPress={() => setWorkplaceType(t)}><Text style={[styles.chipText, workplaceType === t && styles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text></TouchableOpacity>)}</View></View>
            <View style={styles.field}><Text style={styles.label}>Salary Range</Text><TextInput style={styles.input} value={salaryRange} onChangeText={setSalaryRange} placeholder="e.g. ₹8L – ₹15L / year" placeholderTextColor={colors.textTertiary} /></View>
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.field}><Text style={styles.label}>Job Description *</Text><TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the role, responsibilities, and what makes it great..." placeholderTextColor={colors.textTertiary} multiline numberOfLines={6} /></View>
            <View style={styles.field}><Text style={styles.label}>Requirements (one per line)</Text><TextInput style={[styles.input, styles.textArea]} value={requirements} onChangeText={setRequirements} placeholder="• 3+ years React experience&#10;• TypeScript proficiency&#10;• Strong communication skills" placeholderTextColor={colors.textTertiary} multiline numberOfLines={5} /></View>
            <View style={styles.field}><Text style={styles.label}>Benefits (one per line)</Text><TextInput style={[styles.input, styles.textArea]} value={benefits} onChangeText={setBenefits} placeholder="• Health insurance&#10;• Flexible hours&#10;• Remote-first culture" placeholderTextColor={colors.textTertiary} multiline numberOfLines={4} /></View>
            <View style={styles.field}><Text style={styles.label}>Experience Level</Text><View style={styles.chipRow}>{['Entry', 'Mid-Level', 'Senior', 'Lead'].map(t => <TouchableOpacity key={t} style={[styles.chip, experienceLevel === t && styles.chipActive]} onPress={() => setExperienceLevel(t)}><Text style={[styles.chipText, experienceLevel === t && styles.chipTextActive]}>{t}</Text></TouchableOpacity>)}</View></View>
            <View style={styles.field}><Text style={styles.label}>Skills (comma-separated)</Text><TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="React, TypeScript, Node.js" placeholderTextColor={colors.textTertiary} /></View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.field}><Text style={styles.label}>Tags (comma-separated)</Text><TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="e.g. Remote, Fintech, MNC" placeholderTextColor={colors.textTertiary} /></View>
            <View style={styles.field}><Text style={styles.label}>Screening Questions (one per line)</Text><TextInput style={[styles.input, styles.textArea]} value={screeningQuestions} onChangeText={setScreeningQuestions} placeholder="• How many years of React experience do you have?&#10;• Are you available to start immediately?" placeholderTextColor={colors.textTertiary} multiline numberOfLines={5} /></View>
            <View style={styles.aiSection}>
              <Text style={styles.aiTitle}>🤖 AI-Powered Optimization</Text>
              <Text style={styles.aiDesc}>Our AI will help optimize your job posting for better reach and match quality. Skills-based matching will be enabled automatically.</Text>
              <TouchableOpacity style={styles.aiBtn}><Text style={styles.aiBtnText}>Optimize with AI</Text></TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewJobTitle}>{title || 'Job Title'}</Text>
              <Text style={styles.previewMeta}>{type} · {workplaceType.charAt(0).toUpperCase() + workplaceType.slice(1)} · {location || 'Remote'}</Text>
              {salaryRange ? <Text style={styles.previewSalary}>{salaryRange}</Text> : null}
              <Text style={styles.previewLabel}>Description</Text>
              <Text style={styles.previewText}>{description || 'No description provided'}</Text>
              <Text style={styles.previewLabel}>Requirements</Text>
              {requirements ? requirements.split('\n').filter(Boolean).map((r, i) => <Text key={i} style={styles.previewBullet}>• {r}</Text>) : <Text style={styles.previewText}>None specified</Text>}
              <Text style={styles.previewLabel}>Benefits</Text>
              {benefits ? benefits.split('\n').filter(Boolean).map((b, i) => <Text key={i} style={styles.previewBullet}>• {b}</Text>) : <Text style={styles.previewText}>None specified</Text>}
              <Text style={styles.previewLabel}>Experience Level</Text>
              <Text style={styles.previewText}>{experienceLevel}</Text>
              {skills ? <><Text style={styles.previewLabel}>Skills</Text><View style={styles.previewSkills}>{skills.split(',').map((s, i) => <View key={i} style={styles.skillChip}><Text style={styles.skillChipText}>{s.trim()}</Text></View>)}</View></> : null}
            </View>
          </View>
        )}

        <View style={styles.navButtons}>
          {step > 0 && <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}><Text style={styles.backBtnText}>Previous</Text></TouchableOpacity>}
          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}><Text style={styles.nextBtnText}>Next →</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.nextBtn, submitting && { opacity: 0.5 }]} onPress={handlePublish} disabled={submitting}>
              {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.nextBtnText}>Publish Job</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  progressBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xs },
  progressStep: { flex: 1, height: 4, borderRadius: 2 },
  progressActive: { backgroundColor: colors.secondary },
  progressInactive: { backgroundColor: colors.border },
  stepLabel: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: spacing.lg, paddingTop: spacing.xs, fontWeight: '600' },
  form: { padding: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, fontSize: 14, color: colors.text },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  aiSection: { backgroundColor: colors.primaryLight + '15', padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primaryLight, marginBottom: spacing.lg },
  aiTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  aiDesc: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  aiBtn: { marginTop: spacing.md, backgroundColor: colors.secondary, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing.xl },
  aiBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  previewSection: {},
  previewTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  previewCard: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  previewJobTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  previewMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  previewSalary: { fontSize: 15, fontWeight: '600', color: colors.success, marginTop: 4 },
  previewLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewText: { fontSize: 14, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  previewBullet: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  previewSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  skillChip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.secondary + '20', borderRadius: 6 },
  skillChipText: { fontSize: 11, color: colors.secondary, fontWeight: '600' },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.xl, gap: spacing.sm },
  backBtn: { flex: 1, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  backBtnText: { fontSize: 15, fontWeight: '600', color: colors.text },
  nextBtn: { flex: 1, backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center' },
  nextBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
