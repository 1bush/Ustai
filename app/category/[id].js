import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function CategoryProviders() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("providers")
      .select("*, profiles(full_name, avatar_url)")
      .eq("category_id", id)
      .then(({ data }) => {
        setProviders(data || []);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color="#1B4B43" />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: name || "Ofruesit" }} />
      {providers.length === 0 ? (
        <Text style={styles.empty}>Ende s'ka ofrues të regjistruar në këtë kategori.</Text>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/provider/${item.id}`)}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.profiles?.full_name}</Text>
                {item.verified && <Text style={styles.badge}>✓ I verifikuar</Text>}
              </View>
              <Text style={styles.meta}>{item.city} · {item.years_experience || 0} vite përvojë</Text>
              <Text style={styles.rating}>
                ⭐ {item.rating_avg || "S'ka vlerësime ende"} {item.rating_count > 0 && `(${item.rating_count})`}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  empty: { textAlign: "center", marginTop: 40, color: "#888", paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 17, fontWeight: "700", color: "#1B4B43" },
  badge: { fontSize: 12, color: "#2E7D32", fontWeight: "600" },
  meta: { color: "#666", marginTop: 4 },
  rating: { marginTop: 6, color: "#B8860B", fontWeight: "600" },
});
