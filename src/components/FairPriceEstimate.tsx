import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

type Props = { categoryId: string | null; m2: string };

// Përdoret brenda JobPostScreen: tregon klientit çmimin mesatar historik
// për punë të ngjashme, që të mos befasohet nga oferta e para.
export default function FairPriceEstimate({ categoryId, m2 }: Props) {
  const [vlersimi, setVlersimi] = useState<any>(null);

  useEffect(() => {
    if (!categoryId) return;
    pb.collection('cmimi_mesatar_kategori').getFirstListItem(`category_id = ${categoryId}`)
      .then((res: any) => {
        setVlersimi(res);
      })
      .catch(() => setVlersimi(null));
  }, [categoryId]);

  if (!vlersimi || vlersimi.nr_punesh < 3) {
    return (
      <View style={styles.kutia}>
        <Text style={styles.teksti}>Ende pa mjaftueshëm të dhëna historike për këtë kategori.</Text>
      </View>
    );
  }

  const parsedM2 = parseFloat(m2);
  const vlersimiPerPune =
    vlersimi.cmimi_mesatar_per_m2 && !isNaN(parsedM2)
      ? Math.round(vlersimi.cmimi_mesatar_per_m2 * parsedM2)
      : vlersimi.cmimi_mesatar;

  return (
    <View style={styles.kutia}>
      <Text style={styles.titulli}>💡 Çmimi mesatar i drejtë</Text>
      <Text style={styles.teksti}>
        Punë të ngjashme kanë kushtuar mesatarisht <Text style={styles.vlera}>{vlersimiPerPune} Lek</Text>
        {'  '}(bazuar në {vlersimi.nr_punesh} punë të mëparshme).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kutia: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 10, padding: 14, marginVertical: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  titulli: { fontWeight: '700', marginBottom: 4, color: '#fff' },
  teksti: { color: NGJYRAT.tekstiZbehur },
  vlera: { fontWeight: '700', color: NGJYRAT.primare },
});
