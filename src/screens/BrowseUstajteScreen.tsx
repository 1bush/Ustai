import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '@/lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function BrowseUstajteScreen({ navigation }: any) {
  const [ustallaret, setUstallaret] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    pb.collection('profiles').getFullList({
      filter: 'role="ustai"',
      sort: '-rating',
      expand: 'user_id,category_id'
    }).then(setUstallaret);
  }, []);

  const filtered = ustallaret.filter(u =>
    (u.expand?.user_id?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulli}>Shfleto Ustallarët</Text>
        <TextInput
          style={styles.search}
          placeholder="Kërko me emër..."
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.karta}
            onPress={() => navigation.navigate('ProfiliPublikUstait', { profile: item })}
          >
            <View style={styles.avatarRreth}>
              <Text style={styles.avatarText}>{item.expand?.category_id?.ikona || '🛠️'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.emri}>{item.expand?.user_id?.name || 'Usta i Panjohur'}</Text>
              <Text style={styles.roli}>Ustai i Çertifikuar</Text>
              <View style={styles.rating}>
                <Text style={{ color: NGJYRAT.paralajmerim }}>⭐ {item.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={{ color: NGJYRAT.tekstiZbehur, marginLeft: 8 }}>({item.completed_jobs || 0} punë)</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: NGJYRAT.kufiri },
  titulli: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  search: { backgroundColor: NGJYRAT.sfondiKarte, color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: NGJYRAT.kufiri },
  karta: { flexDirection: 'row', backgroundColor: NGJYRAT.sfondiKarte, padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  avatarRreth: { width: 60, height: 60, borderRadius: 30, backgroundColor: NGJYRAT.primare, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { marginLeft: 16, flex: 1 },
  emri: { color: '#fff', fontSize: 18, fontWeight: '700' },
  roli: { color: NGJYRAT.tekstiZbehur, fontSize: 14, marginTop: 2 },
  rating: { flexDirection: 'row', marginTop: 4 }
});
