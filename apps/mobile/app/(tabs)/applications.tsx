import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";

type ApplicationRow = { id: string; status: string; submitted_at: string; jobs: { title: string; companies: { name: string } | null } | null };
export default function ApplicationsScreen() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) { setLoading(false); setError("Connect Supabase to view your applications."); return; }
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let alive = true;
    const load = async () => {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) { if (alive) { setError("Sign in to track applications."); setLoading(false); } return; }
      const { data, error: requestError } = await supabase!.from("applications").select("id,status,submitted_at,jobs(title,companies(name))").eq("applicant_id", user.id).order("submitted_at", { ascending: false });
      if (!alive) return;
      if (requestError) setError(requestError.message); else setRows((data ?? []) as unknown as ApplicationRow[]);
      setLoading(false);
      channel = supabase!.channel(`mobile-applications-${user.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "applications", filter: `applicant_id=eq.${user.id}` }, (payload) => setRows((current) => current.map((row) => row.id === payload.new.id ? { ...row, status: payload.new.status as string } : row))).subscribe();
    };
    void load();
    return () => { alive = false; if (channel) void supabase!.removeChannel(channel); };
  }, []);
  return <View style={styles.screen}><Text style={styles.kicker}>CANDIDATE WORKSPACE</Text><Text style={styles.title}>My applications</Text><Text style={styles.subtitle}>Live progress from the hiring teams.</Text>{loading ? <ActivityIndicator color="#4169E1" style={{ marginTop: 30 }} /> : error ? <Text style={styles.empty}>{error}</Text> : <FlatList data={rows} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }} ListEmptyComponent={<Text style={styles.empty}>You have not applied to any roles yet.</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.job}>{item.jobs?.title ?? "Job opening"}</Text><Text style={styles.company}>{item.jobs?.companies?.name ?? "Company"}</Text><View style={styles.row}><Text style={styles.date}>{new Date(item.submitted_at).toLocaleDateString("en-IN")}</Text><Text style={styles.status}>{item.status.replaceAll("_", " ").toUpperCase()}</Text></View></View>} />}</View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, paddingTop: 63, paddingHorizontal: 21, backgroundColor: "#F6F8FC" }, kicker: { color: "#5273DF", letterSpacing: 1.4, fontSize: 9, fontWeight: "800" }, title: { fontSize: 27, color: "#14233B", fontWeight: "800", marginTop: 7 }, subtitle: { color: "#7E8CA1", fontSize: 12, marginTop: 8 }, card: { backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E8EDF5", marginBottom: 11 }, job: { fontSize: 14, fontWeight: "800", color: "#172740" }, company: { color: "#5E78C7", fontSize: 11, marginTop: 6 }, row: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 }, date: { color: "#8794A7", fontSize: 10 }, status: { color: "#4169E1", fontWeight: "800", fontSize: 10 }, empty: { color: "#8794A7", fontSize: 12, paddingTop: 28 } });
