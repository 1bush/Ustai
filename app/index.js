import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shërbime Shtëpiake</Text>
        <Text style={styles.subtitle}>Gjej profesionistin e duhur pranë teje</Text>
      </View>

      <View style={styles.actionsRow}>
        {!session ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/auth/login")}>
            <Text style={styles.actionBtnText}>Hyr / Regjistrohu</Text>
          </TouchableOpacity>
        ) : profile?.role === "provider" ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/provider-dashboard")}>
            <Text style={styles.actionBtnText}>Paneli im</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/my-requests")}>
              <Text style={styles.actionBtnText}>Kërkesat e mia</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push("/provider-onboard")}>
              <Text style={styles.actionBtnOutlineText}>Bëhu Ofrues</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1B4B43" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/category/${item.id}?name=${item.name}`)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  header: { backgroundColor: "#1B4B43", padding: 20, paddingBottom: 24 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#CFE3DC", fontSize: 14, marginTop: 4 },
  actionsRow: { flexDirection: "row", padding: 16, gap: 10 },
  actionBtn: { flex: 1, backgroundColor: "#1B4B43", padding: 12, borderRadius: 10, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "600" },
  actionBtnOutline: { flex: 1, borderWidth: 1.5, borderColor: "#1B4B43", padding: 12, borderRadius: 10, alignItems: "center" },
  actionBtnOutlineText: { color: "#1B4B43", fontWeight: "600" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 6,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardText: { fontSize: 15, fontWeight: "600", color: "#1B4B43" },
});
