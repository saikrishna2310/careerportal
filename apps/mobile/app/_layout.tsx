import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F6F8FC" } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
