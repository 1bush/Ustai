import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AIVisionService } from '../lib/aiVisionService';
import { NGJYRAT } from '../theme/colors';

export default function AIPreventivScreen() {
  const [imazhi, setImazhi] = useState<string | null>(null);
  const [pershkrimi, setPershkrimi] = useState('');
  const [preventivi, setPreventivi] = useState<any>(null);
  const [ngarkim, setNgarkim] = useState(false);

  const zgjidhImazh = async () => {
    const rez = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });
    if (!rez.canceled) {
      setImazhi(rez.assets[0].uri);
      analizo(rez.assets[0].base64!);
    }
  };

  const analizo = async (base64: string) => {
    setNgarkim(true);
    try {
      const data = await AIVisionService.gjeneroPreventiv(base64, pershkrimi);
      setPreventivi(data);
    } catch (e) {
      Alert.alert('Gabim', 'AI dështoi në gjenerimin e preventivit.');
    } finally {
      setNgarkim(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.titulli}>AI Preventivi</Text>
        <Text style={styles.pershkrimi}>Ngarko një foto të hapësirës për të marrë një listë materialesh dhe kosto të vlerësuar.</Text>

        <TextInput
          style={styles.inputPershkrim}
          placeholder="Përshkruani punën (psh: Lyerje muresh, shtrim pllakash...)"
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          value={pershkrimi}
          onChangeText={setPershkrimi}
          multiline
        />

        {!imazhi ? (
          <TouchableOpacity style={styles.shkrepBtn} onPress={zgjidhImazh}>
            <Text style={styles.shkrepTekst}>📁 Ngarko Foto</Text>
          </TouchableOpacity>
        ) : (
          <Image source={{ uri: imazhi }} style={styles.foto} />
        )}

        {ngarkim && <Text style={styles.status}>⌛ Duke llogaritur...</Text>}

        {preventivi && (
          <View style={styles.rezView}>
            <Text style={styles.subTitulli}>Materialet e Nevojshme</Text>
            {preventivi.materialet.map((m: any, i: number) => (
              <View key={i} style={styles.mItem}>
                <Text style={styles.mEmri}>{m.emri} ({m.sasia})</Text>
                <Text style={styles.mKosto}>{m.kosto_afersisht} Lek</Text>
              </View>
            ))}
            <View style={styles.footer}>
              <Text style={styles.totali}>Punë dore: {preventivi.puna_dore} Lek</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 26, fontWeight: '900', color: NGJYRAT.primare, marginBottom: 10 },
  inputPershkrim: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: NGJYRAT.kufiri, textAlignVertical: 'top', height: 80 },
  pershkrimi: { color: NGJYRAT.tekstiZbehur, marginBottom: 20 },
  shkrepBtn: { backgroundColor: NGJYRAT.primare, padding: 20, borderRadius: 15, alignItems: 'center' },
  shkrepTekst: { color: '#fff', fontSize: 18, fontWeight: '800' },
  foto: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
  status: { color: '#fff', textAlign: 'center', marginTop: 10 },
  rezView: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 15 },
  subTitulli: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  mItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  mEmri: { color: '#fff' },
  mKosto: { color: NGJYRAT.primare, fontWeight: '700' },
  footer: { marginTop: 15, paddingTop: 15, borderTopWidth: 2, borderTopColor: NGJYRAT.primare },
  totali: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
