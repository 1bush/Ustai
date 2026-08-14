import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

// Shfaqet tek profili i ustait nëse ai është "Ustai i Muajit" aktual.
export default function UstaiOfMonthBanner({ ustaiId }: { ustaiId: string }) {
  const [eshteFitues, setEshteFitues] = useState(false);

  useEffect(() => {
    const fillimiMuajit = new Date();
    fillimiMuajit.setDate(1);
    const muajiStr = fillimiMuajit.toISOString().split('T')[0];

    pb.collection('ustai_of_month').getFirstListItem(`muaji = '${muajiStr}'`)
      .then((res) => {
        setEshteFitues(res?.ustai_id === ustaiId);
      })
      .catch(() => setEshteFitues(false));
  }, [ustaiId]);

  if (!eshteFitues) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.teksti}>🏆 Ustai i Muajit — dukshmëri falas si mirënjohje!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 10, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: NGJYRAT.primare },
  teksti: { color: NGJYRAT.paralajmerim, fontWeight: '700', textAlign: 'center' },
});
