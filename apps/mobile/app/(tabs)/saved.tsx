import { FlatList, StyleSheet, Text, View } from "react-native";
import { demoJobs, formatINRRange } from "@careerconnect/shared";

export default function SavedScreen() {
  const saved = demoJobs.slice(0, 2);
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>YOUR SHORTLIST</Text>
      <Text style={styles.title}>Saved roles</Text>
      <Text style={styles.subtitle}>Keep interesting opportunities close while you decide what’s next.</Text>
      <FlatList data={saved} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }} renderItem={({ item }) => (
        <View style={styles.card}><Text style={styles.job}>{item.title}</Text><Text style={styles.company}>{item.company}</Text><Text style={styles.meta}>{item.location} · {item.work_mode}</Text><Text style={styles.salary}>{formatINRRange(item.salary_min, item.salary_max)}</Text></View>
      )} />
      <Text style={styles.note}>Sample saved roles. Sign in to save opportunities to your account.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 63, paddingHorizontal: 21, backgroundColor: "#F6F8FC" },
  kicker: { color: "#5273DF", letterSpacing: 1.4, fontSize: 9, fontWeight: "800" },
  title: { fontSize: 27, color: "#14233B", fontWeight: "800", marginTop: 7 },
  subtitle: { color: "#7E8CA1", fontSize: 12, lineHeight: 18, marginTop: 8 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E8EDF5", marginBottom: 11 },
  job: { fontSize: 14, fontWeight: "800", color: "#172740" },
  company: { color: "#5E78C7", fontSize: 11, marginTop: 6, fontWeight: "600" },
  meta: { color: "#8794A7", fontSize: 10, marginTop: 10 },
  salary: { color: "#263954", fontSize: 10, fontWeight: "800", marginTop: 12 },
  note: { color: "#99A4B4", fontSize: 10, lineHeight: 15, marginBottom: 18 }
});
