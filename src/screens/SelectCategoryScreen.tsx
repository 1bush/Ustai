import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function SelectCategoryScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('categories').getFullList({ sort: 'emri' })
      .then((res) => {
        setCategories(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const zgjidh = async (catId: string) => {
    const user = pb.authStore.model;
    if (!user) return;

    try {
      // Përditëso profilin e ustait me kategorinë e zgjedhur
      await pb.collection('profiles').update(user.id, {
        category_id: catId
      });
      navigation.reset({ index: 0, routes: [{ name: 'FaqjaUstait' }] });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={NGJYRAT.primare} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulli}>Zgjidhni Kategorinë Tuaj</Text>
      <Text style={styles.sub}>Si usta, në cilën fushë jeni i specializuar?</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.karta} onPress={() => zgjidh(item.id)}>
            <Text style={styles.ikona}>{item.ikona}</Text>
            <Text style={styles.emri}>{item.emri}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  titulli: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 20 },
  sub: { color: NGJYRAT.tekstiZbehur, textAlign: 'center', marginBottom: 20, paddingHorizontal: 40 },
  karta: { flex: 1, backgroundColor: NGJYRAT.sfondiKarte, margin: 8, padding: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: NGJYRAT.kufiri },
  ikona: { fontSize: 32, marginBottom: 10 },
  emri: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
