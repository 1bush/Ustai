import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function RatingScreen({ route, navigation }: any) {
  const { jobId, targetId, roliTarget } = route.params; // targetId eshte ID e personit qe po vleresohet
  const [stars, setStars] = useState(5);
  const [useGoldenStar, setUseGoldenStar] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const dergoVleresimin = async () => {
    if (!comment.trim()) {
      Alert.alert('Gabim', 'Ju lutem shkruani një koment të shkurtër.');
      return;
    }

    setLoading(true);
    try {
      const imiId = pb.authStore.model?.id;

      // 1. Krijo rekordin e review
      await pb.collection('reviews').create({
        job_id: jobId,
        reviewer_id: imiId,
        reviewee_id: targetId,
        stars: stars,
        comment: comment.trim(),
        type: roliTarget, // 'klient' ose 'ustai'
        is_golden: useGoldenStar
      });

      // 2. Perditeso rating-un mesatar te profilit te tjetrit
      const profile = await pb.collection('profiles').getOne(targetId);
      const totalJobs = (profile.completed_jobs || 0) + 1;
      const newRating = ((profile.rating * (totalJobs - 1)) + stars) / totalJobs;

      const updatePayload: any = {
        rating: newRating,
        completed_jobs: totalJobs
      };

      if (useGoldenStar) {
        updatePayload.golden_stars = (profile.golden_stars || 0) + 1;
      }

      await pb.collection('profiles').update(targetId, updatePayload);

      Alert.alert('Sukses', 'Vlerësimi u dërgua me sukses!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Gabim', 'Ndodhi një gabim: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulli}>Vlerësoni {roliTarget === 'klient' ? 'Klientin' : 'Usta-in'}</Text>
        <Text style={styles.sub}>Si ishte eksperienca juaj?</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => {
              setStars(s);
              if (s < 5) setUseGoldenStar(false);
            }}>
              <Text style={[styles.star, stars >= s ? styles.starFull : styles.starEmpty]}>⭐</Text>
            </TouchableOpacity>
          ))}
        </View>

        {stars === 5 && roliTarget === 'ustai' && (
          <TouchableOpacity
            style={[styles.goldenBtn, useGoldenStar && styles.goldenBtnActive]}
            onPress={() => setUseGoldenStar(!useGoldenStar)}
          >
            <Text style={[styles.goldenBtnText, useGoldenStar && { color: '#fff' }]}>
              {useGoldenStar ? '🌟 Golden Star u zgjodh!' : '✨ Dhuro një Golden Star?'}
            </Text>
            <Text style={styles.goldenSub}>Bëje këtë usta kandidat për fitues mujor.</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Komentet tuaja (Pagesa, sjellja, etj.)</Text>
        <TextInput
          style={styles.input}
          placeholder="Shkruani mendimin tuaj..."
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity style={styles.btn} onPress={dergoVleresimin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Dërgo Vlerësimin</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  titulli: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub: { color: NGJYRAT.tekstiZbehur, textAlign: 'center', marginBottom: 30 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  star: { fontSize: 40 },
  starFull: { opacity: 1 },
  starEmpty: { opacity: 0.3 },
  label: { color: '#fff', marginBottom: 10, fontWeight: '600' },
  input: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 16, borderRadius: 12, height: 120, textAlignVertical: 'top' },
  goldenBtn: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderWidth: 1, borderColor: '#FFD700', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  goldenBtnActive: { backgroundColor: '#FFD700' },
  goldenBtnText: { color: '#FFD700', fontWeight: '800', fontSize: 16 },
  goldenSub: { color: NGJYRAT.tekstiZbehur, fontSize: 11, marginTop: 4, textAlign: 'center' },
  btn: { backgroundColor: NGJYRAT.primare, padding: 18, borderRadius: 12, marginTop: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
});
