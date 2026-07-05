import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const STATUS_LABELS = {
  pending: "Në pritje",
  accepted: "Pranuar",
  declined: "Refuzuar",
  completed: "Përfunduar",
  cancelled: "Anulluar",
};

export default function MyRequests() {
  const { session } = useAuth();
  const [requests, setRequests] = useState([]);
  const [ratingFor, setRatingFor] = useState(null);
  const [ratingValue, setRatingValue] = useState("5");
  const [comment, setComment] = useState("");

  const load = useCallback(() => {
    if (!session) return;
    supabase
      .from("service_requests")
      .select("*, providers(profiles(full_name))")
      .eq("client_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRequests(data || []));
  }, [session]);

  useFocusEffect(load);

  const submitReview = async (req) => {
    const { error } = await supabase.from("reviews").insert({
      service_request_id: req.id,
      provider_id: req.provider_id,
      client_id: session.user.id,
      rating: parseInt(ratingValue, 10),
      comment,
    });
    if (error) {
      Alert.alert("Gabim", error.message);
    } else {
      Alert.alert("Faleminderit!", "Vlerësimi u dërgua.");
      setRatingFor(null);
      setComment("");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Ende s'ke bërë asnjë kërkesë.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.provider}>{item.providers?.profiles?.full_name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.status}>Statusi: {STATUS_LABELS[item.status]}</Text>

            {item.status === "completed" && ratingFor !== item.id && (
              <TouchableOpacity onPress={() => setRatingFor(item.id)}>
                <Text style={styles.rateLink}>Lër një vlerësim</Text>
              </TouchableOpacity>
            )}

            {ratingFor === item.id && (
              <View style={styles.ratingBox}>
                <TextInput
                  style={styles.ratingInput}
                  placeholder="1-5"
                  keyboardType="numeric"
                  value={ratingValue}
                  onChangeText={setRatingValue}
                />
                <TextInput
                  style={styles.commentInput}
                  placeholder="Koment (opsionale)"
                  value={comment}
                  onChangeText={setComment}
                />
                <TouchableOpacity style={styles.submitBtn} onPress={() => submitReview(item)}>
                  <Text style={styles.submitBtnText}>Dërgo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
  provider: { fontSize: 16, fontWeight: "700", color: "#1B4B43" },
  desc: { color: "#444", marginTop: 4 },
  status: { marginTop: 8, fontWeight: "600", color: "#B8860B" },
  rateLink: { marginTop: 10, color: "#1B4B43", textDecorationLine: "underline" },
  ratingBox: { marginTop: 10, gap: 8 },
  ratingInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8, width: 60 },
  commentInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8 },
  submitBtn: { backgroundColor: "#1B4B43", padding: 10, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "600" },
});
