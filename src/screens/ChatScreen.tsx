import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { pb } from '../lib/pocketbase';
import { NGJYRAT } from '../theme/colors';

export default function ChatScreen({ route }: any) {
  const { jobId, bidId, marresiId } = route.params;
  const [mesazhet, setMesazhet] = useState<any[]>([]);
  const [teksti, setTeksti] = useState('');
  const [imiId, setImiId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let aktiv = true;
    const user = pb.authStore.model;
    setImiId(user?.id ?? null);
    ngarkoMesazhet();

    pb.collection('messages').subscribe('*', (e: any) => {
      if (aktiv && e.action === 'create' && e.record.bid_id === bidId) {
        setMesazhet((prev) => [...prev, e.record]);
      }
    });

    return () => {
      aktiv = false;
      pb.collection('messages').unsubscribe('*');
    };
  }, []);

  const ngarkoMesazhet = async () => {
    try {
      const data = await pb.collection('messages').getFullList({
        filter: `job_id="${jobId}" && bid_id="${bidId}"`,
        sort: 'created'
      });
      setMesazhet(data ?? []);
    } catch (error) {
      console.warn('Mesazhet nuk mund të ngarkohen; po shfaqet chat bosh.', error);
    }
  };

  const dergo = async () => {
    if (!teksti.trim()) return;
    const user = pb.authStore.model;
    if (!user) return;

    try {
      await pb.collection('messages').create({
        job_id: jobId,
        bid_id: bidId,
        derguesi_id: user.id,
        marresi_id: marresiId,
        teksti: teksti.trim(),
      });
      setTeksti('');
    } catch (error) {
      console.warn('Mesazhi nuk u dërgua.', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mesazhet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.flluska, item.derguesi_id === imiId ? styles.flluskaIme : styles.flluskaTjeter]}>
            <Text style={item.derguesi_id === imiId ? { color: '#fff' } : { color: '#000' }}>{item.teksti}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={NGJYRAT.tekstiShumeZbehur}
          style={styles.input}
          value={teksti}
          onChangeText={setTeksti}
          placeholder="Shkruaj mesazh..."
        />
        <TouchableOpacity style={styles.dergoBtn} onPress={dergo}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Dërgo</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.shenimi}>Numri i telefonit zbulohet vetëm pas pranimit të ofertës.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  flluska: { padding: 12, borderRadius: 14, marginBottom: 8, maxWidth: '75%' },
  flluskaIme: { backgroundColor: NGJYRAT.primare, alignSelf: 'flex-end' },
  flluskaTjeter: { backgroundColor: NGJYRAT.sfondiKarte, alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: NGJYRAT.kufiri },
  input: { color: NGJYRAT.teksti, backgroundColor: NGJYRAT.sfondiKarte, flex: 1, borderWidth: 1, borderColor: NGJYRAT.kufiri, borderRadius: 20, paddingHorizontal: 16, marginRight: 8 },
  dergoBtn: { backgroundColor: NGJYRAT.primare, paddingHorizontal: 18, justifyContent: 'center', borderRadius: 20 },
  shenimi: { textAlign: 'center', color: NGJYRAT.tekstiZbehur, fontSize: 12, padding: 8 },
});
