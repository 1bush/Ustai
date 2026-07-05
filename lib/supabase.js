import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Zëvendëso me URL dhe anon key nga projekti yt Supabase
// (Settings -> API te dashboard i Supabase)
const SUPABASE_URL = "https://gbpdosteodhnjblxmlgu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGRvc3Rlb2RobmpibHhtbGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzk2MjEsImV4cCI6MjA5ODg1NTYyMX0.nomVoz09svynXPfRrnFVmkXuLKwS1oakG-DJfxnP3a8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
