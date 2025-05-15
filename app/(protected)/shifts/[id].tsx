import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompletedShift, useShiftStore } from "../../../store/useShiftStore";

export default function ShiftDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [shift, setShift] = useState<CompletedShift | null>(null);
  const completedShifts = useShiftStore((state) => state.completedShifts);

  useEffect(() => {
    if (id) {
      const foundShift = completedShifts.find((s) => s.id === id);
      setShift(foundShift || null);
    }
  }, [id, completedShifts]);

  // Format duration for display
  const formatDuration = (durationMs: number): string => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (!shift) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shift Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Text>Shift not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate the map region based on all available location points
  const getMapRegion = () => {
    const locations = [];

    if (shift.startLocation) locations.push(shift.startLocation);
    if (shift.endLocation) locations.push(shift.endLocation);
    if (shift.breakLocations) {
      shift.breakLocations.forEach((loc) => {
        locations.push(loc.start);
        locations.push(loc.end);
      });
    }

    // If no locations, return default region
    if (locations.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Find min and max lat/lng
    let minLat = locations[0].latitude;
    let maxLat = locations[0].latitude;
    let minLng = locations[0].longitude;
    let maxLng = locations[0].longitude;

    locations.forEach((loc) => {
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
    });

    // Calculate center and delta
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Add padding
    const latDelta = (maxLat - minLat) * 1.5 || 0.01;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(0.01, latDelta),
      longitudeDelta: Math.max(0.01, lngDelta),
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Shift Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shift Summary</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{shift.date}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {shift.startTime} - {shift.endTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>
              {formatDuration(shift.duration)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Breaks:</Text>
            <Text style={styles.infoValue}>
              {shift.breakCount} breaks ({formatDuration(shift.totalBreakTime)})
            </Text>
          </View>
        </View>

        {/* Location Map */}
        {(shift.startLocation || shift.endLocation || shift.breakLocations) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Data</Text>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={getMapRegion()}
              >
                {/* Shift start location */}
                {shift.startLocation && (
                  <Marker
                    coordinate={{
                      latitude: shift.startLocation.latitude,
                      longitude: shift.startLocation.longitude,
                    }}
                    pinColor="green"
                  >
                    <Callout>
                      <View>
                        <Text>Shift Started</Text>
                        <Text>{shift.startTime}</Text>
                      </View>
                    </Callout>
                  </Marker>
                )}

                {/* Shift end location */}
                {shift.endLocation && (
                  <Marker
                    coordinate={{
                      latitude: shift.endLocation.latitude,
                      longitude: shift.endLocation.longitude,
                    }}
                    pinColor="red"
                  >
                    <Callout>
                      <View>
                        <Text>Shift Ended</Text>
                        <Text>{shift.endTime}</Text>
                      </View>
                    </Callout>
                  </Marker>
                )}

                {/* Break locations */}
                {shift.breakLocations &&
                  shift.breakLocations.map((location, index) => (
                    <React.Fragment key={`break-${index}`}>
                      <Marker
                        coordinate={{
                          latitude: location.start.latitude,
                          longitude: location.start.longitude,
                        }}
                        pinColor="#ffc107"
                      >
                        <Callout>
                          <View>
                            <Text>Break Started</Text>
                            <Text>Break #{index + 1}</Text>
                          </View>
                        </Callout>
                      </Marker>

                      <Marker
                        coordinate={{
                          latitude: location.end.latitude,
                          longitude: location.end.longitude,
                        }}
                        pinColor="blue"
                      >
                        <Callout>
                          <View>
                            <Text>Break Ended</Text>
                            <Text>Break #{index + 1}</Text>
                          </View>
                        </Callout>
                      </Marker>
                    </React.Fragment>
                  ))}
              </MapView>
            </View>

            <Text style={styles.mapLegend}>
              🟢 Shift Start • 🔴 Shift End • 🟠 Break Start • 🔵 Break End
            </Text>
          </View>
        )}

        {/* Break History */}
        {shift.breakCount > 0 && shift.breakLocations && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Break History</Text>

            {shift.breakLocations.map((location, index) => (
              <View key={`break-details-${index}`} style={styles.breakItem}>
                <Text style={styles.breakTitle}>Break #{index + 1}</Text>

                <Text style={styles.breakLocation}>
                  Started at: {location.start.latitude.toFixed(6)},{" "}
                  {location.start.longitude.toFixed(6)}
                </Text>

                <Text style={styles.breakLocation}>
                  Ended at: {location.end.latitude.toFixed(6)},{" "}
                  {location.end.longitude.toFixed(6)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLegend: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  breakItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  breakTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  breakLocation: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
