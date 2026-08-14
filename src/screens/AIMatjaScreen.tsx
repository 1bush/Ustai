import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AIVisionService } from '../lib/aiVisionService';
import { NGJYRAT } from '../theme/colors';

export default function AIMatjaScreen() {
  const [imazhi, setImazhi] = useState<string | null>(null);
  const [base64, setBase64] = useState<string>('');
  const [referim, setReferim] = useState('');
  const [rezultati, setRezultati] = useState<any>(null);
  const [ngarkim, setNgarkim] = useState(false);

  const zgjidhImazh = async (ngaKamera: boolean) => {
    const opsionet: any = { quality: 0.7, base64: true };
    const rez = ngaKamera
      ? await ImagePicker.launchCameraAsync(opsionet)
      : await ImagePicker.launchImageLibraryAsync(opsionet);
    if (!rez.canceled) {
      setImazhi(rez.assets[0].uri);
      setBase64(rez.assets[0].base64!);
      setRezultati(null);
    }
  };

  const analizo = async () => {
    if (!base64) {
      Alert.alert('Gabim', 'Zgjidhni nje foto te planimetrise.');
      return;
    }
    setNgarkim(true);
    try {
      const data = await AIVisionService.matHapesiren(base64, referim);
      setRezultati(data);
    } catch (e) {
      Alert.alert('Gabim', 'AI deshtoi ne matjen e hapesires.');
    } finally {
      setNgarkim(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.titulli}>Matje me AI</Text>
        <Text style={styles.pershkrimi}>
          Ngarko nje foto te planimetrise (panimetria) dhe AI do te llogarise siperfaqjen ne m2, dimensionet e mureve dhe perimetrin.
        </Text>

        <TextInput
          style={styles.inputReferim}
          placeholder="Dimension referimi (opsional, psh: muri i gjate 5m)"
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          value={referim}
          onChangeText={setReferim}
        />

        <View style={styles.btnRresht}>
          <TouchableOpacity style={[styles.btn, { flex: 1, marginRight: 5 }]} onPress={() => zgjidhImazh(false)}>
            <Text style={styles.btnTekst}>Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { flex: 1, marginLeft: 5 }]} onPress={() => zgjidhImazh(true)}>
            <Text style={styles.btnTekst}>Kamera</Text>
          </TouchableOpacity>
        </View>

        {imazhi && <Image source={{ uri: imazhi }} style={styles.foto} />}

        {imazhi && !rezultati && (
          <TouchableOpacity style={styles.btnLlogarit} onPress={analizo} disabled={ngarkim}>
            <Text style={styles.btnTekst}>{ngarkim ? 'Duke llogaritur...' : 'Llogarit m2'}</Text>
          </TouchableOpacity>
        )}

        {ngarkim && (
          <View style={styles.ngarkimView}>
            <Text style={styles.ngarkimTekst}>AI duke analizuar planimetrine...</Text>
          </View>
        )}

        {rezultati && (
          <View style={styles.rezView}>
            <Text style={styles.subTitulli}>Rezultatet e Matjes</Text>

            <View style={styles.rreshtInfo}>
              <Text style={styles.label}>Lloji:</Text>
              <Text style={styles.vlera}>{rezultati.lloji_hapesires}</Text>
            </View>
            <View style={styles.rreshtInfo}>
              <Text style={styles.label}>Forma:</Text>
              <Text style={styles.vlera}>{rezultati.forma}</Text>
            </View>

            <View style={styles.ndarese} />

            <Text style={styles.subSubTitulli}>Dimensionet e Mureve</Text>
            {rezultati.dimensionet_m?.map((d: any, i: number) => (
              <View key={i} style={styles.dimRresht}>
                <Text style={styles.murEmri}>{d.muri}</Text>
                <Text style={styles.murVlera}>{d.gjatesia_m} m</Text>
              </View>
            ))}

            <View style={styles.ndarese} />

            <View style={styles.totaliView}>
              <Text style={styles.totaliLabel}>Siperfaqja:</Text>
              <Text style={styles.totaliVlera}>{rezultati.siperfaqja_m2} m2</Text>
            </View>
            <View style={styles.totaliView}>
              <Text style={styles.totaliLabel}>Perimetri:</Text>
              <Text style={styles.totaliVlera}>{rezultati.perimetri_m} m</Text>
            </View>

            {rezultati.zgjedhje_murale && (
              <View style={styles.muralView}>
                <Text style={styles.muralLabel}>Sugjerim:</Text>
                <Text style={styles.muralVlera}>{rezultati.zgjedhje_murale}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 28, fontWeight: '900', color: NGJYRAT.primare, marginBottom: 10 },
  pershkrimi: { color: NGJYRAT.tekstiZbehur, marginBottom: 20, lineHeight: 22 },
  inputReferim: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  btnRresht: { flexDirection: 'row', marginBottom: 20 },
  btn: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: NGJYRAT.kufiri },
  btnTekst: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnLlogarit: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  foto: { width: '100%', height: 220, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  ngarkimView: { padding: 30, alignItems: 'center' },
  ngarkimTekst: { color: NGJYRAT.primare, fontSize: 16 },
  rezView: { backgroundColor: NGJYRAT.sfondiKarte, padding: 18, borderRadius: 15, marginTop: 15 },
  subTitulli: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 15 },
  subSubTitulli: { color: NGJYRAT.tekstiZbehur, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  rreshtInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { color: NGJYRAT.tekstiZbehur, fontSize: 15 },
  vlera: { color: '#fff', fontWeight: '700' },
  ndarese: { height: 1, backgroundColor: NGJYRAT.kufiri, marginVertical: 12 },
  dimRresht: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: 10, borderLeftWidth: 3, borderLeftColor: NGJYRAT.primare, marginBottom: 4 },
  murEmri: { color: '#fff', fontSize: 14 },
  murVlera: { color: NGJYRAT.primare, fontWeight: '700' },
  totaliView: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totaliLabel: { color: '#fff', fontSize: 18, fontWeight: '700' },
  totaliVlera: { color: NGJYRAT.primare, fontSize: 22, fontWeight: '900' },
  muralView: { marginTop: 12, padding: 12, backgroundColor: NGJYRAT.sfondi, borderRadius: 10 },
  muralLabel: { color: NGJYRAT.tekstiZbehur, fontSize: 13, marginBottom: 4 },
  muralVlera: { color: '#fff', fontSize: 15 },
});
