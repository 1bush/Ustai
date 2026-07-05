import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

export default function BookingForm() {
  const { providerId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!description) {
      Alert.alert("Gabim", "Përshkruaj shkurt problemin/shërbimin që kërkon.");
      return;
    }
    setLoading(true);

    const { data: provider } = await supabase.from("providers").select("category_id").eq("id", providerId).single();

    const { error } = await supabase.from("service_requests").insert({
      client_id: session.user.id,
      provider_id: providerId,
      category_id: provider?.category_id,
      description,
      address,
      preferred_date: preferredDate || null,
      status: "pending",
    });

    setLoading(false);
    if (error) {
      Alert.alert("Gabim", error.message);
    } else {
      Alert.alert("U dërgua!", "Kërkesa jote iu dërgua ofruesit. Do të njoftohesh kur ta konfirmojë.", [
        { text: "OK", onPress: () => router.replace("/my-requests") },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Përshkruaj kërkesën tënde</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="P.sh. Rrjedhje uji te lavamani i kuzhinës..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput style={styles.input} placeholder="Adresa" value={address} onChangeText={setAddress} />
      <TextInput
        style={styles.input}
        placeholder="Data e preferuar (YYYY-MM-DD)"
        value={preferredDate}
        onChangeText={setPreferredDate}
      />
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Duke dërguar..." : "Dërgo Kërkesën"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0", padding: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#1B4B43", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0DDD5",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  btn: { backgroundColor: "#1B4B43", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
