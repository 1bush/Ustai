import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Gabim", "Plotëso të gjitha fushat e nevojshme.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert("Gabim", error.message);
      return;
    }
    // Krijo profilin
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        phone,
        role: "client",
      });
    }
    setLoading(false);
    Alert.alert("Sukses", "Llogaria u krijua! Tani mund të hysh.", [
      { text: "OK", onPress: () => router.replace("/auth/login") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Krijo Llogari</Text>
      <TextInput style={styles.input} placeholder="Emri i plotë" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Fjalëkalimi" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Duke u regjistruar..." : "Regjistrohu"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>Ke tashmë llogari? Hyr</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F5F0", padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#1B4B43", marginBottom: 24, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0DDD5",
  },
  btn: { backgroundColor: "#1B4B43", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { color: "#1B4B43", textAlign: "center", marginTop: 16, textDecorationLine: "underline" },
});
