import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NGJYRAT } from '../theme/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * ErrorBoundary për të kapur gabimet e renderimit dhe të
 * tregojmë një fallback të qëndrueshëm në vend që aplikacioni
 * të bjerë në sy të zi. Aplikohet sipas skill-it `error-handling`
 * (React komponentët mbështillen në ErrorBoundary).
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Diçka shkoi keq.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    // Gabimet loggohen — nuk gëlltiten në heshtje.
    console.error('ErrorBoundary e kapi nje gabim renderimi:', error);
  }

  private rregullo = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ustai-Im</Text>
          <Text style={styles.message}>Diçka shkoi keq. Provo përsëri.</Text>
          <TouchableOpacity style={styles.btn} onPress={this.rregullo}>
            <Text style={styles.btnText}>Provo përsëri</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NGJYRAT.sfondi, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: NGJYRAT.primare, marginBottom: 12 },
  message: { color: NGJYRAT.tekstiZbehur, fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  btn: { backgroundColor: NGJYRAT.primare, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});