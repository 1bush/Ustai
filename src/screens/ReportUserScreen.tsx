import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

/**
 * Raportimi i një përdoruesi.
 *
 * Krijon një rekord në koleksionin `reports` me status `ne_pritje`, të cilin
 * paneli admin (`admin-dashboard/index.html`) e liston dhe e mbyll me `zgjidhur`.
 */

const ARSYET = [
  { kyci: 'sjellje', etiketa: '😠 Sjellje e papërshtatshme' },
  { kyci: 'mashtrim', etiketa: '🚫 Mundësi mashtrimi' },
  { kyci: 'cilesi', etiketa: '🛠️ Cilësi e dobët e punës' },
  { kyci: 'pagese', etiketa: '💸 Problem me pagesën' },
  { kyci: 'tjeter', etiketa: '❔ Tjetër' },
] as const;

export default function ReportUserScreen({ route, navigation }: any) {
  const raportuarId = route?.params?.raportuarId;
  const jobId = route?.params?.jobId ?? '';
  const [arsyeja, setArsyeja] = useState<string>(ARSYET[0].kyci);
  const [pershkrimi, setPershkrimi] = useState('');
  const [dukeDerguar, setDukeDerguar] = useState(false);

  const dergo = async () => {
    const user = pb.authStore.model;
    if (!user) {
      Alert.alert('Pa sesion', 'Duhet të hysh përsëri për të raportuar.');
      return;
    }
    if (pershkrimi.trim().length < 10) {
      Alert.alert('Përshkrim i shkurtër', 'Shkruaj të paktën 10 karaktere, që admini ta kuptojë problemin.');
      return;
    }

    setDukeDerguar(true);
    try {
      await pb.collection('reports').create({
        reporter_id: user.id,
        raportuar_id: raportuarId ?? '',
        job_id: jobId,
        arsyeja,
        pershkrimi: pershkrimi.trim(),
        status: 'ne_pritje',
      });
      Alert.alert('Raportimi u dërgua', 'Admini do ta shqyrtojë raportimin.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (error) {
      console.warn('Raportimi nuk u dërgua.', error);
      Alert.alert('Gabim', 'Raportimi nuk u dërgua. Provo përsëri.');
    } finally {
      setDukeDerguar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.permbanjtja}>
        <Text style={styles.titulli}>🚩 Raporto përdorues</Text>
        <Text style={styles.nenTitulli}>
          Raportimi shkon te ekipi i moderimit. Keqpërdorimi i raportimit sjell bllokim.
        </Text>

        <Text style={styles.etiketat}>Arsyeja</Text>
        {ARSYET.map((a) => (
          <TouchableOpacity
            key={a.kyci}
            style={[styles.opsioni, arsyeja === a.kyci && styles.opsioniZgjedhur]}
            onPress={() => setArsyeja(a.kyci)}
          >
            <Text style={arsyeja === a.kyci ? styles.tekstiZgjedhur : styles.teksti}>{a.etiketa}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.etiketat}>Çfarë ndodhi?</Text>
        <TextInput
          style={styles.fusha}
          value={pershkrimi}
          onChangeText={setPershkrimi}
          placeholder="Përshkruaj shkurt problemin..."
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.butoniKryesor} onPress={dergo} disabled={dukeDerguar}>
          {dukeDerguar ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.tekstiKryesor}>Dërgo raportimin</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.kthehuBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.kthehuTeksti}>Kthehu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  permbanjtja: { padding: 16, paddingBottom: 40 },
  titulli: { fontSize: 22, fontWeight: '800', color: NGJYRAT.teksti },
  nenTitulli: { color: NGJYRAT.tekstiZbehur, fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 19 },
  etiketat: { color: NGJYRAT.teksti, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  opsioni: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri, marginBottom: 8 },
  opsioniZgjedhur: { backgroundColor: NGJYRAT.primare, borderColor: NGJYRAT.primare },
  teksti: { color: NGJYRAT.tekstiZbehur },
  tekstiZgjedhur: { color: '#000000', fontWeight: '700' },
  fusha: { backgroundColor: NGJYRAT.sfondiKarte, borderWidth: 1, borderColor: NGJYRAT.kufiri, borderRadius: 10, padding: 12, color: NGJYRAT.teksti, minHeight: 100 },
  butoniKryesor: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  tekstiKryesor: { color: '#000000', fontWeight: '800', fontSize: 16 },
  kthehuBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  kthehuTeksti: { color: NGJYRAT.tekstiZbehur, fontWeight: '600' },
});
