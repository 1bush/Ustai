import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

function openInMaps(lat, lng, label) {
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${label})`,
  });
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`));
}

export default function ProviderProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("providers").select("*, profiles(full_name, phone, avatar_url), categories(name)").eq("id", id).single(),
      supabase.from("reviews").select("*").eq("provider_id", id).order("created_at", { ascending: false }),
    ]).then(([p, r]) => {
      setProvider(p.data);
      setReviews(r.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#1B4B43" />;
  if (!provider) return <Text style={{ margin: 20 }}>Ofruesi nuk u gjet.</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{provider.profiles?.full_name}</Text>
        <Text style={styles.category}>{provider.categories?.name}</Text>
        {provider.verified && <Text style={styles.badge}>✓ I verifikuar</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{provider.bio || "S'ka përshkrim."}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Lokacioni</Text>
        <Text style={styles.value}>{provider.location}, {provider.city}</Text>
        {provider.latitude && provider.longitude && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => openInMaps(provider.latitude, provider.longitude, provider.profiles?.full_name || "Ofruesi")}
          >
            <Text style={styles.mapBtnText}>🗺️ Hap në Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {provider.certifications ? (
        <View style={styles.section}>
          <Text style={styles.label}>Certifikime & Trajnime</Text>
          <Text style={styles.value}>🎓 {provider.certifications}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Vlerësimi</Text>
        <Text style={styles.value}>⭐ {provider.rating_avg || "S'ka ende"} ({provider.rating_count} vlerësime)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Vlerësimet e klientëve</Text>
        {reviews.length === 0 && <Text style={styles.value}>Ende s'ka vlerësime.</Text>}
        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <Text>⭐ {r.rating}/5</Text>
            {r.comment ? <Text style={styles.reviewComment}>"{r.comment}"</Text> : null}
          </View>
        ))}
      </View>

      {session ? (
        <TouchableOpacity style={styles.btn} onPress={() => router.push(`/booking/${provider.id}`)}>
          <Text style={styles.btnText}>Kërko Shërbim</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/auth/login")}>
          <Text style={styles.btnText}>Hyr për të kërkuar shërbim</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  header: { backgroundColor: "#1B4B43", padding: 20 },
  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
  category: { color: "#CFE3DC", marginTop: 2 },
  badge: { color: "#A8E6A1", marginTop: 6, fontWeight: "600" },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#E0DDD5" },
  label: { fontSize: 13, color: "#888", marginBottom: 4, textTransform: "uppercase" },
  value: { fontSize: 15, color: "#222" },
  mapBtn: { marginTop: 8, alignSelf: "flex-start" },
  mapBtnText: { color: "#1B4B43", fontWeight: "700" },
  reviewCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 8 },
  reviewComment: { fontStyle: "italic", color: "#555", marginTop: 4 },
  btn: { backgroundColor: "#1B4B43", margin: 20, padding: 16, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
