import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { colors } from '../src/theme';
import { getSupabase } from '../src/lib/supabase';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (!clerkLoaded) return;

    const redirect = async () => {
      await new Promise(r => setTimeout(r, 2500));

      try {
        if (clerkSignedIn && clerkUser) {
          const token = await getToken({ template: 'supabase' });
          const supabase = getSupabase(token || undefined);
          const { data: profile } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUser.id)
            .maybeSingle();
          router.replace(profile ? '/(jobseeker)' : '/(auth)/jobseeker-onboarding');
          return;
        }
      } catch (e) {
        console.error('Auth check failed', e);
      }
      router.replace('/(auth)/role-select');
    };
    redirect();
  }, [clerkLoaded, clerkSignedIn, clerkUser]);

  const slideUpStyle = { transform: [{ translateY: slideUp }] };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Image source={require('../assets/logo-original.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      
      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        RemoteHive
      </Animated.Text>
      
      <Animated.View style={[styles.taglineWrap, slideUpStyle, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>Find Your Dream Remote Job</Text>
        <Text style={styles.subtagline}>Worldwide talent, borderless opportunities</Text>
      </Animated.View>

      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: { width: 140, height: 100 },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: colors.white,
    letterSpacing: 1,
  },
  taglineWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    opacity: 0.95,
  },
  subtagline: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.7,
    marginTop: 4,
  },
  loaderWrap: {
    position: 'absolute',
    bottom: 80,
  },
});
