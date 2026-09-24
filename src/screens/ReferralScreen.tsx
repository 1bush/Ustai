import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function ReferralScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    ngarkoTeDhenat();
  }, []);

  const ngarkoTeDhenat = async () => {
    try {
      const user = pb.authStore.model;
      if (!user) return;

      const prof = await pb.collection('profiles').getOne(user.id);
      setProfile(prof);

      const refs = await pb.collection('referrals').getFullList({
        filter: `referrer_id = "${user.id}"`,
        expand: 'referred_id'
      });
      setReferrals(refs);
    } catch (error) {
        console.warn('Të dhënat e referimit nuk mund të ngarkohen.', error);
      }
  };

  const shperndajKodin = async () => {
    if (!profile?.referral_code) return;
    try {
      await Share.share({
        message: `Përshëndetje! Regjistrohu në Ustai Im me kodin tim: ${profile.referral_code} dhe fillo të fitosh punë sot!`,
      });
    } catch (error) {
      console.warn('Kodi i referimit nuk mund të ndahet.', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.titulli}>Fto një Usta</Text>
        <Text style={styles.sub}>Fito 100 pikë për çdo usta që i bashkohet platformës me kodin tënd.</Text>

        <View style={styles.kartaPikeve}>
          <Text style={styles.pikeLabel}>Pikët e mbledhura</Text>
          <Text style={styles.pikeVlera}>{profile?.points || 0} 💎</Text>
        </View>

        <View style={styles.kodiSekcion}>
          <Text style={styles.label}>Kodi yt i referimit:</Text>
          <View style={styles.kodiBox}>
            <Text style={styles.kodiText}>{profile?.referral_code || 'Gjenerohet...'}</Text>
          </View>
          <TouchableOpacity style={styles.shperndajBtn} onPress={shperndajKodin}>
            <Text style={styles.shperndajText}>📤 Shpërndaj Kodin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.seksioniTitulli}>Shpërblimet e Disponueshme</Text>
        <View style={styles.dhurataRow}>
          <View style={styles.dhurataKarta}>
            <Text style={styles.dhurataIcon}>🛠️</Text>
            <Text style={styles.dhurataEmri}>Set kaçavidash</Text>
            <Text style={styles.dhurataKosto}>500 Pikë</Text>
          </View>
          <View style={styles.dhurataKarta}>
            <Text style={styles.dhurataIcon}>🎁</Text>
            <Text style={styles.dhurataEmri}>Kupon 1000L</Text>
            <Text style={styles.dhurataKosto}>800 Pikë</Text>
          </View>
        </View>

        <Text style={[styles.seksioniTitulli, { marginTop: 30 }]}>Ftesat e Tua ({referrals.length})</Text>
        {referrals.map((r) => (
          <View key={r.id} style={styles.refItem}>
            <Text style={styles.refEmri}>{r.expand?.referred_id?.name || 'Usta i ri'}</Text>
            <Text style={styles.refData}>{new Date(r.created).toLocaleDateString()}</Text>
            <Text style={styles.refStatus}>+100 💎</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 32, fontWeight: '900', color: NGJYRAT.primare, marginBottom: 10 },
  sub: { color: NGJYRAT.tekstiZbehur, fontSize: 16, marginBottom: 30, lineHeight: 22 },
  kartaPikeve: { backgroundColor: NGJYRAT.sfondiKarte, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: NGJYRAT.kufiri, marginBottom: 30 },
  pikeLabel: { color: NGJYRAT.tekstiZbehur, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  pikeVlera: { color: '#fff', fontSize: 48, fontWeight: '900', marginTop: 5 },
  kodiSekcion: { alignItems: 'center', marginBottom: 40 },
  label: { color: '#fff', marginBottom: 10, fontWeight: '600' },
  kodiBox: { backgroundColor: 'rgba(255, 122, 26, 0.1)', borderWidth: 2, borderStyle: 'dashed', borderColor: NGJYRAT.primare, padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  kodiText: { color: NGJYRAT.primare, fontSize: 24, fontWeight: '900', letterSpacing: 5 },
  shperndajBtn: { backgroundColor: NGJYRAT.primare, padding: 15, borderRadius: 12, marginTop: 15, width: '100%' },
  shperndajText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 16 },
  seksioniTitulli: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 15 },
  dhurataRow: { flexDirection: 'row', gap: 15 },
  dhurataKarta: { flex: 1, backgroundColor: NGJYRAT.sfondiKarte, padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: NGJYRAT.kufiri },
  dhurataIcon: { fontSize: 30, marginBottom: 5 },
  dhurataEmri: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dhurataKosto: { color: NGJYRAT.primare, fontSize: 12, marginTop: 4, fontWeight: '800' },
  refItem: { flexDirection: 'row', backgroundColor: NGJYRAT.sfondiKarte, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  refEmri: { color: '#fff', flex: 1, fontWeight: '600' },
  refData: { color: NGJYRAT.tekstiZbehur, fontSize: 12, marginRight: 15 },
  refStatus: { color: '#44ff44', fontWeight: '800' }
});
