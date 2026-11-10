import { Tabs } from "expo-router";
import { BriefcaseBusiness, Bookmark, UserRound, FileText } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#4169E1",
      tabBarInactiveTintColor: "#91A0B4",
      tabBarStyle: { height: 63, paddingTop: 8, paddingBottom: 8, borderTopColor: "#E8EDF5", backgroundColor: "#FFFFFF" },
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600" }
    }}>
      <Tabs.Screen name="index" options={{ title: "Explore", tabBarIcon: ({ color, size }) => <BriefcaseBusiness color={color} size={size} /> }} />
      <Tabs.Screen name="applications" options={{ title: "Applied", tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
      <Tabs.Screen name="saved" options={{ title: "Saved", tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
