import React, { useCallback, useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ShiftControls from "../../../components/ShiftControls";
import { useShiftStore } from "../../../store/useShiftStore";

const INITIAL_REGION = {
  latitude: 0.3008559,
  longitude: 32.5931917,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

export default function ShiftsPage() {
  const mapRef = React.useRef<MapView>(null);

  // Get shift state from Zustand store using individual selectors
  const shiftStatus = useShiftStore((state) => state.status);
  const shiftStartDate = useShiftStore((state) => state.startTime);
  const breakStartTime = useShiftStore((state) => state.breakStartTime);
  const totalBreakTime = useShiftStore((state) => state.totalBreakTime);

  const [elapsedTime, setElapsedTime] = useState("0h 0m 0s");
  const [breakDuration, setBreakDuration] = useState("0h 0m 0s");

  const onRegionChange = (region: Region) => {
    console.log("Region changed:", region);
  };

  // Format duration in milliseconds to "Xh Ym Zs" format
  const formatDuration = useCallback((durationMs: number): string => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);

  // Update time displays
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (shiftStatus !== "idle" && shiftStartDate) {
      intervalId = setInterval(() => {
        if (shiftStatus === "active") {
          const elapsedMs =
            new Date().getTime() - shiftStartDate.getTime() - totalBreakTime;
          setElapsedTime(formatDuration(elapsedMs));
        } else if (shiftStatus === "break" && breakStartTime) {
          const breakMs = new Date().getTime() - breakStartTime.getTime();
          setBreakDuration(formatDuration(breakMs));
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    shiftStatus,
    shiftStartDate,
    breakStartTime,
    totalBreakTime,
    formatDuration,
  ]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#007aff" }}
        edges={["top"]}
      >
        <View style={styles.container}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
            onRegionChangeComplete={onRegionChange}
            ref={mapRef}
          >
            {
              <Marker
                coordinate={{
                  latitude: 0.3008559,
                  longitude: 32.5931917,
                }}
              >
                <Callout>
                  <View>
                    <Text>Cavendish University Uganda</Text>
                  </View>
                </Callout>
              </Marker>
            }
          </MapView>

          {/* Shift Controls overlaid on map */}
          <ShiftControls variant="compact" />

          {/* Shift Status Indicator */}
          {shiftStatus !== "idle" && (
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor:
                    shiftStatus === "break"
                      ? "rgba(255, 193, 7, 0.8)"
                      : "rgba(0, 122, 255, 0.8)",
                },
              ]}
            >
              <View style={styles.statusContent}>
                <Text style={styles.statusText}>
                  {shiftStatus === "active" ? "Shift In Progress" : "On Break"}
                </Text>
                <Text style={styles.timeText}>
                  {shiftStatus === "active" ? elapsedTime : breakDuration}
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  statusBanner: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  statusContent: {
    width: "100%",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },
});
