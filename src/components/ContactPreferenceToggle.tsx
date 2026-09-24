import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { pb } from '@/lib/pocketbase';

import { NGJYRAT } from '../theme/colors';

// Përdoret tek profili i klientit/ustait — kontrollon nëse pala tjetër
// mund të kontaktojë me telefon direkt, ose vetëm përmes chat brenda app-it.
export default function ContactPreferenceToggle() {
  const [preferenca, setPreferenca] = useState<'telefon' | 'chat'>('telefon');

  useEffect(() => {
    (async () => {
      try {
        if (!pb.authStore.model) return;
        const data = await pb.collection('profiles').getOne(pb.authStore.model.id);
        if (data?.preferenca_kontakti) setPreferenca(data.preferenca_kontakti);
      } catch (error) {
        console.warn('Preferenca e kontaktit nuk u ngarkua.', error);
      }
    })();
  }, []);

  const ndrysho = async (vlera: 'telefon' | 'chat') => {
    setPreferenca(vlera);
    try {
      if (pb.authStore.model) {
        await pb.collection('profiles').update(pb.authStore.model.id, { preferenca_kontakti: vlera });
      }
    } catch (error) {
      console.warn('Preferenca e kontaktit nuk u ruajt.', error);
    }
  };

  return (
    <View style={styles.kutia}>
      <Text style={styles.titulli}>Si preferon të të kontaktojnë?</Text>
      <View style={styles.rreshti}>
        <TouchableOpacity
          style={[styles.opsioni, preferenca === 'telefon' && styles.opsioniZgjedhur]}
          onPress={() => ndrysho('telefon')}
        >
          <Text style={preferenca === 'telefon' ? styles.tekstiZgjedhur : styles.teksti}>📞 Telefon</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opsioni, preferenca === 'chat' && styles.opsioniZgjedhur]}
          onPress={() => ndrysho('chat')}
        >
          <Text style={preferenca === 'chat' ? styles.tekstiZgjedhur : styles.teksti}>💬 Vetëm Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kutia: { marginVertical: 12 },
  titulli: { fontWeight: '600', marginBottom: 8, color: NGJYRAT.teksti },
  rreshti: { flexDirection: 'row', gap: 10 },
  opsioni: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri, alignItems: 'center' },
  opsioniZgjedhur: { backgroundColor: NGJYRAT.primare, borderColor: NGJYRAT.primare },
  teksti: { color: NGJYRAT.tekstiZbehur },
  tekstiZgjedhur: { color: '#000', fontWeight: '700' },
});
