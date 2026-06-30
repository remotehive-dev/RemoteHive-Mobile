import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, PhoneAuthProvider, signInWithCredential } from '../lib/firebase';
import { colors, spacing, borderRadius } from '../theme';

type Props = {
  onVerified: (phone: string, countryCode: string) => void;
};

export default function PhoneVerification({ onVerified }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  const startTimer = () => {
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 7) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    setError('');
    try {
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(`${countryCode}${phone}`, undefined!);
      setVerificationId(id);
      setStep('otp');
      startTimer();
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
      await signInWithCredential(auth, credential);
      onVerified(phone, countryCode);
    } catch (e: any) {
      setError(e.message || 'Invalid code. Try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Phone Verification</Text>
      <Text style={styles.subheader}>Enter your phone number to receive a verification code via SMS.</Text>

      {step === 'phone' ? (
        <>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.countryPicker}>
              <Text style={styles.countryText}>{countryCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={15}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.otpInfo}>Enter the code sent to {countryCode} {phone}</Text>
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resendBtn, timer > 0 && { opacity: 0.5 }]}
            onPress={handleSendOtp}
            disabled={timer > 0}
          >
            <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  header: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subheader: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countryPicker: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  countryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  input: { backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, fontSize: 16, color: colors.text },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '700' },
  button: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.xs },
  otpInfo: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' },
  resendBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  resendText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  resendTextDisabled: { color: colors.textTertiary },
});
