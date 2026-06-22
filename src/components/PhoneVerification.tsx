import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

type Props = {
  onVerified: (phone: string, countryCode: string) => void;
};

const COUNTRY_CODES = [{ code: '+91', label: 'IN' }, { code: '+1', label: 'US' }, { code: '+44', label: 'UK' }];

export default function PhoneVerification({ onVerified }: Props) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  const startTimer = () => {
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 7) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    setError('');
    
    // Validate phone via RapidAPI first
    try {
      const validateRes = await fetch(`https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp?number=${phone}&country=${countryCode.replace('+', '')}`, {
        headers: {
          'x-rapidapi-key': '78006bf87amsh5f51ac5ed6578e7p1b3f42jsneb267075601b',
          'x-rapidapi-host': 'phonenumbervalidatefree.p.rapidapi.com',
        },
      });
      const validateData = await validateRes.json();
      if (!validateData.valid && validateData.valid !== 'true') {
        setError('Invalid phone number. Please check and try again.');
        setLoading(false);
        return;
      }
    } catch {
      // Continue even if validation fails (network issues)
    }
    
    const otpVal = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpVal);
    
    // Send OTP via Django backend
    try {
      const res = await fetch(`https://admin.remotehive.in/api/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp: otpVal }),
      });
      if (!res.ok) {
        setError('Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
      return;
    }
    
    setStep('otp');
    setLoading(false);
    startTimer();
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      onVerified(phone, countryCode);
    } else {
      setError('Invalid OTP. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Phone Verification Required</Text>
      <Text style={styles.subheader}>We need to verify your phone number to keep your account secure.</Text>
      
      {step === 'phone' ? (
        <>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.countryPicker}>
              <Text style={styles.countryText}>{countryCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.phoneInput]}
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
          <Text style={styles.otpInfo}>Enter the 6-digit code sent to {countryCode} {phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resendBtn, timer > 0 && styles.resendBtnDisabled]}
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
  countryPicker: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  phoneInput: { flex: 1 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.xs },
  otpInfo: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  resendBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  resendBtnDisabled: { opacity: 0.5 },
  resendText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  resendTextDisabled: { color: colors.textTertiary },
});
