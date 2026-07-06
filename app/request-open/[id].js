import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

export default function OpenRequest() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (!description) {
      Alert.alert("Gabim", "Përshkruaj shkurt punën që kërkon.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("service_requests").insert({
      client_id: session.user.id,
      provider_id: null,
      category_id: id,
      description,
      address,
      preferred_date: preferredDate || null,
      budget: budget ? parseFloat(budget) : null,
      is_open: true,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Gabim", error.message);
    } else {
      Alert.alert(
        "U postua!",
        "Kërkesa jote është e dukshme për të gjithë ofruesit e kësaj kategorie. Do të marrësh oferta dhe mund të zgjedhësh më të mirën.",
        [{ text: "OK", onPress: () => router.replace("/my-requests") }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Kërkesë e Hapur — ${name || ""}` }} />
      <Text style={styles.title}>Përshkruaj punën</Text>
      <Text style={styles.subtitle}>
        Kjo kërkesë do t'u dërgohet të gjithë ofruesve në kategorinë "{name}". Ata do të dërgojnë oferta me çmim, dhe ti zgjedh më të mirën.
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="P.sh. Duhet shtruar parket në 2 dhoma, ~40m²..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput style={styles.input} placeholder="Adresa" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Data e preferuar (YYYY-MM-DD)" value={preferredDate} onChangeText={setPreferredDate} />
      <TextInput
        style={styles.input}
        placeholder="Buxheti yt (opsionale, në Lekë)"
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
      />
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Duke postuar..." : "Posto Kërkesën"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0", padding: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#1B4B43", marginBottom: 6 },
  subtitle: { color: "#666", marginBottom: 16, fontSize: 13, lineHeight: 18 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E0DDD5" },
  textArea: { height: 100, textAlignVertical: "top" },
  btn: { backgroundColor: "#1B4B43", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
