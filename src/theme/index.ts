export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  inputBg: '#F1F5F9',
  indigo: {
    light: '#EEF2FF',
    main: '#6366F1',
    dark: '#4338CA',
  },
  purple: {
    light: '#FAF5FF',
    main: '#A855F7',
    dark: '#7E22CE',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 22, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, color: colors.text },
  bodySmall: { fontSize: 14, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textTertiary },
};
