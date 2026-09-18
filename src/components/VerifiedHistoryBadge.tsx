import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

// Përdoret tek UstaiProfileScreen dhe JobBidsScreen — jep besueshmëri
// përtej yjeve: numra konkretë punësh të kryera dhe ankesash.
export default function VerifiedHistoryBadge({ ustaiId }: { ustaiId: string }) {
  const [historiku, setHistoriku] = useState<any>(null);

  useEffect(() => {
    pb.collection('ustai_historiku_verifikuar').getFirstListItem(`ustai_id = '${ustaiId}'`)
      .then((res: any) => {
        setHistoriku(res);
      })
      .catch(() => setHistoriku(null));
  }, [ustaiId]);

  if (!historiku) return null;

  return (
    <View style={styles.kutia}>
      <Text style={styles.rreshti}>
        ✅ <Text style={styles.numri}>{historiku.nr_punesh_kryera ?? 0}</Text> punë të kryera
      </Text>
      <Text style={styles.rreshti}>
        🚩 <Text style={styles.numri}>{historiku.nr_raportimesh ?? 0}</Text> raportime
      </Text>
      {historiku.mesatarja_yjeve && (
        <Text style={styles.rreshti}>
          ⭐ <Text style={styles.numri}>{historiku.mesatarja_yjeve}</Text> mesatarja e vlerësimeve
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kutia: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 10, padding: 10, marginVertical: 8 },
  rreshti: { fontSize: 13, color: NGJYRAT.teksti },
  numri: { fontWeight: '800', color: NGJYRAT.primare },
});
