import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp, useUser, useAuth } from '@clerk/clerk-expo';
import { auth as firebaseAuth, PhoneAuthProvider, signInWithCredential } from '../../src/lib/firebase';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSupabase } from '../../src/lib/supabase';
import { Mail, Phone, ArrowLeft } from 'lucide-react-native';

type AuthMode = 'email' | 'phone';
type Step = 'input' | 'verify' | 'password';

export default function JobseekerAuth() {
  const router = useRouter();
  const { isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const redirected = useRef(false);

  const [mode, setMode] = useState<AuthMode>('email');
  const [step, setStep] = useState<Step>('input');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isSignedIn || !clerkUser || redirected.current) return;
    redirected.current = true;
    redirectAfterAuth();
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const redirectAfterAuth = async (phoneUserId?: string) => {
    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = getSupabase(token || undefined);
      const clerkId = phoneUserId || clerkUser?.id;
      const { data } = await supabase.from('users').select('id').eq('clerk_id', clerkId).maybeSingle();
      router.replace(data ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
    } catch {
      router.replace('/(auth)/jobseeker-onboarding');
    }
  };

  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Signing you in...</Text>
      </View>
    );
  }

  const checkEmail = async () => {
    if (!email) { setError('Enter your email address'); return; }
    setLoading(true);
    setError('');
    try {
      const token = await getToken({ template: 'supabase' });
      const supabase = getSupabase(token || undefined);
      const { data } = await supabase.from('users').select('clerk_id').eq('email', email.toLowerCase().trim()).maybeSingle();
      setStep('password');
      if (data?.clerk_id) setName('');
    } catch {
      setStep('password');
    }
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!password) { setError('Password required'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await signIn!.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setSignInActive!({ session: result.createdSessionId });
      }
    } catch (e: any) {
      if (e.errors?.[0]?.code === 'form_identifier_not_found') {
        if (!name) { setError('Full name required for new account'); setLoading(false); return; }
        const result = await signUp!.create({ emailAddress: email, password, firstName: name });
        if (result.status === 'complete') {
          await setSignUpActive!({ session: result.createdSessionId });
        } else if (result.status === 'missing_requirements') {
          Alert.alert('Verify Email', 'Please check your email for a verification link.');
        }
      } else {
        setError(e.errors?.[0]?.longMessage || e.message || 'Authentication failed');
      }
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 7) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    setError('');
    try {
      const provider = new PhoneAuthProvider(firebaseAuth);
      const id = await provider.verifyPhoneNumber(`${countryCode}${phone}`, undefined!);
      setVerificationId(id);
      setStep('verify');
      setTimer(60);
      timerRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCred = await signInWithCredential(firebaseAuth, credential);
      if (userCred.user?.phoneNumber) {
        const token = await getToken({ template: 'supabase' });
        const supabase = getSupabase(token || undefined);
        const { data: existing } = await supabase.from('users').select('id').eq('phone', userCred.user.phoneNumber).maybeSingle();
        if (existing) {
          router.replace('/(jobseeker)');
        } else {
          router.replace('/(auth)/jobseeker-onboarding');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Invalid code. Try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await signIn!.create({ identifier: email });
      const emailFactor = result.supportedFirstFactors?.find((f: any) => f.strategy === 'email_link');
      if (emailFactor) {
        await signIn!.prepareFirstFactor({ strategy: 'email_link', emailAddressId: (emailFactor as any).emailAddressId } as any);
        Alert.alert('Password Reset', 'Check your email for a sign-in link to reset your password.');
      } else {
        setError('Password reset not available for this account. Try a different sign-in method.');
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage || 'Failed to send reset email');
    }
    setLoading(false);
  };

  const TabButton = ({ label, value, icon: Icon }: { label: string; value: AuthMode; icon: any }) => (
    <TouchableOpacity style={[styles.tab, mode === value && styles.tabActive]} onPress={() => { setMode(value); setStep('input'); setError(''); }}>
      <Icon size={16} color={mode === value ? colors.primary : colors.textTertiary} />
      <Text style={[styles.tabText, mode === value && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <Text style={styles.brand}>RemoteHive</Text>
          <Text style={styles.tagline}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.tabRow}>
          <TabButton label="Email" value="email" icon={Mail} />
          <TabButton label="Phone" value="phone" icon={Phone} />
        </View>

        {mode === 'email' ? (
          <View style={styles.form}>
            {step === 'input' && (
              <>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoFocus />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} onPress={checkEmail} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
                </TouchableOpacity>
              </>
            )}
            {step === 'password' && (
              <>
                <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('input'); setError(''); }}>
                  <ArrowLeft size={20} color={colors.primary} />
                  <Text style={styles.backText}>Change email</Text>
                </TouchableOpacity>
                <Text style={styles.emailDisplay}>{email}</Text>
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry autoFocus />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailAuth} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.switchBtn} onPress={() => { setStep('input'); setError(''); }}>
                  <Text style={styles.switchText}>Don't have an account? Sign up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.form}>
            {step === 'input' && (
              <>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryPicker}>
                    <Text style={styles.countryText}>{countryCode}</Text>
                  </View>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="9876543210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={15} />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            )}
            {step === 'verify' && (
              <>
                <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('input'); setError(''); clearInterval(timerRef.current); }}>
                  <ArrowLeft size={20} color={colors.primary} />
                  <Text style={styles.backText}>Change number</Text>
                </TouchableOpacity>
                <Text style={styles.otpInfo}>Enter the code sent to {countryCode} {phone}</Text>
                <TextInput style={[styles.input, styles.otpInput]} placeholder="000000" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} autoFocus />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.resendBtn} onPress={handleSendOtp} disabled={timer > 0}>
                  <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontSize: 28, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: colors.inputBg, borderRadius: borderRadius.md, padding: 3, marginBottom: spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: borderRadius.md },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textTertiary },
  tabTextActive: { color: colors.primary },
  form: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  input: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, fontSize: 16, color: colors.text },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '700' },
  phoneRow: { flexDirection: 'row', gap: spacing.sm },
  countryPicker: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  countryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  error: { color: colors.error, fontSize: 13 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  emailDisplay: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center', marginVertical: spacing.sm },
  forgotBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  forgotText: { color: colors.primary, fontSize: 14 },
  switchBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  switchText: { color: colors.textTertiary, fontSize: 14 },
  otpInfo: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  resendBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  resendText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  resendTextDisabled: { color: colors.textTertiary },
});
