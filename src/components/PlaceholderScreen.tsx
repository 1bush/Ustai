import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';

/**
 * Pamje e përbashkët për ekranet që nuk janë implementuar ende.
 *
 * Qëllimi: në vend që ekrani të shfaqë vetëm fjalën "Placeholder" (pa asnjë
 * kontekst, pa dalje), përdoruesi merr një shpjegim të qartë dhe mund të kthehet.
 * Përndryshe këto rrugë dukeshin si crash.
 */
export default function PlaceholderScreen({
  titulli,
  ikona = '🚧',
  pershkrimi,
  navigation,
}: {
  titulli: string;
  ikona?: string;
  pershkrimi?: string;
  navigation?: any;
}) {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.qendra}>
        <Text style={s.ikona}>{ikona}</Text>
        <Text style={s.titulli}>{titulli}</Text>
        <Text style={s.pershkrimi}>
          {pershkrimi ??
            'Ky ekran është në zhvillim dhe nuk është gati ende. Përkohësisht nuk ka asgjë për të shfaqur këtu.'}
        </Text>
      </View>

      {navigation?.goBack ? (
        <TouchableOpacity style={s.kthehu} onPress={() => navigation.goBack()}>
          <Text style={s.kthehuText}>← Kthehu</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  qendra: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  ikona: { fontSize: 56, marginBottom: 18 },
  titulli: { color: NGJYRAT.teksti, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  pershkrimi: { color: NGJYRAT.tekstiZbehur, fontSize: 15, lineHeight: 23, textAlign: 'center' },
  kthehu: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NGJYRAT.kufiri,
    alignItems: 'center',
  },
  kthehuText: { color: NGJYRAT.teksti, fontWeight: '700' },
});