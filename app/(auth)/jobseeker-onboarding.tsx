import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import PhoneVerification from '../../src/components/PhoneVerification';
import { getSupabase } from '../../src/lib/supabase';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const INTEREST_FIELDS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Data', 'Finance', 'HR', 'Legal', 'Operations', 'Content', 'Education'];

type StepData = {
  phone: string; countryCode: string;
  city: string; country: string;
  currentRole: string; currentCompany: string; experience: string;
  headline: string; summary: string; skills: string; linkedin: string; portfolio: string;
  jobTypes: string[]; interests: string[];
};

export default function JobseekerOnboarding() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StepData>({
    phone: '', countryCode: '+91', city: '', country: '',
    currentRole: '', currentCompany: '', experience: '',
    headline: '', summary: '', skills: '', linkedin: '', portfolio: '',
    jobTypes: [], interests: [],
  });

  const update = (field: keyof StepData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field: 'jobTypes' | 'interests', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        Alert.alert('Error', 'Could not get auth token. Try signing in again.');
        setLoading(false);
        return;
      }
      const supabase = getSupabase(token);
      const profile = {
        clerk_id: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress || '',
        full_name: user?.fullName || data.headline,
        role: 'jobseeker' as const,
        phone: `${data.countryCode}${data.phone}`,
        phone_verified: true,
        city: data.city,
        country: data.country,
        headline: data.headline,
        bio: data.summary,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        resume_url: '',
        linkedin_url: data.linkedin,
        portfolio_url: data.portfolio,
      };
      const { error } = await supabase.from('users').upsert(profile, { onConflict: 'clerk_id', ignoreDuplicates: false });
      if (error) {
        if (error.code === '23505') { router.replace('/(auth)/onboarding-complete'); return; }
        Alert.alert('Error', error.message);
        return;
      }
      router.replace('/(auth)/onboarding-complete');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save profile');
    }
    setLoading(false);
  };

  const steps = [
    { title: 'Phone Verification', content: (
      <PhoneVerification onVerified={(phone, cc) => { update('phone', phone); update('countryCode', cc); setStep(1); }} />
    )},
    { title: 'Location', content: (
      <View>
        <TextInput style={s.input} placeholder="City" value={data.city} onChangeText={v => update('city', v)} />
        <TextInput style={s.input} placeholder="Country" value={data.country} onChangeText={v => update('country', v)} />
        <TouchableOpacity style={s.btn} onPress={() => data.city ? setStep(2) : null}><Text style={s.btnText}>Next</Text></TouchableOpacity>
      </View>
    )},
    { title: 'Work & Skills', content: (
      <ScrollView>
        <TextInput style={s.input} placeholder="Current Role" value={data.currentRole} onChangeText={v => update('currentRole', v)} />
        <TextInput style={s.input} placeholder="Current Company" value={data.currentCompany} onChangeText={v => update('currentCompany', v)} />
        <TextInput style={s.input} placeholder="Years of Experience" value={data.experience} onChangeText={v => update('experience', v)} keyboardType="numeric" />
        <TextInput style={s.input} placeholder="Professional Headline" value={data.headline} onChangeText={v => update('headline', v)} />
        <TextInput style={[s.input, s.textArea]} placeholder="Professional Summary" value={data.summary} onChangeText={v => update('summary', v)} multiline numberOfLines={4} />
        <TextInput style={s.input} placeholder="Skills (comma separated)" value={data.skills} onChangeText={v => update('skills', v)} />
        <TextInput style={s.input} placeholder="LinkedIn URL" value={data.linkedin} onChangeText={v => update('linkedin', v)} autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Portfolio URL" value={data.portfolio} onChangeText={v => update('portfolio', v)} autoCapitalize="none" />
        <TouchableOpacity style={s.btn} onPress={() => setStep(3)}><Text style={s.btnText}>Next</Text></TouchableOpacity>
      </ScrollView>
    )},
    { title: 'Interests', content: (
      <View>
        <Text style={s.label}>Preferred Job Types</Text>
        <View style={s.chipRow}>{JOB_TYPES.map(t => (
          <TouchableOpacity key={t} style={[s.chip, data.jobTypes.includes(t) && s.chipActive]} onPress={() => toggleArray('jobTypes', t)}>
            <Text style={[s.chipText, data.jobTypes.includes(t) && s.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}</View>
        <Text style={[s.label, { marginTop: spacing.lg }]}>Fields of Interest</Text>
        <View style={s.chipRow}>{INTEREST_FIELDS.map(f => (
          <TouchableOpacity key={f} style={[s.chip, data.interests.includes(f) && s.chipActive]} onPress={() => toggleArray('interests', f)}>
            <Text style={[s.chipText, data.interests.includes(f) && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}</View>
        <TouchableOpacity style={s.btn} onPress={handleComplete} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Complete Profile</Text>}
        </TouchableOpacity>
      </View>
    )},
  ];

  return (
    <View style={s.container}>
      <View style={s.progressBar}>
        {steps.map((_, i) => (
          <View key={i} style={[s.progressDot, i <= step && s.progressDotActive]} />
        ))}
      </View>
      <Text style={s.stepTitle}>{steps[step].title}</Text>
      <Text style={s.stepCount}>Step {step + 1} of {steps.length}</Text>
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {steps[step].content}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  progressBar: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: 60, marginBottom: spacing.lg },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary, width: 24 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  stepCount: { fontSize: 13, color: colors.textTertiary, marginBottom: spacing.lg, marginTop: 4 },
  content: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    fontSize: 16, color: colors.text, marginBottom: spacing.md,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  btn: {
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.md,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
});
