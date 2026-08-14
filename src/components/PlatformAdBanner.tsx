import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

type Props = { vendosja?: 'banner_kryesor' | 'karta_pune' | 'profil_ustai' };

// Reklama të paguara nga palë të treta (dyqane materialesh, marka, etj.) —
// një prej burimeve të reja të të ardhurave për platformën.
export default function PlatformAdBanner({ vendosja = 'banner_kryesor' }: Props) {
  const [reklama, setReklama] = useState<any>(null);

  useEffect(() => {
    pb.collection('platform_ads').getList(1, 1, {
      filter: `aktive = true && vendosja = '${vendosja}'`,
      sort: '-krijuar_me'
    })
      .then((res) => {
        if (res.items.length > 0) setReklama(res.items[0]);
        else setReklama(null);
      })
      .catch(() => setReklama(null));
  }, [vendosja]);

  if (!reklama) return null;

  return (
    <TouchableOpacity
      style={styles.kutia}
      onPress={() => reklama.linku && Linking.openURL(reklama.linku)}
      activeOpacity={0.85}
    >
      {reklama.imazhi_url && <Image source={{ uri: reklama.imazhi_url }} style={styles.imazhi} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.titulli}>{reklama.titulli}</Text>
        {!!reklama.pershkrimi && <Text style={styles.pershkrimi}>{reklama.pershkrimi}</Text>}
        <Text style={styles.etiketaSponsor}>Sponsorizuar</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kutia: { flexDirection: 'row', backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.kufiri, padding: 12, marginVertical: 10, alignItems: 'center' },
  imazhi: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  titulli: { color: NGJYRAT.teksti, fontWeight: '700' },
  pershkrimi: { color: NGJYRAT.tekstiZbehur, fontSize: 12, marginTop: 2 },
  etiketaSponsor: { color: NGJYRAT.primare, fontSize: 10, marginTop: 4, fontWeight: '700' },
});
