import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { normalizoTelefonin } from '../lib/phone';

export default function LoginScreen({ navigation }: any) {
  const [tel, setTel] = useState('');

  const vazhdoMeTelefon = () => {
    const telPastruar = normalizoTelefonin(tel);
    if (!telPastruar) {
      Alert.alert('Gabim', 'Ju lutem jepni një numër telefoni të vlefshëm shqiptar (p.sh. 06X XXX XXXX).');
      return;
    }
    navigation.navigate('VerifikoOTP', { tel: telPastruar, roli: null }); // roli null = login, jo regjistrim i ri
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Hyr në llogari</Text>
          <Text style={styles.subtitle}>Përdor numrin tënd të telefonit për t'u kyçur</Text>

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

          <TouchableOpacity style={styles.btn} onPress={vazhdoMeTelefon}>
            <Text style={styles.btnText}>Vazhdo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Start')}
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
  btn: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
  linkBtn: { marginTop: 20, padding: 10 },
  linkText: { color: NGJYRAT.primare, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});