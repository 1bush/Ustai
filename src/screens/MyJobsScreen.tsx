import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

const GJENDJET: Record<string, { etiketa: string; ngjyra: string }> = {
  hapur: { etiketa: 'E hapur', ngjyra: NGJYRAT.primare },
  ne_proces: { etiketa: 'Në proces', ngjyra: '#4CAF50' },
  kompletuar: { etiketa: 'E përfunduar', ngjyra: '#9CA3AF' },
  anulluar: { etiketa: 'E anulluar', ngjyra: NGJYRAT.gabim },
};

export default function MyJobsScreen({ navigation }: any) {
  const [punet, setPunet] = useState<any[]>([]);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    let aktiv = true;
    const user = pb.authStore.model;
    if (!user?.id) {
      setDukeNgarkuar(false);
      return;
    }

    pb.collection('jobs').getFullList({
      filter: `klient_id = "${user.id}"`,
      sort: '-created',
      expand: 'category_id'
    })
      .then((res: any) => { if (aktiv) { setPunet(res ?? []); setDukeNgarkuar(false); } })
      .catch((error: unknown) => {
        console.warn('Punët e mia nuk mund të ngarkohen.', error);
        if (aktiv) setDukeNgarkuar(false);
      });

    return () => { aktiv = false; };
  }, []);

  if (dukeNgarkuar) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={NGJYRAT.primare} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulli}>📋 Punët e Mia</Text>

      <FlatList
        data={punet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={styles.bosh}>Nuk ke postuar ende asnjë punë.</Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => navigation.navigate('FaqjaKlientit')}
            >
              <Text style={styles.ctaText}>Posto një punë të re</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const gjendja = GJENDJET[item.status] ?? { etiketa: item.status || 'e panjohur', ngjyra: NGJYRAT.tekstiZbehur };
          return (
            <View style={styles.karta}>
              <Text style={styles.emri}>{item.titulli || item.emri || 'Punë pa titull'}</Text>
              <Text style={styles.kategoria}>
                {item.expand?.category_id?.emri || 'Pa kategori'}
              </Text>
              <View style={styles.rreshti}>
                <View style={[styles.badge, { borderColor: gjendja.ngjyra }]}>
                  <Text style={[styles.badgeText, { color: gjendja.ngjyra }]}>{gjendja.etiketa}</Text>
                </View>
                {item.cmimi != null && (
                  <Text style={styles.cmimi}>{item.cmimi} Lek</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles. ofertatBtn}
                onPress={() => navigation.navigate('OfertatEPunes', { jobId: item.id })}
              >
                <Text style={styles.ofertatText}>Shiko ofertat →</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.kthehu}
        onPress={() => navigation?.goBack()}
      >
        <Text style={styles.kthehuText}>← Kthehu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 24, fontWeight: '900', color: '#fff', padding: 16, paddingBottom: 0 },
  bosh: { color: NGJYRAT.tekstiZbehur, fontSize: 15, textAlign: 'center' },
  karta: {
    backgroundColor: NGJYRAT.sfondiKarte,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: NGJYRAT.kufiri,
  },
  emri: { color: '#fff', fontSize: 17, fontWeight: '800' },
  kategoria: { color: NGJYRAT.tekstiZbehur, fontSize: 13, marginTop: 2 },
  rreshti: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cmimi: { color: NGJYRAT.primare, fontWeight: '800', fontSize: 15 },
  ofertatBtn: { marginTop: 12, borderTopWidth: 1, borderTopColor: NGJYRAT.kufiri, paddingTop: 12 },
  ofertatText: { color: NGJYRAT.primare, fontWeight: '700', fontSize: 14 },
  cta: { marginTop: 20, backgroundColor: NGJYRAT.primare, padding: 14, borderRadius: 12 },
  ctaText: { color: '#fff', textAlign: 'center', fontWeight: '800' },
  kthehu: { padding: 16, alignItems: 'center' },
  kthehuText: { color: NGJYRAT.tekstiZbehur, fontWeight: '700', fontSize: 15 },
});