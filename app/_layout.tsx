import { Stack } from "expo-router";

import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={false}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Protected guard={false}>
        <Stack.Screen name="/login" />
      </Stack.Protected>
      <Stack.Protected guard={false}>
        <Stack.Screen name="/signup-attempt" />
      </Stack.Protected>
    </Stack>
  );
}
