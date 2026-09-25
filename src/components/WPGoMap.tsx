import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { NGJYRAT } from '../theme/colors';

interface WPGoMapProps {
  mapId?: string;
  token?: string;
}

// Token-i NUK hardkodohet: vjen vetëm nga mjedisi (.env).
// Token-i i mëparshëm ishte i publikuar në git → konsiderohet i komprometuar.
const DEFAULT_TOKEN = process.env.EXPO_PUBLIC_WP_GO_MAP_TOKEN ?? '';

export default function WPGoMap({ mapId = '38', token = DEFAULT_TOKEN }: WPGoMapProps) {
  if (!token) {
    return (
      <View style={[styles.container, styles.paKonfigurim]}>
        <Text style={styles.tekstiPaKonfigurim}>
          Harta WP Go nuk është konfiguruar.{'\n'}
          Vendos EXPO_PUBLIC_WP_GO_MAP_TOKEN në .env
        </Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
          .map-container { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div class="map-container">
          <div data-wpgmza-embed="${mapId}" data-wpgmza-token="${token}" style="width:100%;height:100%;"></div>
          <script src="https://cloud.wpgmaps.com/wp-content/plugins/wp-go-maps-cloud/js/embed.js"></script>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: NGJYRAT.sfondiKarte,
    borderWidth: 1,
    borderColor: NGJYRAT.kufiri,
  },
  webview: {
    backgroundColor: 'transparent',
  },
  paKonfigurim: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tekstiPaKonfigurim: {
    color: NGJYRAT.tekstiZbehur,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
