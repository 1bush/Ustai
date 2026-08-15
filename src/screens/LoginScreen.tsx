import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { normalizoTelefonin } from '../lib/phone';
import { pb } from '../lib/pocketbase';
import { checkRateLimit, resetRateLimit, getRateLimitState } from '../lib/rateLimit';
import { validatePhone } from '@/lib/validators';

export default function LoginScreen({ navigation }: any) {
  const [tel, setTel] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [lastAppState, setLastAppState] = useState<AppStateStatus | null>(null);

  useEffect(() => {
    initRateLimit();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      setLastAppState(state);
    });
    return () => appStateSubscription.remove();
  }, []);

  const initRateLimit = async () => {
    const state = await getRateLimitState(tel);
    setIsLocked(state.locked);
    setLockoutTime(state.remainingTimeMinutes * 60);
    if (state.locked && state.remainingTimeMinutes > 0) {
      setTimerRunning(true);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          const newCountdown = prev - 1;
          if (newCountdown <= 0) {
            clearInterval(interval);
            setTimerRunning(false);
            setIsLocked(false);
            setLockoutTime(0);
            resetRateLimit(tel);
            return 0;
          }
          return newCountdown;
        });
      }, 1000);
    }
  };

  /** Handle Google login */
  const handleGoogleLogin = async () => {
    if (isLocked || isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
            const authData = await (pb.collection('users') as any).authWithOAuth(
        'google',
        {
          redirect: false,
        }
      );
      // Handle the OAuth response - in a real app, this would involve
      // completing the OAuth flow with the code returned
      console.log('Google auth started:', authData);
      setIsGoogleLoading(false);
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Gabim', error.message || 'Ka ndodhur një shifte të pavlefshme.');
      setIsGoogleLoading(false);
    }
  };

  /** Handle Apple login */
  const handleAppleLogin = async () => {
    if (isLocked || isAppleLoading) return;
    setIsAppleLoading(true);
    try {
      // Apple requires a different OAuth flow; for now, show info
      Alert.alert('Informacion', 'Hyrja me Apple duhet konfigituarë me App ID dhe Service ID. Mund të përdorni hyrje në telefonin e telefonoit.');
      setIsAppleLoading(false);
    } catch (error: any) {
      console.error('Apple login error:', error);
      Alert.alert('Gabim', error.message || 'Ka ndodhur një shifte të pavlefshme.');
            setIsAppleLoading(false);
    }
  };

  const vazhdoMeTelefon = async () => {
    const telPastruar = normalizoTelefonin(tel);
    if (!telPastruar || !validatePhone(tel)) {
      setPhoneError('Ju lutem jepni një numër telefoni të vlefshëm shqiptar (p.sh. 06X XXX XXX).');
      return;
    }
    setPhoneError(null);

    // Check rate limit before proceeding
    const rateLimitState = await checkRateLimit(telPastruar, pb);
    
    if (!rateLimitState.allowed) {
      setIsLocked(true);
      setLockoutTime(rateLimitState.lockoutRemaining * 60);
      setTimerRunning(true);
      setCountdown(rateLimitState.lockoutRemaining * 60);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          const newCountdown = prev - 1;
          if (newCountdown <= 0) {
            clearInterval(interval);
            setTimerRunning(false);
            setIsLocked(false);
            setLockoutTime(0);
            resetRateLimit(telPastruar);
            return 0;
          }
          return newCountdown;
        });
      }, 1000);
      
      Alert.alert('Llogara e blokejuara', 'Akunti juaj është blokuara. Të shtypni përsëritje më poshtë po nënshmërtoset uku 15 minute.');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user exists in PocketBase
      const collection = await pb.collection('users').getFullList({
        filter: `tel = "${telPastruar}"`,
      });

      if (collection.length > 0) {
        // User exists, send OTP
        // PocketBase will send OTP automatically
        navigation.navigate('VerifikoOTP', { tel: telPastruar, roli: null });
      } else {
        // User doesn't exist, show error
        Alert.alert('Gabim', 'Ju nuk keni llogari në sistem. Mund të regjistroni paraqtore.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Record failed attempt
      await resetRateLimit(telPastruar);
      
      if (error.status === 404) {
        Alert.alert('Gabim', 'Numri i telefonit nuk nështetit në sistem.');
      } else if (error.message) {
        Alert.alert('Gabim', error.message);
      } else {
        Alert.alert('Gabim', 'Ka ndodhur një shifte të pavlefshme. Tërheqeni përsëri.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Hyr në llogari</Text>
          <Text style={styles.subtitle}>Përdor numrin tënd të telefonit për t'u kyçur</Text>

          {/* Rate Limit Status */}
          {isLocked && (
            <View style={styles.lockoutWarning}>
              <Text style={styles.lockoutText}>Llogara e blokuara</Text>
              <Text style={{ color: NGJYRAT.primare, fontSize: 12, marginTop: 4 }}>
                retry in {Math.ceil(countdown / 60)} minute{(countdown / 60) !== 1 ? 'e' : ''}
              </Text>
            </View>
          )}

          {/* Social Login Buttons */}
          {!isLocked && !isLoading && (
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
                <Image source={require('../assets/google.png')} style={{ width: 20, height: 20, marginRight: 12 }} />
                <Text style={styles.googleBtnText}>Hyr me Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.appleBtn} onPress={handleAppleLogin}>
                <Image source={require('../assets/apple.png')} style={{ width: 20, height: 20, marginRight: 12 }} />
                <Text style={styles.appleBtnText}>Hyr me Apple</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Numri i telefonit</Text>
            <TextInput
                            style={[styles.input, phoneError ? styles.inputError : undefined]}
              placeholder="06X XXX XXXX"
              placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
              keyboardType="phone-pad"
              value={tel}
                            onChangeText={(t) => { setTel(t); setPhoneError(null); }}
            />
            {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
          </View>

          <TouchableOpacity style={styles.btn} onPress={vazhdoMeTelefon} disabled={isLocked || isLoading}>
                        <Text style={styles.btnText}>{isLoading ? <ActivityIndicator color="#fff" size="small" /> : 'Vazhdo'}</Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Start')}
            disabled={isLocked || isLoading}
          >
            <Text style={styles.linkText}>Kthehu te fillimi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: NGJYRAT.tekstiZbehur, marginBottom: 32 },
  inputContainer: { marginBottom: 24 },
  label: { color: '#fff', marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 16, borderRadius: 12, fontSize: 18 },
  inputError: { borderColor: NGJYRAT.gabim, borderWidth: 1 },
  errorText: { color: NGJYRAT.gabim, fontSize: 12, marginTop: 6, marginLeft: 4 },
  btn: { 
    backgroundColor: NGJYRAT.primare, 
    padding: 18, 
    borderRadius: 12, 
    marginTop: 10,
    alignItems: 'center'
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
  linkBtn: { marginTop: 20, padding: 10, alignItems: 'center' },
  linkText: { color: NGJYRAT.primare, textAlign: 'center', fontSize: 16, fontWeight: '600' },
  lockoutWarning: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  lockoutText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  googleBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 15,
  },
  appleBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  googleBtnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  appleBtnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});