import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { pb } from '@/lib/pocketbase';
import FairPriceEstimate from '../components/FairPriceEstimate';
import { AIMatchingService } from '../lib/aiMatching';
import { AutoNotificationService } from '../lib/autoNotifications';
import { GeocodingService } from '../lib/geocoding';
import FreeMap from '../components/FreeMap';
import { AIDiagnosisService } from '../lib/aiDiagnosis';
import { NGJYRAT } from '../theme/colors';

export default function JobPostScreen({ navigation, route }: any) {
  const paraploteso = route?.params?.paraploteso;
  const [kategorite, setKategorite] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(paraploteso?.categoryId ?? null);
  const [pershkrimi, setPershkrimi] = useState(paraploteso?.pershkrimi ?? '');
  const [m2, setM2] = useState(paraploteso?.siperfaqja_m2 ? String(paraploteso.siperfaqja_m2) : '');
  const [afati, setAfati] = useState(new Date());
  const [treguesDate, setTreguesDate] = useState(false);
  const [fotot, setFotot] = useState<string[]>([]);
  const [rajoni, setRajoni] = useState<{ latitude: number; longitude: number } | null>(null);
  const [duke_postuar, setDukePostuar] = useState(false);
  const [eshteUrgjente, setEshteUrgjente] = useState(false);
  const [deshironGaranci, setDeshironGaranci] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [dukeAnalizuarAI, setDukeAnalizuarAI] = useState(false);

  useEffect(() => {
    let aktiv = true;
    pb.collection('categories').getFullList({
      sort: 'emri'
    })
      .then((res: any) => { if (aktiv) setKategorite(res ?? []); })
      .catch((error: unknown) => console.warn('Kategoritë nuk u ngarkuan.', error));

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          if (aktiv) setRajoni({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (error) {
        console.warn('Lokacioni nuk u lexua; po vazhdohet pa rajon.', error);
      }
    })();

    return () => { aktiv = false; };
  }, []);

  const shtoFoto = async () => {
    const rez = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!rez.canceled) {
      setFotot((prev) => [...prev, ...rez.assets.map((a) => a.uri)]);
    }
  };

  const analizoMeAI = async () => {
    if (fotot.length === 0) {
      Alert.alert('Ngarko të paktën një foto për analizë');
      return;
    }

    setDukeAnalizuarAI(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(fotot[0], {
        encoding: FileSystem.EncodingType.Base64,
      });

      const rezultati = await AIDiagnosisService.analyzeProblem(base64);
      if (rezultati) {
        Alert.alert(
          'Analiza AI',
          `Kategoria e sugjeruar: ${rezultati.kategoria_sugjeruar}\n\nDo të plotësojmë përshkrimin automatikisht.`,
          [
            {
              text: 'Prano',
              onPress: () => {
                setPershkrimi(rezultati.pershkrimi_teknik + "\n\nMaterialet e sugjeruara: " + rezultati.materialet_e_nevojshme.join(', '));
                const kat = kategorite.find(k => k.emri.toLowerCase().includes(rezultati.kategoria_sugjeruar.toLowerCase()));
                if (kat) setCategoryId(kat.id);
                if (rezultati.urgjenca_sugjeruar === 'e_larte') setEshteUrgjente(true);
              }
            },
            { text: 'Anullo', style: 'cancel' }
          ]
        );
      }
    } catch (e) {
      Alert.alert('Gabim gjatë analizës');
    } finally {
      setDukeAnalizuarAI(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const results = await GeocodingService.searchPlaces(text, rajoni ? [rajoni.longitude, rajoni.latitude] : undefined);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: any) => {
    setRajoni({ latitude: s.coordinates[1], longitude: s.coordinates[0] });
    setSearchQuery(s.name);
    setSuggestions([]);
  };

  const postoPunen = async () => {
    if (!categoryId || !pershkrimi || !m2 || !rajoni) {
      Alert.alert('Plotëso kategorinë, përshkrimin, m2 dhe lejo vendndodhjen');
      return;
    }
    setDukePostuar(true);
    try {
      const user = pb.authStore.model;
      if (!user) return;

      const formData = new FormData();
      formData.append('klient_id', user.id);
      formData.append('category_id', categoryId);
      formData.append('pershkrimi', pershkrimi);
      formData.append('siperfaqja_m2', String(parseFloat(m2)));
      formData.append('afati_perfundimit', afati.toISOString().split('T')[0]);
      formData.append('vendndodhja', JSON.stringify({ lat: rajoni.latitude, lng: rajoni.longitude }));
      formData.append('status', 'ne_ankand');
      formData.append('eshte_urgjente', String(eshteUrgjente));

      fotot.forEach((uri, index) => {
        formData.append('fotot', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: `foto_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      const job = await pb.collection('jobs').create(formData);

      // AI Matching & Notifications
      try {
        const matches = await AIMatchingService.findBestMatches(job.id);
        if (matches && matches.length > 0) {
          await AutoNotificationService.notifyNewJob(job.id, matches.map((m: any) => m.ustai_id));
        }
      } catch {
        // Njoftimet AI kapërcehen pa server — puna ruhet lokalisht.
      }

      if (eshteUrgjente || deshironGaranci) {
        navigation.navigate('PagesaShtesat', { jobId: job.id, eshteUrgjente, deshironGaranci });
        return;
      }

      Alert.alert('Sukses', 'Puna u postua! Do të fillojnë të vijnë oferta.');
      navigation.navigate('OfertatEPunes', { jobId: job.id });
    } catch (e: any) {
      Alert.alert('Gabim', e.message);
    } finally {
      setDukePostuar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.titulli}>Posto një punë</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfiliKlientit')}>
            <Text style={styles.lidhjaProfilit}>👤 Profili im →</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Kategoria</Text>
          <View style={styles.rreshtiKategori}>
            {kategorite.map((k) => (
              <TouchableOpacity
                key={k.id}
                style={[styles.kategoriChip, categoryId === k.id && styles.kategoriChipZgjedhur]}
                onPress={() => setCategoryId(k.id)}
              >
                <Text style={categoryId === k.id ? { color: '#fff' } : { color: NGJYRAT.teksti }}>{k.ikona} {k.emri}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Përshkrimi i punës</Text>
          <TextInput
            placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            multiline
            value={pershkrimi}
            onChangeText={setPershkrimi}
          />

          <Text style={styles.label}>Sipërfaqja (m²)</Text>
          <TextInput placeholderTextColor={NGJYRAT.tekstiShumeZbehur} style={styles.input} keyboardType="numeric" value={m2} onChangeText={setM2} placeholder="p.sh. 6" />

          <FairPriceEstimate categoryId={categoryId} m2={m2} />

          <Text style={styles.label}>Afati i përfundimit</Text>
          <TouchableOpacity style={styles.input} onPress={() => setTreguesDate(true)}>
            <Text style={{ color: NGJYRAT.teksti }}>{afati.toLocaleDateString('sq-AL')}</Text>
          </TouchableOpacity>
          {treguesDate && (
            <DateTimePicker
              value={afati}
              mode="date"
              onChange={(_, date) => {
                setTreguesDate(Platform.OS === 'ios');
                if (date) setAfati(date);
              }}
            />
          )}

          <Text style={styles.label}>Vendndodhja</Text>
          <TextInput placeholder="Kërko adresën..." placeholderTextColor={NGJYRAT.tekstiShumeZbehur} style={[styles.input, { marginBottom: 8 }]} value={searchQuery} onChangeText={handleSearch} />
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion(s)}>
                  <Text style={styles.suggestionText}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {rajoni && (
            <FreeMap region={rajoni} onPress={setRajoni}>
              <Marker coordinate={rajoni} draggable onDragEnd={(e) => setRajoni(e.nativeEvent.coordinate)} />
            </FreeMap>
          )}

          <Text style={styles.label}>Fotot e punës</Text>
          <ScrollView horizontal>
            {fotot.map((uri) => <Image key={uri} source={{ uri }} style={styles.fotoPreview} />)}
            <TouchableOpacity style={styles.shtoFotoBtn} onPress={shtoFoto}><Text style={{ fontSize: 24, color: NGJYRAT.teksti }}>+</Text></TouchableOpacity>
          </ScrollView>

          {fotot.length > 0 && (
            <TouchableOpacity style={[styles.aiBtn, dukeAnalizuarAI && { opacity: 0.6 }]} onPress={analizoMeAI} disabled={dukeAnalizuarAI}>
              <Text style={styles.aiBtnText}>{dukeAnalizuarAI ? '⌛ Duke analizuar...' : '✨ Analizo me AI (Auto-plotëso)'}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.aiToolsSection}>
            <Text style={styles.label}>Nuk jeni i sigurt? Përdorni AI</Text>
            <View style={styles.aiToolsRow}>
              <TouchableOpacity style={styles.aiToolCard} onPress={() => navigation.navigate('AIPreventiv')}>
                <Text style={styles.aiToolIcon}>📊</Text>
                <Text style={styles.aiToolText}>AI Preventivi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiToolCard} onPress={() => navigation.navigate('AIPlanifikuesHapesire', { lloji: 'tualet' })}>
                <Text style={styles.aiToolIcon}>📐</Text>
                <Text style={styles.aiToolText}>AI Planifikues</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={postoPunen} disabled={duke_postuar}>
            <Text style={styles.btnText}>{duke_postuar ? 'Duke postuar...' : 'Posto punën'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 24, fontWeight: '800', marginBottom: 16, color: NGJYRAT.primare },
  lidhjaProfilit: { color: NGJYRAT.primare, marginBottom: 16, fontWeight: '600' },
  label: { fontWeight: '700', marginTop: 14, marginBottom: 6, color: NGJYRAT.tekstiZbehur },
  input: { color: NGJYRAT.teksti, backgroundColor: NGJYRAT.sfondiKarte, borderWidth: 1, borderColor: NGJYRAT.kufiri, borderRadius: 10, padding: 12, justifyContent: 'center' },
  rreshtiKategori: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kategoriChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: NGJYRAT.kufiri, marginRight: 8, marginBottom: 8 },
  kategoriChipZgjedhur: { backgroundColor: NGJYRAT.primare, borderColor: NGJYRAT.primare },
  fotoPreview: { width: 90, height: 90, borderRadius: 10, marginRight: 8 },
  shtoFotoBtn: { width: 90, height: 90, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri, justifyContent: 'center', alignItems: 'center' },
  suggestionsContainer: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri, marginBottom: 10 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  suggestionText: { color: NGJYRAT.teksti, fontSize: 14 },
  btn: { backgroundColor: NGJYRAT.primare, padding: 16, borderRadius: 10, marginTop: 24, marginBottom: 40 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  aiBtn: { backgroundColor: NGJYRAT.primare, padding: 12, borderRadius: 10, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  aiToolsSection: { marginTop: 24, padding: 16, backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 15, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  aiToolsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  aiToolCard: { flex: 1, backgroundColor: NGJYRAT.sfondi, padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: NGJYRAT.kufiri },
  aiToolIcon: { fontSize: 24, marginBottom: 4 },
  aiToolText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
