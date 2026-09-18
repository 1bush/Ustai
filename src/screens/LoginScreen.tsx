import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { normalizoTelefonin } from '../lib/phone';
import { pb } from '../lib/pocketbase';
import { checkRateLimit, resetRateLimit } from '../lib/rateLimit';
import { validatePhone } from '@/lib/validators';

export default function LoginScreen({ navigation }: any) {
  const [tel, setTel] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  /** Handle Google login */
  const handleGoogleLogin = async () => {
    if (isLocked || isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      // Përdorim metodën e thjeshtë për të hapur dritaren e OAuth
      const authData = await pb.collection('users').authWithOAuth({
        provider: 'google'
      });

      if (authData && authData.record) {
        const user = authData.record;

        try {
          await pb.collection('profiles').getOne(user.id);
        } catch (e) {
          // Krijojmë profilin default nëse nuk ekziston
          await pb.collection('profiles').create({
            id: user.id,
            user_id: user.id,
            role: 'klient',
            rating: 5.0,
            points: 100,
            telefon: '', // Do të plotësohet më vonë nga përdoruesi
            referral_code: user.id.slice(-6).toUpperCase(),
            emri: user.name || 'Përdorues Google'
          });
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'FaqjaKlientit' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Gabim', 'Hyrja me Google dështoi.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /** Handle Apple login */
  const handleAppleLogin = async () => {
    if (isLocked || isAppleLoading) return;
    setIsAppleLoading(true);
    try {
      // Apple requires a different OAuth flow; for now, show info
      Alert.alert('Informacion', 'Hyrja me Apple duhet konfiguruar me App ID dhe Service ID. Mund të përdorni hyrje me numrin e telefosit.');
      setIsAppleLoading(false);
    } catch (error: any) {
      Alert.alert('Gabim', error.message || 'Ka ndodhur një gabim të pavlefshëm.');
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

    setIsLoading(true);
    try {
      // Rate-limit lokal (pa server) — bllokohet pas 5 tentativash.
      const { allowed, lockoutRemaining } = await checkRateLimit(telPastruar, null);
      if (!allowed) {
        const min = Math.max(1, Math.ceil(lockoutRemaining));
        setIsLocked(true);
        Alert.alert('Llogaria e bllokuar', `Provoni përsëri pas ${min} minutash.`);
        return;
      }
      // Mbushet authStore me një mock user që të punojë navigimi
      pb.authStore.save('mock-token', {
        id: 'mock-user-id',
        username: telPastruar.replace(/\D/g, ''),
        role: 'klient' // Default për login nese nuk dihet
      } as any);
      await resetRateLimit(telPastruar);

      Alert.alert('Sukses', 'Hyrja e suksesshme (Test Mode)...', [
        {
          text: 'Vazhdo',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'FaqjaKlientit' }],
            });
          }
        }
      ]);
    } catch (error) {
      // Gabim i heshtur — navigimi vazhdon me mock sesion.
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
              <Text style={styles.lockoutText}>Llogaria e bllokuar — provoni më vonë.</Text>
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