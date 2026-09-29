import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function JobBidsScreen({ route, navigation }: any) {
  const { jobId } = route?.params ?? {};
  const [ofertat, setOfertat] = useState<any[]>([]);
  const [puna, setPuna] = useState<any>(null);

  useEffect(() => {
    if (!jobId) return;
    pb.collection('jobs').getOne(jobId, { expand: 'category_id' })
      .then(setPuna)
      .catch((error: unknown) => console.warn('Puna nuk mund të ngarkohet.', error));

    const ngarkoOfertat = async () => {
      try {
        const data = await pb.collection('bids').getFullList({
          filter: `job_id = "${jobId}"`,
          sort: 'price',
          expand: 'ustai_id'
        });
        setOfertat(data ?? []);
      } catch (error) {
        console.warn('Ofertat nuk mund të ngarkohen.', error);
      }
    };

    ngarkoOfertat();

    pb.collection('bids').subscribe('*', (e: any) => {
      if (e.action === 'create' && e.record.job_id === jobId) {
        ngarkoOfertat(); // Riload per te marre edhe expand-in
      }
    });

    return () => {
      pb.collection('bids').unsubscribe('*');
    };
  }, [jobId]);

  const pranoOferten = async (bidId: string) => {
    Alert.alert(
      "Prano Ofertën",
      "A jeni i sigurt që dëshironi të pranoni këtë ofertë?",
      [
        { text: "Anullo", style: "cancel" },
        {
          text: "Prano",
          onPress: async () => {
            try {
              await pb.collection('jobs').update(jobId, {
                status: 'ne_proces',
                accepted_bid_id: bidId
              });
              Alert.alert("Sukses", "Oferta u pranua! Tani mund të komunikoni me ustain.");
              navigation.goBack();
            } catch (e) {
              Alert.alert("Gabim", "Nuk u mundësua pranimi i ofertës.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulli}>Ofertat për Punën</Text>
        {puna && <Text style={styles.punaInfo}>{puna.expand?.category_id?.emri}</Text>}
      </View>

      {!jobId && (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#9e9e9e', textAlign: 'center', fontSize: 15, lineHeight: 22 }}>
            Ky ekran shfaq ofertat e një pune specifike.{'\n'}Nuk u dha asnjë punë, prandaj nuk ka çfarë të shfaqet.
          </Text>
        </View>
      )}

      {jobId && (
        <FlatList
          data={ofertat}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.karta}>
            <View style={styles.rreshti}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(item.expand?.ustai_id?.emri || '?')[0]}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.emri}>{item.expand?.ustai_id?.emri} {item.expand?.ustai_id?.mbiemri}</Text>
                <Text style={styles.cmimi}>{item.price} Lek</Text>
              </View>
            </View>
            <Text style={styles.komenti}>{item.comment}</Text>
            <View style={styles.aksionet}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { jobId, bidId: item.id, marresiId: item.ustai_id })}
              >
                <Text style={styles.chatBtnText}>💬 Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pranoBtn}
                onPress={() => pranoOferten(item.id)}
              >
                <Text style={styles.pranoBtnText}>Prano Ofertën</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.bosh}>Ende nuk ka oferta për këtë punë.</Text>}
        contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  titulli: { fontSize: 22, fontWeight: '800', color: '#fff' },
  punaInfo: { color: NGJYRAT.primare, marginTop: 4, fontWeight: '600' },
  karta: { backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 15, marginBottom: 16, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  rreshti: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: NGJYRAT.primare, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { marginLeft: 12 },
  emri: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cmimi: { color: NGJYRAT.primare, fontSize: 16, fontWeight: '800', marginTop: 2 },
  komenti: { color: NGJYRAT.tekstiZbehur, fontSize: 14, marginBottom: 16 },
  aksionet: { flexDirection: 'row', gap: 10 },
  chatBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.primare, alignItems: 'center' },
  chatBtnText: { color: NGJYRAT.primare, fontWeight: '700' },
  pranoBtn: { flex: 2, padding: 12, borderRadius: 10, backgroundColor: NGJYRAT.primare, alignItems: 'center' },
  pranoBtnText: { color: '#fff', fontWeight: '700' },
  bosh: { textAlign: 'center', color: NGJYRAT.tekstiZbehur, marginTop: 50 }
});
