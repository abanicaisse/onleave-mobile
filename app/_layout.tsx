import { Stack } from "expo-router";
import React from "react";

import { useAuthStore } from "@/store/authStore";
import "../global.css";

import { useEffect } from "react";
import type { AppStateStatus } from "react-native";
import { AppState, Platform } from "react-native";

import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";

import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";

// Create QueryClient outside component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch();
    }, [refetch])
  );
}

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });

  function onAppStateChange(status: AppStateStatus) {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup-attempt" />
      </Stack>
    </QueryClientProvider>
  );
}
