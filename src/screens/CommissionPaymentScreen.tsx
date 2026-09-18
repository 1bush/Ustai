import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NGJYRAT } from '../theme/colors';

export default function CommissionPaymentScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulli}>💼 Pagesa e Komisionit</Text>
        <Text style={styles.mesazhi}>Ky komponent gjendet në zhvillim.</Text>
        <Text style={styles.ndjekje}>Do të jetë i gatshëm saç.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  titulli: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  mesazhi: { color: NGJYRAT.tekstiZbehur, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  ndjekje: { color: NGJYRAT.tekstiShumeZbehur, textAlign: 'center', fontSize: 14, marginTop: 12 },
});
