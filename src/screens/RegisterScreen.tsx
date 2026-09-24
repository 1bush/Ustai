import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { normalizoTelefonin } from '../lib/phone';
import { pb } from '../lib/pocketbase';

export default function RegisterScreen({ navigation, route }: any) {
  const [tel, setTel] = useState('');
  const roli = route.params?.roli || 'klient';

  const nisVerifikimin = async () => {
    const telPastruar = normalizoTelefonin(tel);
    if (!telPastruar) {
      Alert.alert('Gabim', 'Ju lutem jepni një numër telefoni të vlefshëm shqiptar.');
      return;
    }

    // Mock lokal pa server — krijohet sesion testues.
    try {
      // Kjo është thjesht për të mbushur authStore në memorie që ekranet pasardhëse të mos crashen
      pb.authStore.save('mock-token', {
        id: 'mock-user-id',
        username: telPastruar.replace(/\D/g, ''),
        role: roli
      } as any);
    } catch (error) {
      console.warn('Ruajtja e sesionit të regjistrimit dështoi.', error);
      Alert.alert('Gabim', 'Nuk u arrit të ruhej sesioni. Provo përsëri.');
      return;
    }

    Alert.alert('Sukses', 'Po hyni në sistem (Test Mode)...', [
      {
        text: 'Vazhdo',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: roli === 'ustai' ? 'ZgjidhKategori' : 'FaqjaKlientit' }],
          });
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Mirësevini</Text>
          <Text style={styles.subtitle}>Ju po regjistroheni si {roli === 'ustai' ? 'Ustai' : 'Klient'}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Numri i telefonit</Text>
            <TextInput
              style={styles.input}
              placeholder="06X XXX XXXX"
              placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
              keyboardType="phone-pad"
              value={tel}
              onChangeText={setTel}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={nisVerifikimin}>
            <Text style={styles.btnText}>Vazhdo</Text>
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
  btn: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
});
