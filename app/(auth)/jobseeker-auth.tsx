import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp, useOAuth, useUser } from '@clerk/clerk-expo';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSupabase } from '../../src/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function JobseekerAuth() {
  const router = useRouter();
  const { isSignedIn, user: clerkUser } = useUser();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGitHubOAuth } = useOAuth({ strategy: 'oauth_github' });

  useEffect(() => {
    if (!isSignedIn || !clerkUser) return;
    getSupabase().from('users').select('id').eq('clerk_id', clerkUser.id).maybeSingle().then(({ data }) => {
      router.replace(data ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
    });
  }, [isSignedIn]);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    if (!email || !password) { setError('Email and password required'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        const result = await signIn!.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setSignInActive!({ session: result.createdSessionId });
          router.replace('/(auth)/jobseeker-onboarding');
        }
      } else {
        const result = await signUp!.create({ emailAddress: email, password, firstName: name });
        if (result.status === 'complete') {
          await setSignUpActive!({ session: result.createdSessionId });
          router.replace('/(auth)/jobseeker-onboarding');
        } else if (result.status === 'missing_requirements') {
          Alert.alert('Verify Email', 'Please check your email for a verification link.');
        }
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage || e.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const startFn = provider === 'google' ? startGoogleOAuth : startGitHubOAuth;
      const { createdSessionId, setActive } = await startFn!({ redirectUrl: AuthSession.makeRedirectUri() });
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace('/(auth)/jobseeker-onboarding');
      }
    } catch (e: any) {
      setError(e.message || 'OAuth failed');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'signin' ? 'Sign in to find your next role' : 'Start your job search journey'}
      </Text>

      {mode === 'signup' && (
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
      )}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailAuth} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuth('google')}>
        <Text style={styles.socialBtnText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuth('github')}>
        <Text style={styles.socialBtnText}>Continue with GitHub</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
        <Text style={styles.switchText}>
          {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 20, padding: spacing.sm },
  backText: { fontSize: 16, color: colors.primary },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    fontSize: 16, color: colors.text, marginBottom: spacing.md,
  },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.sm },
  primaryBtn: {
    backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.sm,
  },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.md, color: colors.textTertiary, fontSize: 14 },
  socialBtn: {
    paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', marginBottom: spacing.sm,
  },
  socialBtnText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  switchText: { textAlign: 'center', marginTop: spacing.lg, color: colors.primary, fontSize: 14 },
});
