import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#1B4B43" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#1B4B43" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="index" options={{ title: "Shërbime Shtëpiake" }} />
        <Stack.Screen name="auth/login" options={{ title: "Hyrje" }} />
        <Stack.Screen name="auth/signup" options={{ title: "Regjistrohu" }} />
        <Stack.Screen name="category/[id]" options={{ title: "Ofruesit" }} />
        <Stack.Screen name="provider/[id]" options={{ title: "Profili i Ofruesit" }} />
        <Stack.Screen name="booking/[providerId]" options={{ title: "Kërko Shërbim" }} />
        <Stack.Screen name="my-requests" options={{ title: "Kërkesat e mia" }} />
        <Stack.Screen name="provider-dashboard" options={{ title: "Paneli i Ofruesit" }} />
        <Stack.Screen name="provider-onboard" options={{ title: "Bëhu Ofrues" }} />
      </Stack>
    </AuthProvider>
  );
}
