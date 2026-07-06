import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
  weekly: "🔁 Klient i përsëritur — çdo javë",
  biweekly: "🔁 Klient i përsëritur — çdo 2 javë",
  monthly: "🔁 Klient i përsëritur — çdo muaj",
};

export default function ProviderDashboard() {
  const { session } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  const load = useCallback(() => {
    if (!session) return;
    supabase
      .from("service_requests")
      .select("*, profiles(full_name, phone)")
      .eq("provider_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRequests(data || []));
  }, [session]);

  useFocusEffect(load);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) Alert.alert("Gabim", error.message);
    else load();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kërkesat drejt teje</Text>
      <TouchableOpacity style={styles.openJobsBtn} onPress={() => router.push("/open-jobs")}>
        <Text style={styles.openJobsText}>💬 Shiko Punët e Hapura (bëj ofertë)</Text>
      </TouchableOpacity>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Ende s'ke kërkesa.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.client}>{item.profiles?.full_name}</Text>
            <Text style={styles.phone}>{item.profiles?.phone}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            {item.address ? <Text style={styles.meta}>📍 {item.address}</Text> : null}
            {item.preferred_date ? <Text style={styles.meta}>📅 {item.preferred_date}</Text> : null}
            {FREQUENCY_LABELS[item.recurring_frequency] && (
              <Text style={styles.recurringBadge}>{FREQUENCY_LABELS[item.recurring_frequency]}</Text>
            )}
            <Text style={styles.status}>Statusi: {STATUS_LABELS[item.status]}</Text>

            {item.status === "pending" && (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => updateStatus(item.id, "accepted")}>
                  <Text style={styles.actionText}>Prano</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => updateStatus(item.id, "declined")}>
                  <Text style={styles.actionText}>Refuzo</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === "accepted" && (
              <TouchableOpacity style={styles.completeBtn} onPress={() => updateStatus(item.id, "completed")}>
                <Text style={styles.actionText}>Shëno si Përfunduar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  header: { fontSize: 18, fontWeight: "700", color: "#1B4B43", padding: 16, paddingBottom: 0 },
  openJobsBtn: { backgroundColor: "#1B4B43", margin: 16, marginTop: 10, padding: 12, borderRadius: 10 },
  openJobsText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 },
  client: { fontSize: 16, fontWeight: "700", color: "#1B4B43" },
  phone: { color: "#888", marginBottom: 6 },
  desc: { color: "#333" },
  meta: { color: "#666", marginTop: 4 },
  recurringBadge: { marginTop: 6, color: "#2E7D32", fontWeight: "700", fontSize: 13 },
  status: { marginTop: 8, fontWeight: "600", color: "#B8860B" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: "#2E7D32", padding: 10, borderRadius: 8, alignItems: "center" },
  declineBtn: { flex: 1, backgroundColor: "#B3261E", padding: 10, borderRadius: 8, alignItems: "center" },
  completeBtn: { backgroundColor: "#1B4B43", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  actionText: { color: "#fff", fontWeight: "700" },
});
