import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';
import ContactPreferenceToggle from '../components/ContactPreferenceToggle';

export default function UstaiProfileScreen({ navigation }: any) {
  const [profile, setProfile] = React.useState<any>(null);
  const user = pb.authStore.model;

  React.useEffect(() => {
    if (user) {
      pb.collection('profiles').getOne(user.id).then(setProfile);
    }
  }, [user]);

  const logout = () => {
    pb.authStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.emri}>{user?.name || 'Ustai'}</Text>
        <Text style={styles.roli}>Ustai i Çertifikuar</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVlera}>{profile?.points || 0}</Text>
            <Text style={styles.statLabel}>Pikë 💎</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: NGJYRAT.kufiri }]}>
            <Text style={styles.statVlera}>{profile?.golden_stars || 0}</Text>
            <Text style={styles.statLabel}>Golden 🌟</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVlera}>{profile?.rating?.toFixed(1) || '5.0'}</Text>
            <Text style={styles.statLabel}>Yje ⭐</Text>
          </View>
        </View>
      </View>

      <ContactPreferenceToggle />

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('VerifikoIdentitetin')}>
          <Text style={styles.menuText}>✅ Verifiko identitetin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Referimet')}>
          <Text style={styles.menuText}>👫 Fto një usta (Fito Pikë)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AnalitikaIme')}>
          <Text style={styles.menuText}>📈 Analitika dhe Fitimet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Sigurimi')}>
          <Text style={styles.menuText}>🛡️ Sigurimi i punës</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Dil nga aplikacioni</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi, padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: NGJYRAT.primare, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '800' },
  emri: { color: '#fff', fontSize: 24, fontWeight: '800' },
  roli: { color: NGJYRAT.tekstiZbehur, fontSize: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 15, padding: 15, borderWidth: 1, borderColor: NGJYRAT.kufiri, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statVlera: { color: '#fff', fontSize: 18, fontWeight: '900' },
  statLabel: { color: NGJYRAT.tekstiZbehur, fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
  menu: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 15, padding: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  menuItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  menuText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { marginTop: 'auto', marginBottom: 30, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.gabim },
  logoutText: { color: NGJYRAT.gabim, textAlign: 'center', fontWeight: '800' }
});
