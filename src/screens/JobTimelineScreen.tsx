import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';
import JobStatusTimeline from '../components/JobStatusTimeline';

/**
 * Ecuria e një pune (Pranuar → Në rrugë → Duke punuar → Përfunduar).
 * Hapat i shënon vetëm ustai; klienti i ndjek.
 */
export default function JobTimelineScreen({ route, navigation }: any) {
  const jobId = route?.params?.jobId;
  const eshteUstai = pb.authStore.model?.role === 'ustai';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulli}>📋 Ecuria e punës</Text>
        <Text style={styles.nenTitulli}>
          {eshteUstai
            ? 'Shëno hapat ndërsa puna përparon. Hapi "Përfunduar" kërkon foto "Pas".'
            : 'Ndjek hapat e punës në kohë reale.'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.permbanjtja}>
        {jobId ? (
          <JobStatusTimeline jobId={jobId} leJoUstai={eshteUstai} />
        ) : (
          <Text style={styles.gabim}>
            Puna nuk u identifikua (mungon jobId). Hapni ecurinë nga një punë e caktuar.
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.kthehuBtn} onPress={() => navigation?.goBack()}>
        <Text style={styles.kthehuText}>Kthehu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  titulli: { fontSize: 22, fontWeight: '800', color: NGJYRAT.teksti },
  nenTitulli: { color: NGJYRAT.tekstiZbehur, fontSize: 13, marginTop: 6, lineHeight: 19 },
  permbanjtja: { padding: 16 },
  gabim: { color: NGJYRAT.paralajmerim, fontSize: 14, lineHeight: 21 },
  kthehuBtn: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.kufiri, alignItems: 'center' },
  kthehuText: { color: NGJYRAT.teksti, fontWeight: '700' },
});
