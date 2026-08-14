import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker } from 'react-native-maps';
import { pb } from '../lib/pocketbase';
import FreeMap from '../components/FreeMap';
import { NGJYRAT } from '../theme/colors';

export default function ContactMapScreen({ navigation }: any) {
  const [ustallaret, setUstallaret] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rajoni, setRajoni] = useState({
    latitude: 41.3275, // Tirana
    longitude: 19.8187,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    ngarkoUstallaret();
  }, []);

  const ngarkoUstallaret = async () => {
    try {
      // Marrim lokacionet aktive të ustallarëve
      const res = await pb.collection('ustai_locations').getFullList({
        filter: 'eshte_aktiv = true',
        expand: 'ustai_id'
      });

      // Për çdo lokacion, marrim edhe profilin (rating)
      const mapped = await Promise.all(res.map(async (loc) => {
        try {
          const profile = await pb.collection('profiles').getOne(loc.ustai_id, {
            expand: 'user_id,category_id'
          });
          const coords = JSON.parse(loc.vendndodhja);
          return { ...loc, profile, coords };
        } catch {
          return null;
        }
      }));

      setUstallaret(mapped.filter(i => i !== null));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulli}>Harta e Ustallarëve</Text>
        <Text style={styles.sub}>Ustallarët me më shumë yje janë më të dukshëm.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={NGJYRAT.primare} style={{ flex: 1 }} />
      ) : (
        <FreeMap region={rajoni} style={{ flex: 1 }}>
          {ustallaret.map((item) => {
            const rating = item.profile.rating || 1;
            // Shkallëzojmë përmasën e marker-it bazuar në rating (1-5)
            // Sa më shumë yje, aq më i madh markeri
            const scale = 1 + (rating - 1) * 0.5; // nga 1x në 3x

            return (
              <Marker
                key={item.id}
                coordinate={item.coords}
                onPress={() => navigation.navigate('ProfiliPublikUstait', { profile: item.profile })}
              >
                <View style={[styles.marker, { transform: [{ scale }] }]}>
                  <View style={[styles.rreth, rating < 3 && { backgroundColor: NGJYRAT.gabim }]}>
                    <Text style={{ fontSize: 16 }}>{item.profile.expand?.category_id?.ikona || '🛠️'}</Text>
                    <View style={styles.ratingBadge}>
                       <Text style={styles.markerText}>{rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={[styles.bisht, rating < 3 && { borderTopColor: NGJYRAT.gabim }]} />
                </View>
              </Marker>
            );
          })}
        </FreeMap>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Kthehu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { padding: 16, backgroundColor: NGJYRAT.sfondiKarte },
  titulli: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: NGJYRAT.tekstiZbehur, fontSize: 12, marginTop: 4 },
  marker: { alignItems: 'center', justifyContent: 'center' },
  rreth: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: NGJYRAT.primare,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  ratingBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: NGJYRAT.paralajmerim,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fff'
  },
  bisht: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: NGJYRAT.primare,
    marginTop: -2
  },
  backBtn: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  backText: { color: '#fff', textAlign: 'center', fontWeight: '700' }
});
