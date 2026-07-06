import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function OpenJobs() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myProvider, setMyProvider] = useState(null);
  const [offerFor, setOfferFor] = useState(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [myOffers, setMyOffers] = useState({});

  const load = useCallback(async () => {
    if (!session) return;
    const { data: provider } = await supabase.from("providers").select("*").eq("id", session.user.id).single();
    setMyProvider(provider);
    if (!provider) return;

    const { data: openJobs } = await supabase
      .from("service_requests")
      .select("*, profiles(full_name)")
      .eq("category_id", provider.category_id)
      .eq("is_open", true)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setJobs(openJobs || []);

    const { data: offers } = await supabase
      .from("job_offers")
      .select("request_id, price, status")
      .eq("provider_id", session.user.id);
    const map = {};
    (offers || []).forEach((o) => (map[o.request_id] = o));
    setMyOffers(map);
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const submitOffer = async (job) => {
    if (!price) {
      Alert.alert("Gabim", "Vendos një çmim për ofertën tënde.");
      return;
    }
    const { error } = await supabase.from("job_offers").insert({
      request_id: job.id,
      provider_id: session.user.id,
      price: parseFloat(price),
      message,
    });
    if (error) {
      Alert.alert("Gabim", error.message);
    } else {
      Alert.alert("U dërgua!", "Oferta jote iu dërgua klientit.");
      setOfferFor(null);
      setPrice("");
      setMessage("");
      load();
    }
  };

  if (!myProvider) {
    return <Text style={styles.empty}>Duhet të jesh i regjistruar si ofrues për të parë punët e hapura.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Punë të Hapura — {myProvider.category_id ? "kategoria jote" : ""}</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Ende s'ka punë të hapura në kategorinë tënde.</Text>}
        renderItem={({ item }) => {
          const myOffer = myOffers[item.id];
          return (
            <View style={styles.card}>
              <Text style={styles.client}>{item.profiles?.full_name}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              {item.address ? <Text style={styles.meta}>📍 {item.address}</Text> : null}
              {item.budget ? <Text style={styles.meta}>💰 Buxheti i klientit: {item.budget} Lekë</Text> : null}

              {myOffer ? (
                <View style={styles.myOfferBox}>
                  <Text style={styles.myOfferText}>
                    Oferta jote: {myOffer.price} Lekë —{" "}
                    {myOffer.status === "selected" ? "✅ U zgjodh!" : myOffer.status === "rejected" ? "S'u zgjodh" : "Në pritje"}
                  </Text>
                </View>
              ) : offerFor === item.id ? (
                <View style={styles.offerForm}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Çmimi yt (Lekë)"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <TextInput
                    style={styles.msgInput}
                    placeholder="Mesazh shkurt (opsionale)"
                    value={message}
                    onChangeText={setMessage}
                  />
                  <TouchableOpacity style={styles.submitBtn} onPress={() => submitOffer(item)}>
                    <Text style={styles.submitBtnText}>Dërgo Ofertën</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.offerBtn} onPress={() => setOfferFor(item.id)}>
                  <Text style={styles.offerBtnText}>Bëj Ofertë</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  header: { fontSize: 18, fontWeight: "700", color: "#1B4B43", padding: 16, paddingBottom: 0 },
  empty: { textAlign: "center", marginTop: 40, color: "#888", paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
  client: { fontSize: 16, fontWeight: "700", color: "#1B4B43" },
  desc: { color: "#333", marginTop: 4 },
  meta: { color: "#666", marginTop: 4 },
  myOfferBox: { marginTop: 10, backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8 },
  myOfferText: { fontWeight: "600", color: "#1B4B43" },
  offerBtn: { backgroundColor: "#1B4B43", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  offerBtnText: { color: "#fff", fontWeight: "700" },
  offerForm: { marginTop: 12, gap: 8 },
  priceInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8 },
  msgInput: { backgroundColor: "#F0EEE8", padding: 10, borderRadius: 8 },
  submitBtn: { backgroundColor: "#2E7D32", padding: 10, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700" },
});
