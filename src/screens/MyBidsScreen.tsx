import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function MyBidsScreen({ navigation }: any) {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = pb.authStore.model;
    if (!user) return;

    pb.collection('bids').getFullList({
      filter: `ustai_id = "${user.id}"`,
      expand: 'job_id,job_id.category_id',
      sort: '-created'
    }).then((res: any) => {
      setBids(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={NGJYRAT.primare} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulli}>Ofertat e Mia</Text>

      <FlatList
        data={bids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.karta}
            onPress={() => navigation.navigate('OfertatEPunes', { jobId: item.job_id })}
          >
            <View style={styles.rreshti}>
              <Text style={styles.kategoria}>
                {item.expand?.job_id?.expand?.category_id?.ikona} {item.expand?.job_id?.expand?.category_id?.emri}
              </Text>
              <Text style={styles.status}>{item.expand?.job_id?.status}</Text>
            </View>
            <Text style={styles.pershkrimi} numberOfLines={1}>{item.expand?.job_id?.pershkrimi}</Text>
            <View style={styles.footer}>
              <Text style={styles.cmimi}>Oferta ime: {item.price} Lek</Text>
              <Text style={styles.data}>{new Date(item.created).toLocaleDateString()}</Text>
            </View>

            {item.expand?.job_id?.status === 'ne_proces' && (
              <TouchableOpacity
                style={styles.finishBtn}
                onPress={() => {
                  navigation.navigate('Vleresimi', {
                    jobId: item.job_id,
                    targetId: item.expand?.job_id?.klient_id,
                    roliTarget: 'klient'
                  });
                }}
              >
                <Text style={styles.finishBtnText}>✅ Përfundo Punën & Vlerëso Klientin</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.bosh}>Nuk keni bërë asnjë ofertë ende.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 24, fontWeight: '900', color: '#fff', padding: 16 },
  karta: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  rreshti: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kategoria: { color: NGJYRAT.primare, fontWeight: '700' },
  status: { color: NGJYRAT.tekstiZbehur, fontSize: 12, textTransform: 'uppercase' },
  pershkrimi: { color: '#fff', fontSize: 15, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cmimi: { color: '#fff', fontWeight: '800' },
  data: { color: NGJYRAT.tekstiZbehur, fontSize: 12 },
  finishBtn: { backgroundColor: NGJYRAT.primare, padding: 12, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  finishBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  bosh: { textAlign: 'center', color: NGJYRAT.tekstiZbehur, marginTop: 50 }
});
