import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import PhoneVerification from '../../src/components/PhoneVerification';
import { getSupabase } from '../../src/lib/supabase';
import { useEmployerAuth } from '../../src/components/EmployerAuthProvider';

export default function EmployerOnboarding() {
  const router = useRouter();
  const { user } = useEmployerAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleCreateCompany = async () => {
    if (!companyName) { Alert.alert('Error', 'Company name is required'); return; }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: company, error: compErr } = await supabase
        .from('companies')
        .insert([{ name: companyName, website_url: website }])
        .select()
        .single();
      if (compErr) { Alert.alert('Error', compErr.message); setLoading(false); return; }
      const { error: userErr } = await supabase
        .from('users')
        .update({ company_id: company.id, phone: `${countryCode}${phone}`, phone_verified: phoneVerified, full_name: user?.user_metadata?.full_name || '' })
        .eq('supabase_id', user?.id);
      if (userErr) { Alert.alert('Error', userErr.message); setLoading(false); return; }
      router.replace('/(employer)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create company');
    }
    setLoading(false);
  };

  const steps = [
    { title: 'Company Details', content: (
      <View>
        <TextInput style={s.input} placeholder="Company Name *" value={companyName} onChangeText={setCompanyName} />
        <TextInput style={s.input} placeholder="Website URL" value={website} onChangeText={setWebsite} autoCapitalize="none" />
        <TouchableOpacity style={s.btn} onPress={() => companyName ? setStep(1) : null}><Text style={s.btnText}>Next</Text></TouchableOpacity>
      </View>
    )},
    { title: 'Phone Verification', content: (
      !phoneVerified ? (
        <PhoneVerification onVerified={(p, cc) => { setPhone(p); setCountryCode(cc); setPhoneVerified(true); }} />
      ) : (
        <View>
          <Text style={s.verifiedText}>✓ Phone verified: {countryCode} {phone}</Text>
          <TouchableOpacity style={s.btn} onPress={() => setStep(2)}><Text style={s.btnText}>Next</Text></TouchableOpacity>
        </View>
      )
    )},
    { title: 'Review & Submit', content: (
      <View>
        <View style={s.reviewCard}>
          <Text style={s.reviewLabel}>Company</Text>
          <Text style={s.reviewValue}>{companyName}</Text>
        </View>
        <View style={s.reviewCard}>
          <Text style={s.reviewLabel}>Website</Text>
          <Text style={s.reviewValue}>{website || 'Not provided'}</Text>
        </View>
        <View style={s.reviewCard}>
          <Text style={s.reviewLabel}>Phone</Text>
          <Text style={s.reviewValue}>{countryCode} {phone}</Text>
        </View>
        <TouchableOpacity style={s.btn} onPress={handleCreateCompany} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Complete Setup</Text>}
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
  progressDotActive: { backgroundColor: colors.secondary, width: 24 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  stepCount: { fontSize: 13, color: colors.textTertiary, marginBottom: spacing.lg, marginTop: 4 },
  content: { flex: 1 },
  input: {
    backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    fontSize: 16, color: colors.text, marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: colors.secondary, paddingVertical: 16, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.md,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  verifiedText: { fontSize: 16, color: colors.success, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xl },
  reviewCard: {
    backgroundColor: colors.inputBg, padding: spacing.md, borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  reviewLabel: { fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
  reviewValue: { fontSize: 16, color: colors.text, fontWeight: '500', marginTop: 2 },
});
