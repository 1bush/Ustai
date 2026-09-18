import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

const HAPAT: { kyci: 'pranuar' | 'ne_rruge' | 'duke_punuar' | 'perfunduar'; etiketa: string; ikona: string }[] = [
  { kyci: 'pranuar', etiketa: 'Pranuar', ikona: '✅' },
  { kyci: 'ne_rruge', etiketa: 'Në rrugë', ikona: '🚐' },
  { kyci: 'duke_punuar', etiketa: 'Duke punuar', ikona: '🔨' },
  { kyci: 'perfunduar', etiketa: 'Përfunduar', ikona: '🏁' },
];

type Props = { jobId: string; leJoUstai?: boolean };

export default function JobStatusTimeline({ jobId, leJoUstai = false }: Props) {
  const [ngjarjet, setNgjarjet] = useState<Record<string, any>>({});
  const [fotoPasNgarkuar, setFotoPasNgarkuar] = useState(false);

  useEffect(() => {
    ngarko();
  }, []);

  const ngarko = async () => {
    try {
      const res = await pb.collection('job_timeline').getList(1, 50, {
        filter: `job_id = '${jobId}'`
      });
      const timelineData = res.items;
      const harta: Record<string, any> = {};
      (timelineData ?? []).forEach((e: any) => (harta[e.eventi] = e));
      setNgjarjet(harta);

      const jobData = await pb.collection('jobs').getOne(jobId);
      if (jobData) setFotoPasNgarkuar(!!jobData.foto_pas_ngarkuar);
    } catch (e) {}
  };

  const shenoHapin = async (kyci: string) => {
    if (kyci === 'perfunduar' && !fotoPasNgarkuar) {
      Alert.alert(
        'Kërkohet Provë',
        'Duhet të ngarkoni të paktën një foto "Pas" pune përpara se ta shënoni si të përfunduar.'
      );
      return;
    }

    try {
      if (!pb.authStore.model) return;

      await pb.collection('job_timeline').create({
        job_id: jobId,
        eventi: kyci,
        user_id: pb.authStore.model.id,
        krijuar_me: new Date().toISOString()
      });
      ngarko();
    } catch (e) {}
  };

  const indeksiAktual = HAPAT.findIndex((h) => !ngjarjet[h.kyci]);
  const hapiTjeterIndeks = indeksiAktual === -1 ? HAPAT.length : indeksiAktual;

  return (
    <View style={styles.container}>
      {HAPAT.map((hapi, i) => {
        const eshteBere = !!ngjarjet[hapi.kyci];
        const eshteTjetri = i === hapiTjeterIndeks;

        // Nëse hapi tjetër është "Përfunduar" por s'ka foto, tregojmë një paralajmërim
        const kerkonFoto = hapi.kyci === 'perfunduar' && !fotoPasNgarkuar;

        return (
          <View key={hapi.kyci} style={styles.hapiRreshti}>
            <View style={[styles.rrethiIkones, eshteBere && styles.rrethiIkonesBere]}>
              <Text style={{ fontSize: 16 }}>{hapi.ikona}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.etiketa, eshteBere && styles.etiketaBere]}>{hapi.etiketa}</Text>
              {eshteBere && (
                <Text style={styles.koha}>{new Date(ngjarjet[hapi.kyci].krijuar_me).toLocaleString('sq-AL')}</Text>
              )}
              {!eshteBere && eshteTjetri && leJoUstai && (
                <View>
                  <TouchableOpacity
                    style={[styles.btnShenoHapin, kerkonFoto && { backgroundColor: NGJYRAT.kufiri }]}
                    onPress={() => shenoHapin(hapi.kyci)}
                  >
                    <Text style={[styles.btnShenoHapinText, kerkonFoto && { color: NGJYRAT.tekstiZbehur }]}>
                      Shëno si "{hapi.etiketa}"
                    </Text>
                  </TouchableOpacity>
                  {kerkonFoto && (
                    <Text style={styles.tekstInfo}>⚠️ Ngarko fotot "Pas" për të mbyllur punën</Text>
                  )}
                </View>
              )}
            </View>
            {i < HAPAT.length - 1 && <View style={[styles.linja, eshteBere && styles.linjaBere]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  hapiRreshti: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  rrethiIkones: { width: 32, height: 32, borderRadius: 16, backgroundColor: NGJYRAT.sfondiKarte, borderWidth: 1, borderColor: NGJYRAT.kufiri, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rrethiIkonesBere: { borderColor: NGJYRAT.primare, backgroundColor: NGJYRAT.sfondiKarte },
  etiketa: { color: NGJYRAT.tekstiZbehur, fontWeight: '600', paddingTop: 6 },
  etiketaBere: { color: NGJYRAT.teksti },
  koha: { color: NGJYRAT.tekstiShumeZbehur, fontSize: 11, marginBottom: 10 },
  btnShenoHapin: { backgroundColor: NGJYRAT.primare, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4, marginBottom: 10 },
  btnShenoHapinText: { color: '#000', fontWeight: '700', fontSize: 12 },
  tekstInfo: { color: NGJYRAT.paralajmerim, fontSize: 11, marginTop: -6, marginBottom: 10 },
  linja: { position: 'absolute', left: 15, top: 32, width: 2, height: 30, backgroundColor: NGJYRAT.kufiri },
  linjaBere: { backgroundColor: NGJYRAT.primare },
});
