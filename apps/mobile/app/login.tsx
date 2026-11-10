import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!supabase) {
      Alert.alert("Supabase is not configured", "Add the mobile environment variables from .env.example and restart Expo.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      Alert.alert("Name required", "Enter your full name to create an account.");
      return;
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert("Check your email", "Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password too short", "Use a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const response = mode === "login"
        ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        : await supabase.auth.signUp({ email: normalizedEmail, password, options: { data: { full_name: name.trim(), role: "student" } } });
      if (response.error) {
        Alert.alert("Authentication error", response.error.message);
        return;
      }
      if (mode === "signup" && !response.data.session) {
        Alert.alert("Check your email", "Confirm your email address before signing in.");
        setMode("login");
        return;
      }
      router.replace("/(tabs)/profile");
    } catch (error) {
      Alert.alert("Connection error", error instanceof Error ? error.message : "Unable to contact the authentication service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Link href="/(tabs)" style={styles.back}>‹  Back to CareerConnect</Link>
      <Text style={styles.kicker}>CAREERCONNECT ACCOUNT</Text>
      <Text style={styles.title}>{mode === "login" ? "Welcome back." : "Create your account."}</Text>
      <Text style={styles.subtitle}>Sign in to manage your career profile and applications.</Text>
      {mode === "signup" && <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} placeholderTextColor="#98A5B6" />}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor="#98A5B6" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password (min. 8 characters)" secureTextEntry style={styles.input} placeholderTextColor="#98A5B6" />
      <Pressable onPress={() => void submit()} style={styles.button} disabled={busy}>{busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{mode === "login" ? "Sign in" : "Create account"}</Text>}</Pressable>
      <Text style={styles.switchText}>{mode === "login" ? "New to CareerConnect? " : "Already have an account? "}<Text onPress={() => setMode(mode === "login" ? "signup" : "login")} style={styles.switchLink}>{mode === "login" ? "Create account" : "Sign in"}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8FC", paddingTop: 60, paddingHorizontal: 24 },
  back: { color: "#64758D", fontSize: 11, marginBottom: 40 },
  kicker: { color: "#5273DF", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: "#14233B", fontSize: 28, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#7E8CA1", fontSize: 12, lineHeight: 18, marginTop: 9, marginBottom: 24 },
  input: { height: 48, borderWidth: 1, borderColor: "#E2E8F1", backgroundColor: "#FFFFFF", borderRadius: 9, paddingHorizontal: 13, marginBottom: 12, fontSize: 12, color: "#14233B" },
  button: { height: 47, backgroundColor: "#4169E1", borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 6 },
  buttonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  switchText: { color: "#8794A7", fontSize: 11, marginTop: 22, textAlign: "center" },
  switchLink: { color: "#4169E1", fontWeight: "800" }
});
