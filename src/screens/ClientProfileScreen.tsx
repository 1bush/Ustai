import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function ClientProfileScreen({ navigation }: any) {
  const user = pb.authStore.model;

  const logout = () => {
    pb.authStore.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'K'}</Text>
        </View>
        <Text style={styles.emri}>{user?.name || 'Klient'}</Text>
        <Text style={styles.roli}>Klient i rregullt</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PunetEMia')}>
          <Text style={styles.menuText}>📋 Punët e mia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Referimet')}>
          <Text style={styles.menuText}>🎁 Fto një mik (Fitoni 500 Lek)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HartaKontakti')}>
          <Text style={styles.menuText}>📍 Harta e Kontakteve</Text>
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
  roli: { color: NGJYRAT.tekstiZbehur, fontSize: 16 },
  menu: { backgroundColor: NGJYRAT.sfondiKarte, borderRadius: 15, padding: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  menuItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  menuText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { marginTop: 'auto', marginBottom: 30, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: NGJYRAT.gabim },
  logoutText: { color: NGJYRAT.gabim, textAlign: 'center', fontWeight: '800' }
});
