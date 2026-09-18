import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';
import { pb } from '../lib/pocketbase';

const FAQET = [
  ['Hyrje', 'Hyrje (Login)'], ['Regjistrimi', 'Regjistrimi'],
  ['FaqjaKlientit', 'Faqja Klientit'], ['FaqjaUstait', 'Faqja Ustait'],
  ['OfertatEPunes', 'Ofertat e Punes'], ['OfertatEMia', 'Ofertat e Mia'],
  ['GjejUstai', 'Gjej Ustai'], ['Chat', 'Chat'], ['Vleresimi', 'Vleresimi'],
  ['ProfiliUstait', 'Profili Ustait'], ['ProfiliKlientit', 'Profili Klientit'],
  ['TimelinePunes', 'Timeline Punes'], ['AIPreventiv', 'AI Preventiv'],
  ['AISkanim', 'AI Skanim'], ['AIMatja', 'AI Matja'],
];

export default function AdminTestScreen({ navigation }: any) {
  const [busy, setBusy] = useState(false);
  const [rez, setRez] = useState<string | null>(null);

  const hyr = (roli: string) => {
    pb.authStore.save('mock-token-test', { id: 'mock-' + roli, username: roli, role: roli, emri: roli + ' Test' } as any);
    Alert.alert('U hyre', 'Tani je: ' + roli);
    // pas hyrjes shko në faqen kryesore sipas rolit
    if (roli === 'klient') navigation.reset({ index: 0, routes: [{ name: 'FaqjaKlientit' }] });
    else if (roli === 'ustai') navigation.reset({ index: 0, routes: [{ name: 'FaqjaUstait' }] });
    // admini mbetet në panel (kjo është hub-i i testimit)
  };

  const testo = async () => {
    setBusy(true); setRez(null);
    // Serveri PocketBase është HEQUR — gjithmonë offline.
    setRez('Serveri PocketBase është HEQUR përkohësisht. App punon offline me mock lokal.');
    setBusy(false);
  };

  return (
    <SafeAreaView style={s.c}>
      <ScrollView contentContainerStyle={s.sc}>
        <Text style={s.t}>Panel Testimi — Admin</Text>
        <Text style={s.n}>Hyr pa kredenciale dhe testo cdo ekran.</Text>
        <View style={s.k}>
          <Text style={s.kt}>Sesioni: {pb.authStore.model ? 'aktiv ✓' : 'pa sesion'}</Text>
          {rez ? <Text style={s.r}>{rez}</Text> : null}
          <TouchableOpacity style={[s.b, s.j]} onPress={testo} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.bt}>Statusi i Serverit</Text>}
          </TouchableOpacity>
        </View>
        <View style={s.k}>
          <Text style={s.kt}>Hyr si testues</Text>
          <TouchableOpacity style={[s.b, s.j]} onPress={() => hyr('admin')}><Text style={s.bt}>Hyr si ADMIN</Text></TouchableOpacity>
          <TouchableOpacity style={s.b} onPress={() => hyr('klient')}><Text style={s.bt}>Hyr si Klient</Text></TouchableOpacity>
          <TouchableOpacity style={[s.b, s.d]} onPress={() => hyr('ustai')}><Text style={s.bt}>Hyr si Ustai</Text></TouchableOpacity>
          <TouchableOpacity style={s.bt2} onPress={() => { pb.authStore.clear(); Alert.alert('U pastrua', 'Sesioni u fshi.'); }}>
            <Text style={s.bt2t}>Pastro Sesionin (Reset)</Text>
          </TouchableOpacity>
        </View>
        <View style={s.k}>
          <Text style={s.kt}>Shko te faqet</Text>
          {FAQET.map(([emri, label]) => (
            <TouchableOpacity key={emri} style={s.f} onPress={() => navigation.navigate(emri)}>
              <Text style={s.ft}>{label} →</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  sc: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 26, fontWeight: '900', color: NGJYRAT.primare },
  n: { color: NGJYRAT.tekstiZbehur, marginBottom: 16 },
  k: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  kt: { color: '#fff', fontWeight: '800', fontSize: 17, marginBottom: 10 },
  r: { color: NGJYRAT.paralajmerim, fontSize: 13, marginBottom: 8 },
  b: { backgroundColor: NGJYRAT.primare, paddingVertical: 14, borderRadius: 12, marginTop: 10, alignItems: 'center' },
  j: { backgroundColor: '#4CAF50' },
  d: { backgroundColor: '#2A2A2A', borderWidth: 1, borderColor: NGJYRAT.kufiri },
  bt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  bt2: { marginTop: 12, padding: 10, alignItems: 'center' },
  bt2t: { color: NGJYRAT.gabim, fontWeight: '700' },
  f: { backgroundColor: '#0A0A0A', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  ft: { color: NGJYRAT.primare, fontWeight: '700', fontSize: 15 },
});
