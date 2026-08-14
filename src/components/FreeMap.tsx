import React from 'react';
import MapView, { UrlTile } from 'react-native-maps';
import { StyleSheet, View, Text, Platform } from 'react-native';

interface FreeMapProps {
  region: any;
  onPress?: (coord: any) => void;
  children?: React.ReactNode;
  style?: any;
}

/**
 * Komponent Hartë 100% FALAS pa API KEY.
 * Përdor OpenFreeMap (OpenStreetMap Data).
 */
export default function FreeMap({ region, onPress, children, style }: FreeMapProps) {
  // Stilet e disponueshme: bright, liberty, positron, dark
  const styleName = "bright";
  const tileUrl = `https://tiles.openfreemap.org/styles/${styleName}/{z}/{x}/{y}.png`;

  return (
    <View style={style || styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        // Në Android duhet 'none' për të hequr grid-in gri të Google Maps kur s'kemi API Key
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={{
          ...region,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => onPress && onPress(e.nativeEvent.coordinate)}
      >
        <UrlTile
          urlTemplate={tileUrl}
          zIndex={-1}
          maximumZ={19}
          flipY={false}
        />
        {children}
      </MapView>

      {/* Attribution i detyrueshëm sipas licencës OSM */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenFreeMap © OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 300, width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  harta: { flex: 1 },
  attribution: {
    position: 'absolute',
    bottom: 2,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  attributionText: { fontSize: 8, color: '#000' }
});
