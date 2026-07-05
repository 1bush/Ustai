import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function ProviderOnboard() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("Tiranë");
  const [years, setYears] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, []);

  const submit = async () => {
    if (!categoryId) {
      Alert.alert("Gabim", "Zgjidh një kategori.");
      return;
    }
    setLoading(true);

    await supabase.from("profiles").update({ role: "provider" }).eq("id", session.user.id);

    const { error } = await supabase.from("providers").insert({
      id: session.user.id,
      category_id: categoryId,
      bio,
      location,
      city,
      years_experience: parseInt(years, 10) || 0,
    });

    setLoading(false);
    if (error) {
      Alert.alert("Gabim", error.message);
    } else {
      await refreshProfile();
      Alert.alert("Gati!", "Je regjistruar si ofrues shërbimi.", [
        { text: "OK", onPress: () => router.replace("/provider-dashboard") },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Regjistrohu si Ofrues</Text>

      <Text style={styles.label}>Kategoria</Text>
      <View style={styles.chipsRow}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipSelected]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextSelected]}>
              {c.icon} {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={[styles.input, styles.textArea]} placeholder="Përshkruaj shkurt eksperiencën tënde" multiline value={bio} onChangeText={setBio} />
      <TextInput style={styles.input} placeholder="Lagja/Lokacioni" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Qyteti" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="Vite përvojë" keyboardType="numeric" value={years} onChangeText={setYears} />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Duke ruajtur..." : "Bëhu Ofrues"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0", padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#1B4B43", marginBottom: 16 },
  label: { fontWeight: "600", marginBottom: 8, color: "#333" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: "#1B4B43", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipSelected: { backgroundColor: "#1B4B43" },
  chipText: { color: "#1B4B43", fontWeight: "600" },
  chipTextSelected: { color: "#fff" },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E0DDD5" },
  textArea: { height: 90, textAlignVertical: "top" },
  btn: { backgroundColor: "#1B4B43", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8, marginBottom: 40 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
