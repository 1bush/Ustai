import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';
import PlatformAdBanner from '../components/PlatformAdBanner';

export default function AvailableJobsScreen({ navigation }: any) {
  const [punet, setPunet] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ngarkoPunet = async () => {
    setLoading(true);
    try {
      const data = await pb.collection('jobs').getFullList({
        filter: 'status="ne_ankand"',
        sort: '-created',
        expand: 'category_id,klient_id'
      });

      // Marrim rating-un për çdo klient nga koleksioni profiles
      const punetMeRating = await Promise.all(data.map(async (job: any) => {
        try {
          const profile = await pb.collection('profiles').getOne(job.klient_id);
          return { ...job, klientRating: profile.rating };
        } catch {
          return { ...job, klientRating: 5.0 }; // Default nëse s'ka profil
        }
      }));

      setPunet(punetMeRating);
    } catch {
      // Mock lokal pa server — lista mbetet bosh.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ngarkoPunet();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulli}>Punë të disponueshme</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfiliUstait')}>
          <Text style={{ color: NGJYRAT.primare, fontWeight: '700' }}>Profili im</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={punet}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={ngarkoPunet} tintColor={NGJYRAT.primare} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.karta}
            onPress={() => navigation.navigate('OfertatEPunes', { jobId: item.id })}
          >
            <View style={styles.rreshti}>
              <Text style={styles.kategoria}>{item.expand?.category_id?.ikona} {item.expand?.category_id?.emri}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.klientRating}>⭐ {item.klientRating?.toFixed(1)}</Text>
                {item.eshte_urgjente && <Text style={styles.urgjente}>⚡ Urgjente</Text>}
              </View>
            </View>
            <Text style={styles.pershkrimi} numberOfLines={2}>{item.pershkrimi}</Text>
            <Text style={styles.detaje}>Sipërfaqja: {item.siperfaqja_m2}m²</Text>
            <Text style={styles.detaje}>Afati: {item.afati_perfundimit}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<PlatformAdBanner vendosja="banner_kryesor" />}
        ListEmptyComponent={<Text style={styles.bosh}>Nuk ka punë të reja momentalisht.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  titulli: { fontSize: 20, fontWeight: '800', color: '#fff' },
  karta: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  rreshti: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kategoria: { color: NGJYRAT.primare, fontWeight: '700' },
  klientRating: { color: NGJYRAT.paralajmerim, fontSize: 12, fontWeight: '700', marginRight: 8 },
  urgjente: { color: NGJYRAT.gabim, fontWeight: '800', fontSize: 12 },
  pershkrimi: { color: '#fff', fontSize: 16, marginBottom: 8 },
  detaje: { color: NGJYRAT.tekstiZbehur, fontSize: 13 },
  bosh: { textAlign: 'center', color: NGJYRAT.tekstiZbehur, marginTop: 40 }
});
