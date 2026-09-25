import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';
import VerifiedHistoryBadge from '../components/VerifiedHistoryBadge';
import UstaiOfMonthBanner from '../components/UstaiOfMonthBanner';

export default function UstaiPublicProfileScreen({ route, navigation }: any) {
  const { profile } = route.params;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supozojmë se kemi një koleksion 'reviews' që lidhet me profilin e ustait
    pb.collection('reviews').getFullList({
      filter: `ustai_id = "${profile.id}"`,
      sort: '-created',
      expand: 'klient_id'
    }).then((res: any) => {
      setReviews(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [profile.id]);

  const eshteHistoriEKeqe = profile.rating < 3.0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile.expand?.user_id?.name || 'U')[0]}</Text>
          </View>
          <Text style={styles.emri}>{profile.expand?.user_id?.name}</Text>
          <Text style={styles.rating}>⭐ {profile.rating?.toFixed(1)} / 5.0</Text>
        </View>

        {eshteHistoriEKeqe && (
          <View style={styles.badHistoryContainer}>
            <Text style={styles.badHistoryTitle}>⚠️ KUJDES: HISTORI E KEQE</Text>
            <Text style={styles.badHistoryText}>
              Ky usta ka një vlerësim të ulët nga klientët e mëparshëm.
              Lexoni komentet negative më poshtë përpara se të vazhdoni.
            </Text>
          </View>
        )}

        <UstaiOfMonthBanner ustaiId={profile.id} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eksperienca</Text>
          <Text style={styles.tekst}>{profile.completed_jobs} punë të përfunduara</Text>
          <VerifiedHistoryBadge ustaiId={profile.id} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vlerësimet e Klientëve</Text>
          {reviews.length === 0 ? (
            <Text style={styles.tekstZbehur}>Nuk ka ende vlerësime për këtë usta.</Text>
          ) : (
            reviews.map((rev: any) => (
              <View key={rev.id} style={[styles.reviewKarta, rev.stars < 3 && styles.negativeReview]}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewKlienti}>{rev.expand?.klient_id?.name || 'Klient'}</Text>
                  <Text style={styles.reviewYje}>{'⭐'.repeat(rev.stars)}</Text>
                </View>
                <Text style={styles.reviewKoment}>{rev.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.btn, eshteHistoriEKeqe && { backgroundColor: NGJYRAT.gabim }]}
        onPress={() => navigation.navigate('Chat', { marresiId: profile.user_id })}
      >
        <Text style={styles.btnText}>Kontakt Usta-in</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { alignItems: 'center', padding: 30, backgroundColor: NGJYRAT.sfondiKarte, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: NGJYRAT.primare, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  emri: { color: '#fff', fontSize: 22, fontWeight: '800' },
  rating: { color: NGJYRAT.paralajmerim, fontSize: 18, fontWeight: '700', marginTop: 5 },
  badHistoryContainer: { backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: 16, margin: 16, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.gabim },
  badHistoryTitle: { color: NGJYRAT.gabim, fontWeight: '900', fontSize: 16, marginBottom: 4 },
  badHistoryText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  sectionTitle: { color: NGJYRAT.primare, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  tekst: { color: '#fff', fontSize: 16 },
  tekstZbehur: { color: NGJYRAT.tekstiZbehur, fontSize: 14 },
  reviewKarta: { backgroundColor: NGJYRAT.sfondiKarte, padding: 12, borderRadius: 10, marginBottom: 10 },
  negativeReview: { borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewKlienti: { color: '#fff', fontWeight: '700' },
  reviewYje: { fontSize: 12 },
  reviewKoment: { color: NGJYRAT.tekstiZbehur, fontSize: 14, fontStyle: 'italic' },
  btn: { backgroundColor: NGJYRAT.primare, margin: 16, padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
