import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Line, Rect } from 'react-native-svg';
import { AIVisionService } from '../lib/aiVisionService';
import { NGJYRAT } from '../theme/colors';

export default function AIRoomPlannerScreen() {
  const [imazhi, setImazhi] = useState<string | null>(null);
  const [plani, setPlani] = useState<any>(null);
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);

  const merrImazh = async () => {
    const rez = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true });
    if (!rez.canceled) {
      setImazhi(rez.assets[0].uri);
      gjeneroPlanin(rez.assets[0].base64!);
    }
  };

  const gjeneroPlanin = async (base64: string) => {
    setDuke_ngarkuar(true);
    try {
      const data = await AIVisionService.skanoDhomen(base64);
      setPlani(data);
    } catch (e) {
      Alert.alert('Gabim', 'AI nuk mundi të procesonte skanimin.');
    } finally {
      setDuke_ngarkuar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulli}>AI Room Planner</Text>

      {!imazhi ? (
        <TouchableOpacity style={styles.scanBtn} onPress={merrImazh}>
          <Text style={styles.scanBtnText}>📸 Skeno Dhomën</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Image source={{ uri: imazhi }} style={styles.preview} />

          {duke_ngarkuar && <Text style={styles.loading}>⌛ AI po gjeneron planimetrinë...</Text>}

          {plani && (
            <View style={styles.rezultati}>
              <Text style={styles.subTitulli}>Planimetria e Sugjeruar</Text>
              <Svg height="300" width="100%" viewBox="0 0 100 100" style={styles.svg}>
                {/* Vizatimi i mureve nga AI */}
                <Rect x="10" y="10" width="80" height="80" stroke={NGJYRAT.primare} strokeWidth="2" fill="none" />
                <Line x1="10" y1="10" x2="90" y2="90" stroke="#333" strokeWidth="1" />
              </Svg>
              <Text style={styles.kosto}>
                Dimensionet: {plani.dimensionet_afersisht.gjeresi}m x {plani.dimensionet_afersisht.gjatesi}m
              </Text>
              <View style={{ marginTop: 10 }}>
                {plani.sygjerime_dizajni.map((s: string, i: number) => (
                  <Text key={i} style={{ color: '#fff', fontSize: 14, marginBottom: 5 }}>• {s}</Text>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 24, fontWeight: '900', color: NGJYRAT.primare, textAlign: 'center', marginVertical: 20 },
  scanBtn: { backgroundColor: NGJYRAT.primare, padding: 20, borderRadius: 15, alignSelf: 'center', marginTop: 100 },
  scanBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  preview: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20 },
  loading: { color: '#fff', textAlign: 'center', fontSize: 16 },
  rezultati: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 15 },
  subTitulli: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  svg: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15 },
  kosto: { color: NGJYRAT.primare, fontSize: 20, fontWeight: '900', textAlign: 'center' }
});
