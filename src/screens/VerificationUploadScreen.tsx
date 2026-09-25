import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

/**
 * Ngarkimi i dokumenteve të verifikimit për ustain.
 *
 * Krijon një rekord në koleksionin `verification_documents` me status `ne_pritje`.
 * Paneli admin (`admin-dashboard/index.html`) i filtron pikërisht këto dhe, pas
 * aprovimit, kalon `profiles.eshte_i_verifikuar` në `true`.
 */

const LLOJET = [
  { kyci: 'id_karte', etiketa: '🪪 Kartë identiteti' },
  { kyci: 'certifikate', etiketa: '📜 Certifikatë profesionale' },
  { kyci: 'nif', etiketa: '🧾 NIF / Ekstrakt' },
] as const;

export default function VerificationUploadScreen({ navigation }: any) {
  const [lloji, setLloji] = useState<string>(LLOJET[0].kyci);
  const [dokumenti, setDokumenti] = useState<string | null>(null);
  const [dukeDerguar, setDukeDerguar] = useState(false);

  const zgjidhDokumentin = async (ngaKamera: boolean) => {
    const opsionet: any = { quality: 0.7 };
    const rez = ngaKamera
      ? await ImagePicker.launchCameraAsync(opsionet)
      : await ImagePicker.launchImageLibraryAsync(opsionet);
    if (!rez.canceled && rez.assets?.[0]) {
      setDokumenti(rez.assets[0].uri);
    }
  };

  const dergo = async () => {
    const user = pb.authStore.model;
    if (!user) {
      Alert.alert('Pa sesion', 'Duhet të hysh përsëri për të dërguar dokumentin.');
      return;
    }
    if (!dokumenti) {
      Alert.alert('Mungon dokumenti', 'Zgjidh ose fotografo dokumentin përpara se ta dërgosh.');
      return;
    }

    setDukeDerguar(true);
    try {
      await pb.collection('verification_documents').create({
        ustai_id: user.id,
        lloji,
        dokumenti_url: dokumenti,
        status: 'ne_pritje',
      });
      Alert.alert('U dërgua për aprovim', 'Dokumenti do të shqyrtohet nga ekipi i USTAI-IM.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
    } catch (error) {
      console.warn('Dokumenti i verifikimit nuk u dërgua.', error);
      Alert.alert('Gabim', 'Dokumenti nuk u dërgua. Provo përsëri.');
    } finally {
      setDukeDerguar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.permbanjtja}>
        <Text style={styles.titulli}>✅ Verifiko identitetin</Text>
        <Text style={styles.nenTitulli}>
          Ustallarët e verifikuar marrin më shumë punë. Dokumenti shqyrtohet nga admini.
        </Text>

        <Text style={styles.etiketat}>Lloji i dokumentit</Text>
        {LLOJET.map((l) => (
          <TouchableOpacity
            key={l.kyci}
            style={[styles.opsioni, lloji === l.kyci && styles.opsioniZgjedhur]}
            onPress={() => setLloji(l.kyci)}
          >
            <Text style={lloji === l.kyci ? styles.tekstiZgjedhur : styles.teksti}>{l.etiketa}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.etiketat}>Dokumenti</Text>
        {dokumenti ? (
          <Image source={{ uri: dokumenti }} style={styles.parapamje} resizeMode="cover" />
        ) : (
          <View style={styles.vendiImazhit}>
            <Text style={styles.tekstiZbehur}>Asnjë dokument i zgjedhur</Text>
          </View>
        )}

        <View style={styles.rreshtiButonash}>
          <TouchableOpacity style={styles.butoniDytesor} onPress={() => zgjidhDokumentin(true)}>
            <Text style={styles.tekstiDytesor}>📷 Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butoniDytesor} onPress={() => zgjidhDokumentin(false)}>
            <Text style={styles.tekstiDytesor}>🖼️ Galeria</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.butoniKryesor} onPress={dergo} disabled={dukeDerguar}>
          {dukeDerguar ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.tekstiKryesor}>Dërgo për verifikim</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.kthehuBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.tekstiZbehur}>Kthehu</Text>
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
  tekstiZbehur: { color: NGJYRAT.tekstiZbehur, textAlign: 'center' },
  parapamje: { width: '100%', height: 200, borderRadius: 12, backgroundColor: NGJYRAT.sfondiKarte },
  vendiImazhit: { height: 120, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: NGJYRAT.kufiri, justifyContent: 'center', alignItems: 'center' },
  rreshtiButonash: { flexDirection: 'row', gap: 10, marginTop: 12 },
  butoniDytesor: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri, alignItems: 'center' },
  tekstiDytesor: { color: NGJYRAT.teksti, fontWeight: '600' },
  butoniKryesor: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  tekstiKryesor: { color: '#000000', fontWeight: '800', fontSize: 16 },
  kthehuBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
});
