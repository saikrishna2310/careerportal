import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { demoJobs, formatINRRange, titleCase, type Job } from "@careerconnect/shared";
import { supabase } from "@/lib/supabase";

export default function ExploreScreen() {
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error: requestError } = await supabase
        .from("jobs")
        .select("id,title,slug,location,work_mode,employment_type,experience_level,salary_min,salary_max,salary_currency,description,status,created_at,companies(name)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (requestError) {
        setError("Showing sample roles. Connect and configure your Supabase database to load live vacancies.");
      } else if (data?.length) {
        setJobs(data.map((row: any) => ({ ...row, company: row.companies?.name ?? "Verified employer" })) as Job[]);
        setError("");
      } else {
        setJobs([]);
        setError("No published opportunities yet.");
      }
    } catch {
      setError("Unable to reach Supabase. Check your connection and project configuration.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadJobs(); }, [loadJobs]);

  const filtered = jobs.filter((job) => `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query.toLowerCase()));

  const applyToJob = async (jobId: string) => {
    if (!supabase) return Alert.alert("Connect your account", "Configure Supabase and sign in before applying.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Alert.alert("Sign in required", "Please sign in before applying.");
    const picked = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const file = picked.assets[0];
    if (file.size && file.size > 10 * 1024 * 1024) return Alert.alert("File too large", "Resume must be 10 MB or smaller.");
    setApplyingId(jobId);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    let uploaded = false;
    try {
      const response = await fetch(file.uri);
      if (!response.ok) throw new Error("Unable to read the selected resume file.");
      const blob = await response.blob();
      const upload = await supabase.storage.from("resumes").upload(path, blob, { contentType: file.mimeType ?? (file.name.toLowerCase().endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : file.name.toLowerCase().endsWith(".doc") ? "application/msword" : "application/pdf"), upsert: false });
      if (upload.error) throw new Error(upload.error.message);
      uploaded = true;
      const result = await supabase.from("applications").insert({ job_id: jobId, applicant_id: user.id, resume_path: path });
      if (result.error) {
        await supabase.storage.from("resumes").remove([path]);
        uploaded = false;
        Alert.alert("Application not submitted", result.error.code === "23505" ? "You have already applied for this job." : result.error.message);
      } else {
        Alert.alert("Application submitted", "Track your progress in the Applied tab.");
      }
    } catch (error) {
      if (uploaded) await supabase.storage.from("resumes").remove([path]);
      Alert.alert("Application failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View><Text style={styles.kicker}>CAREERCONNECT</Text><Text style={styles.heading}>Find your next move.</Text></View>
          <Link href="/login" asChild><Pressable style={styles.avatar}><Text style={styles.avatarText}>JD</Text></Pressable></Link>
        </View>
        <Text style={styles.subheading}>Curated opportunities for your next chapter.</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search roles, companies, locations" placeholderTextColor="#98A5B6" style={styles.search} />
      </View>

      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Recommended roles</Text><Text style={styles.sectionSub}>{jobs.length} opportunities to explore</Text></View><Text style={styles.filterLabel}>LATEST</Text></View>
      {error ? <Text style={styles.notice}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#4169E1" style={{ marginTop: 30 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadJobs(); }} tintColor="#4169E1" />}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobTop}><View style={styles.companyMark}><Text style={styles.companyMarkText}>{item.company.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={styles.jobTitle}>{item.title}</Text><Text style={styles.company}>{item.company}</Text></View><Pressable accessibilityLabel="Save job" style={styles.bookmark}><Text style={styles.bookmarkText}>＋</Text></Pressable></View>
              <View style={styles.metaRow}><Text style={styles.meta}>{item.location}</Text><Text style={styles.dot}>·</Text><Text style={styles.meta}>{titleCase(item.work_mode)}</Text><Text style={styles.dot}>·</Text><Text style={styles.meta}>{titleCase(item.employment_type)}</Text></View>
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardBottom}><Text style={styles.salary}>{formatINRRange(item.salary_min, item.salary_max)}</Text><Pressable disabled={applyingId === item.id} onPress={() => void applyToJob(item.id)}><Text style={styles.details}>{applyingId === item.id ? "Submitting..." : "Apply now →"}</Text></Pressable></View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No roles match your search.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8FC" },
  header: { backgroundColor: "#FFFFFF", paddingTop: 56, paddingHorizontal: 21, paddingBottom: 21, borderBottomWidth: 1, borderBottomColor: "#E8EDF5" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kicker: { color: "#5273DF", fontSize: 9, letterSpacing: 1.5, fontWeight: "800" },
  heading: { color: "#14233B", fontSize: 25, fontWeight: "800", marginTop: 7, letterSpacing: -0.6 },
  subheading: { color: "#7E8CA1", fontSize: 12, marginTop: 8 },
  avatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: "#EAF0FF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#4169E1", fontWeight: "800", fontSize: 11 },
  search: { height: 45, borderWidth: 1, borderColor: "#E4EAF2", backgroundColor: "#F8FAFD", borderRadius: 10, marginTop: 19, paddingHorizontal: 13, color: "#14233B", fontSize: 12 },
  sectionHeader: { paddingHorizontal: 21, paddingTop: 21, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#192943" },
  sectionSub: { color: "#8B98AA", fontSize: 10, marginTop: 4 },
  filterLabel: { fontSize: 9, color: "#5273DF", fontWeight: "800", letterSpacing: 1 },
  notice: { color: "#667995", marginHorizontal: 21, fontSize: 10, lineHeight: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  jobCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 13, borderWidth: 1, borderColor: "#E8EDF5", marginBottom: 11 },
  jobTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  companyMark: { width: 39, height: 39, borderRadius: 11, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  companyMarkText: { color: "#4968D1", fontWeight: "800", fontSize: 16 },
  jobTitle: { color: "#172740", fontSize: 13, fontWeight: "800" },
  company: { color: "#5E78C7", fontSize: 11, marginTop: 4, fontWeight: "600" },
  bookmark: { borderWidth: 1, borderColor: "#E6EBF3", width: 31, height: 31, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bookmarkText: { color: "#6B7B92", fontSize: 18, lineHeight: 21 },
  metaRow: { flexDirection: "row", gap: 7, marginTop: 14, alignItems: "center", flexWrap: "wrap" },
  meta: { fontSize: 9, color: "#8794A7" },
  dot: { color: "#BBC4D1", fontSize: 11 },
  description: { fontSize: 10, color: "#6E7C91", lineHeight: 16, marginTop: 12 },
  cardBottom: { borderTopWidth: 1, borderTopColor: "#F0F2F6", marginTop: 13, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  salary: { color: "#263954", fontSize: 10, fontWeight: "800" },
  details: { color: "#4169E1", fontSize: 10, fontWeight: "800" },
  empty: { color: "#8B98AA", textAlign: "center", padding: 35, fontSize: 12 }
});
