import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const STATUS_LABELS = {
  pending: "Në pritje",
  accepted: "Pranuar",
  declined: "Refuzuar",
  completed: "Përfunduar",
  cancelled: "Anulluar",
};

const FREQUENCY_LABELS = {
  none: null,
  weekly: "🔁 Çdo javë",
  biweekly: "🔁 Çdo 2 javë",
  monthly: "🔁 Çdo muaj",
};

export default function MyRequests() {
  const { session } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [ratingFor, setRatingFor] = useState(null);
  const [ratingValue, setRatingValue] = useState("5");
  const [comment, setComment] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [offersByRequest, setOffersByRequest] = useState({});

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("service_requests")
      .select("*, providers(profiles(full_name))")
      .eq("client_id", session.user.id)
      .order("created_at", { ascending: false });
    setRequests(data || []);

    const openIds = (data || []).filter((r) => r.is_open).map((r) => r.id);
    if (openIds.length > 0) {
      const { data: offers } = await supabase
        .from("job_offers")
        .select("*, providers(profiles(full_name), rating_avg, rating_count)")
        .in("request_id", openIds)
        .order("price", { ascending: true });
      const grouped = {};
      (offers || []).forEach((o) => {
        grouped[o.request_id] = grouped[o.request_id] || [];
        grouped[o.request_id].push(o);
      });
      setOffersByRequest(grouped);
    }

    supabase
      .from("favorites")
      .select("provider_id")
      .eq("client_id", session.user.id)
      .then(({ data }) => setFavoriteIds(new Set((data || []).map((f) => f.provider_id))));
  }, [session]);

  useFocusEffect(load);

  const selectOffer = async (request, offer) => {
    Alert.alert("Konfirmo", `Të zgjedhësh ${offer.providers?.profiles?.full_name} për ${offer.price} Lekë?`, [
      { text: "Anulo", style: "cancel" },
      {
        text: "Po, zgjidh",
        onPress: async () => {
          await supabase
            .from("service_requests")
            .update({ provider_id: offer.provider_id, is_open: false, status: "accepted", selected_offer_id: offer.id })
            .eq("id", request.id);
          await supabase.from("job_offers").update({ status: "selected" }).eq("id", offer.id);
          await supabase
            .from("job_offers")
            .update({ status: "rejected" })
            .eq("request_id", request.id)
            .neq("id", offer.id);
          load();
        },
      },
    ]);
  };

  const toggleFavorite = async (providerId) => {
    if (favoriteIds.has(providerId)) {
      await supabase.from("favorites").delete().eq("client_id", session.user.id).eq("provider_id", providerId);
    } else {
      await supabase.from("favorites").insert({ client_id: session.user.id, provider_id: providerId });
    }
    load();
  };

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
            <View style={styles.rowBetween}>
              <Text style={styles.provider}>{item.providers?.profiles?.full_name}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.provider_id)}>
                <Text style={styles.favIcon}>{favoriteIds.has(item.provider_id) ? "★" : "☆"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            {FREQUENCY_LABELS[item.recurring_frequency] && (
              <Text style={styles.recurring}>{FREQUENCY_LABELS[item.recurring_frequency]}</Text>
            )}
            <Text style={styles.status}>Statusi: {STATUS_LABELS[item.status]}</Text>

            {item.is_open && item.status === "pending" && (
              <View style={styles.offersBox}>
                <Text style={styles.offersHeader}>
                  Oferta të marra: {(offersByRequest[item.id] || []).length}
                </Text>
                {(offersByRequest[item.id] || []).map((offer) => (
                  <View key={offer.id} style={styles.offerCard}>
                    <Text style={styles.offerProvider}>{offer.providers?.profiles?.full_name}</Text>
                    <Text style={styles.offerPrice}>{offer.price} Lekë</Text>
                    <Text style={styles.offerRating}>
                      ⭐ {offer.providers?.rating_avg || "S'ka vlerësime"} ({offer.providers?.rating_count || 0})
                    </Text>
                    {offer.message ? <Text style={styles.offerMsg}>"{offer.message}"</Text> : null}
                    <TouchableOpacity style={styles.selectBtn} onPress={() => selectOffer(item, offer)}>
                      <Text style={styles.selectBtnText}>Zgjidh këtë ofertë</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionsRow}>
              {item.status === "completed" && ratingFor !== item.id && (
                <TouchableOpacity onPress={() => setRatingFor(item.id)}>
                  <Text style={styles.rateLink}>Lër një vlerësim</Text>
                </TouchableOpacity>
              )}
              {(item.status === "completed" || item.status === "declined" || item.status === "cancelled") && (
                <TouchableOpacity onPress={() => router.push(`/booking/${item.provider_id}`)}>
                  <Text style={styles.rebookLink}>↻ Rezervo Përsëri</Text>
                </TouchableOpacity>
              )}
            </View>

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
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  provider: { fontSize: 16, fontWeight: "700", color: "#1B4B43" },
  favIcon: { fontSize: 22, color: "#B8860B" },
  desc: { color: "#444", marginTop: 4 },
  recurring: { color: "#1B4B43", fontWeight: "600", marginTop: 4, fontSize: 13 },
  status: { marginTop: 8, fontWeight: "600", color: "#B8860B" },
  actionsRow: { flexDirection: "row", gap: 16, marginTop: 6 },
  rateLink: { marginTop: 10, color: "#1B4B43", textDecorationLine: "underline" },
  rebookLink: { marginTop: 10, color: "#2E7D32", fontWeight: "700" },
  offersBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#F0EEE8", paddingTop: 10 },
  offersHeader: { fontWeight: "700", color: "#1B4B43", marginBottom: 8 },
  offerCard: { backgroundColor: "#F7F5F0", padding: 10, borderRadius: 8, marginBottom: 8 },
  offerProvider: { fontWeight: "700", color: "#1B4B43" },
  offerPrice: { fontSize: 16, fontWeight: "700", color: "#2E7D32", marginTop: 2 },
  offerRating: { color: "#B8860B", marginTop: 2 },
  offerMsg: { fontStyle: "italic", color: "#555", marginTop: 4 },
  selectBtn: { backgroundColor: "#1B4B43", padding: 8, borderRadius: 8, alignItems: "center", marginTop: 8 },
  selectBtnText: { color: "#fff", fontWeight: "700" },
  ratingBox: { marginTop: 10, gap: 8 },
  ratingInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8, width: 60 },
  commentInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8 },
  submitBtn: { backgroundColor: "#1B4B43", padding: 10, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "600" },
});
