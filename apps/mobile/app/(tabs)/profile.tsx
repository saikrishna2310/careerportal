import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Unable to sign out", error.message);
    else setUser(null);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>YOUR ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.email?.slice(0, 1).toUpperCase() ?? "G"}</Text></View>
        {loading ? <ActivityIndicator color="#4169E1" /> : <>
          <Text style={styles.name}>{user?.user_metadata?.full_name ?? (user ? "CareerConnect member" : "Guest profile")}</Text>
          <Text style={styles.email}>{user?.email ?? "Sign in to sync your profile and applications."}</Text>
          {user ? <Pressable onPress={() => void signOut()} style={styles.primary}><Text style={styles.primaryText}>Sign out</Text></Pressable> : <Link href="/login" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Sign in or create account</Text></Pressable></Link>}
        </>}
      </View>
      <View style={styles.infoCard}><Text style={styles.infoTitle}>Build your career profile</Text><Text style={styles.infoText}>Add your experience, skills, education, and resume to help recruiters understand your strengths.</Text><Text style={styles.infoLink} onPress={() => router.push("/login")}>Get started →</Text></View>
      <Text style={styles.footer}>CareerConnect · v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 63, paddingHorizontal: 21, backgroundColor: "#F6F8FC" },
  kicker: { color: "#5273DF", letterSpacing: 1.4, fontSize: 9, fontWeight: "800" },
  title: { fontSize: 27, color: "#14233B", fontWeight: "800", marginTop: 7, marginBottom: 18 },
  profileCard: { backgroundColor: "white", borderWidth: 1, borderColor: "#E8EDF5", borderRadius: 14, padding: 22, alignItems: "center" },
  avatar: { width: 65, height: 65, borderRadius: 33, backgroundColor: "#EAF0FF", alignItems: "center", justifyContent: "center", marginBottom: 13 },
  avatarText: { color: "#4169E1", fontSize: 23, fontWeight: "800" },
  name: { color: "#172740", fontSize: 16, fontWeight: "800" },
  email: { color: "#8B98AA", fontSize: 11, marginTop: 5, textAlign: "center" },
  primary: { backgroundColor: "#4169E1", borderRadius: 9, paddingVertical: 12, paddingHorizontal: 18, marginTop: 19, width: "100%", alignItems: "center" },
  primaryText: { color: "white", fontSize: 11, fontWeight: "800" },
  infoCard: { backgroundColor: "#F0F4FF", borderColor: "#DFE7FF", borderWidth: 1, borderRadius: 12, padding: 17, marginTop: 14 },
  infoTitle: { color: "#2C477F", fontWeight: "800", fontSize: 12 },
  infoText: { color: "#63769D", fontSize: 10, lineHeight: 16, marginTop: 7 },
  infoLink: { color: "#4169E1", fontWeight: "800", fontSize: 10, marginTop: 13 },
  footer: { textAlign: "center", color: "#A1ABBA", fontSize: 9, marginTop: 25 }
});
