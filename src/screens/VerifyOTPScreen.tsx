import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { pb } from '../lib/pocketbase';

export default function VerifyOTPScreen({ navigation, route }: any) {
  const [kod, setKod] = useState('');
  const [refKod, setRefKod] = useState('');
  const [dukeVerifikuar, setDukeVerifikuar] = useState(false);
  const [sekonda, setSekonda] = useState(60);
  const { tel, roli } = route?.params ?? {};
  const dukeUkycur = !roli;

  useEffect(() => {
    if (sekonda <= 0) return;
    const timer = setInterval(() => setSekonda(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [sekonda]);

  const verifiko = async () => {
    if (kod.length < 4) {
      Alert.alert('Gabim', 'Shkruani kodin 4-shifror.');
      return;
    }

    // Serveri PocketBase eshte HEQUR — verifikim lokal (mock).
    // Pa password test, pa kode speciale. Cdo kod 4-shifror pranohet.
    setDukeVerifikuar(true);

    try {
      const username = String(tel || '').replace(/\D/g, '');
      if (!username) {
        setDukeVerifikuar(false);
        Alert.alert('Gabim', 'Nuk u dha numri i telefonit. Kthehu dhe fillo nga e para.');
        return;
      }
      pb.authStore.save('mock-token', {
        id: 'mock-' + username,
        username,
        role: roli || 'klient',
        emri: 'Perdorues ' + username.slice(-4),
        telefon: tel,
      } as any);

      if ((roli || 'klient') === 'ustai') {
        navigation.reset({ index: 0, routes: [{ name: 'ZgjidhKategori' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'FaqjaKlientit' }] });
      }
    } catch (error: any) {
      Alert.alert('Gabim teknik', error.message || 'Dicka shkoi keq.');
    } finally {
      setDukeVerifikuar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verifiko numrin</Text>
        <Text style={styles.subtitle}>
          {dukeUkycur ? 'Hyr ne llogarine tende' : 'Kodi u dergua te ' + tel}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="0000"
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          keyboardType="number-pad"
          maxLength={4}
          value={kod}
          onChangeText={setKod}
          editable={!dukeVerifikuar}
        />
        {!dukeUkycur && (
          <View>
            <Text style={[styles.label, { marginBottom: 10, textAlign: 'center' }]}>Kodi i referimit (opsionale)</Text>
            <TextInput
              style={[styles.inputRef]}
              placeholder="KODI123"
              placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
              autoCapitalize="characters"
              value={refKod}
              onChangeText={setRefKod}
              editable={!dukeVerifikuar}
            />
          </View>
        )}
        <TouchableOpacity style={[styles.btn, dukeVerifikuar && { opacity: 0.7 }]} onPress={verifiko} disabled={dukeVerifikuar}>
          {dukeVerifikuar ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{dukeUkycur ? 'Hyr' : 'Verifiko'}</Text>}
        </TouchableOpacity>
        {sekonda > 0 ? (
          <Text style={styles.timerText}>Ridergo kodin pas {sekonda} sekondash</Text>
        ) : (
          <TouchableOpacity onPress={() => { setSekonda(60); Alert.alert('Kodi u dergua', 'Kodi i ri eshte derguar te ' + tel); }}>
            <Text style={styles.ridergoText}>Ridergo kodin</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: NGJYRAT.tekstiZbehur, marginBottom: 32 },
  input: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 16, borderRadius: 12, fontSize: 32, textAlign: 'center', letterSpacing: 12, marginBottom: 24, height: 70 },
  inputRef: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 16, borderRadius: 12, fontSize: 18, letterSpacing: 2, marginBottom: 30, textAlign: 'center' },
  btn: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, height: 60, justifyContent: 'center' },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
  label: { color: '#fff', marginBottom: 8, fontWeight: '600' },
  timerText: { color: NGJYRAT.tekstiZbehur, textAlign: 'center', marginTop: 20, fontSize: 14 },
  ridergoText: { color: NGJYRAT.primare, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '700' },
});
