import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { NGJYRAT } from '../theme/colors';

interface WPGoMapProps {
  mapId?: string;
  token?: string;
}

const DEFAULT_TOKEN = process.env.EXPO_PUBLIC_WP_GO_MAP_TOKEN || "ff864928695e696ffdf4509d808efdf218a27ad5fed20c5bb995846b9059bc02";

export default function WPGoMap({ mapId = "38", token = DEFAULT_TOKEN }: WPGoMapProps) {
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
});
