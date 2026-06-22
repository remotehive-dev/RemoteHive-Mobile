import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSupabase } from '../../src/lib/supabase';

type Step = 'email' | 'signin' | 'signup';

export default function JobseekerAuth() {
  const router = useRouter();
  const { isSignedIn, user: clerkUser } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const redirected = useRef(false);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  // Handle redirect after sign-in state changes
  useEffect(() => {
    if (!isSignedIn || !clerkUser || redirected.current) return;
    redirected.current = true;
    
    const doRedirect = async () => {
      try {
        const { data } = await getSupabase()
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUser.id)
          .maybeSingle();
        
        // Use replace to prevent going back to auth screens
        if (data) {
          router.replace('/(jobseeker)');
        } else {
          router.replace('/(auth)/jobseeker-onboarding');
        }
      } catch (e) {
        console.error('Redirect check failed', e);
        router.replace('/(auth)/jobseeker-onboarding');
      }
    };
    
    doRedirect();
  }, [isSignedIn, clerkUser]);

  // Show loading while redirecting
  if (isSignedIn && !redirected.current) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Signing you in...</Text>
      </View>
    );
  }

  const checkEmail = async () => {
    if (!email) { setError('Enter your email address'); return; }
    setChecking(true);
    setError('');
    try {
      const { data } = await getSupabase()
        .from('users')
        .select('clerk_id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      if (data?.clerk_id) {
        setStep('signin');
      } else {
        setStep('signup');
      }
    } catch {
      setStep('signup');
    }
    setChecking(false);
  };

  const handleEmailAuth = async () => {
    if (!password) { setError('Password required'); return; }
    setLoading(true);
    setError('');
    try {
      if (step === 'signin') {
        const result = await signIn!.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setSignInActive!({ session: result.createdSessionId });
          // Redirect handled by useEffect above after isSignedIn updates
        }
      } else {
        if (!name) { setError('Full name required'); setLoading(false); return; }
        const result = await signUp!.create({ 
          emailAddress: email, 
          password, 
          firstName: name 
        });
        if (result.status === 'complete') {
          await setSignUpActive!({ session: result.createdSessionId });
          // Redirect handled by useEffect above after isSignedIn updates
        } else if (result.status === 'missing_requirements') {
          Alert.alert('Verify Email', 'Please check your email for a verification link.');
        }
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage || e.message || 'Authentication failed');
    }
    setLoading(false);
  };

  if (step === 'email') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>Enter your email to continue</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email address" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          autoFocus 
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryBtn} onPress={checkEmail} disabled={checking}>
          {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure sign-in powered by Clerk</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity onPress={() => { setStep('email'); setError(''); }} style={styles.back}>
        <Text style={styles.backText}>← Change Email</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{step === 'signin' ? 'Welcome Back' : 'Create Account'}</Text>
      <Text style={styles.subtitle}>{step === 'signin' ? `Sign in for ${email}` : `Create account for ${email}`}</Text>
      {step === 'signup' && (
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
      )}
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailAuth} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{step === 'signin' ? 'Sign In' : 'Sign Up'}</Text>}
      </TouchableOpacity>
      {step === 'signin' && (
        <TouchableOpacity style={{ marginTop: spacing.md }} onPress={() => { setStep('signup'); setName(''); }}>
          <Text style={styles.switchText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 20, padding: spacing.sm },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.xl },
  input: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, fontSize: 16, color: colors.text, marginBottom: spacing.md },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.sm },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  switchText: { textAlign: 'center', color: colors.primary, fontSize: 14 },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: { color: colors.textTertiary, fontSize: 12 },
});
