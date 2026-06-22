import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import { useEmployerAuth } from '../../src/components/EmployerAuthProvider';

export default function EmployerAuth() {
  const router = useRouter();
  const { signIn, signUp, isLoading: authLoading } = useEmployerAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) { setError('Email and password required'); return; }
    if (mode === 'signup' && !name) { setError('Full name required'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) { setError(err); return; }
        router.replace('/(auth)/employer-onboarding');
      } else {
        const { error: err, session } = await signUp(email, password, name);
        if (err) { setError(err); return; }
        if (session) router.replace('/(auth)/employer-onboarding');
        else setError('Check your email for confirmation link');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{mode === 'signin' ? 'Employer Sign In' : 'Create Employer Account'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'signin' ? 'Access your hiring dashboard' : 'Register your company to hire'}
      </Text>

      {mode === 'signup' && (
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
      )}
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={loading || authLoading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
        <Text style={styles.switchText}>
          {mode === 'signin' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
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
    backgroundColor: colors.secondary, paddingVertical: 16, borderRadius: borderRadius.md,
    alignItems: 'center', marginTop: spacing.sm,
  },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  switchText: { textAlign: 'center', marginTop: spacing.lg, color: colors.primary, fontSize: 14 },
});
