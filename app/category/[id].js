import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openInMaps(lat, lng, label) {
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${label})`,
  });
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`));
}

export default function CategoryProviders() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myCoords, setMyCoords] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setMyCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }
    })();

    supabase
      .from("providers")
      .select("*, profiles(full_name, avatar_url)")
      .eq("category_id", id)
      .then(({ data }) => {
        setProviders(data || []);
        setLoading(false);
      });
  }, [id]);

  const sorted = [...providers]
    .map((p) => ({
      ...p,
      _distance:
        myCoords && p.latitude && p.longitude
          ? distanceKm(myCoords.latitude, myCoords.longitude, p.latitude, p.longitude)
          : null,
    }))
    .sort((a, b) => {
      // Prioritet: më afër teje, pastaj vlerësimi më i lartë
      if (a._distance != null && b._distance != null && a._distance !== b._distance) {
        return a._distance - b._distance;
      }
      return (b.rating_avg || 0) - (a.rating_avg || 0);
    });

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#1B4B43" />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: name || "Ofruesit" }} />

      <TouchableOpacity style={styles.openReqBtn} onPress={() => router.push(`/request-open/${id}?name=${name}`)}>
        <Text style={styles.openReqText}>💬 Posto Kërkesë të Hapur — merr oferta nga disa ofrues</Text>
      </TouchableOpacity>

      {sorted.length === 0 ? (
        <Text style={styles.empty}>Ende s'ka ofrues të regjistruar në këtë kategori.</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => router.push(`/provider/${item.id}`)}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.profiles?.full_name}</Text>
                  {item.verified && <Text style={styles.badge}>✓ I verifikuar</Text>}
                </View>
                <Text style={styles.meta}>
                  {item.city} · {item.years_experience || 0} vite përvojë
                  {item._distance != null ? ` · 📍 ${item._distance.toFixed(1)} km larg` : ""}
                </Text>
                <Text style={styles.rating}>
                  ⭐ {item.rating_avg || "S'ka vlerësime ende"} {item.rating_count > 0 && `(${item.rating_count})`}
                </Text>
              </TouchableOpacity>
              {item.latitude && item.longitude && (
                <TouchableOpacity
                  style={styles.mapLink}
                  onPress={() => openInMaps(item.latitude, item.longitude, item.profiles?.full_name || "Ofruesi")}
                >
                  <Text style={styles.mapLinkText}>🗺️ Hap në Google Maps</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  openReqBtn: { backgroundColor: "#1B4B43", margin: 16, marginBottom: 4, padding: 14, borderRadius: 10 },
  openReqText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  empty: { textAlign: "center", marginTop: 40, color: "#888", paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 17, fontWeight: "700", color: "#1B4B43" },
  badge: { fontSize: 12, color: "#2E7D32", fontWeight: "600" },
  meta: { color: "#666", marginTop: 4 },
  rating: { marginTop: 6, color: "#B8860B", fontWeight: "600" },
  mapLink: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#F0EEE8", paddingTop: 10 },
  mapLinkText: { color: "#1B4B43", fontWeight: "600" },
});
