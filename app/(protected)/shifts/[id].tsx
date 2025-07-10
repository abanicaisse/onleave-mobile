import { formatDateTime, timeStampToDate } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { getShiftById } from "../../../actions/shifts.actions";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

export default function ShiftDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Fetch shift data using react-query
  const {
    data: shift,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shift", id],
    queryFn: () => getShiftById(id as string),
    enabled: !!id,
  });

  // Format duration for display (handle string duration from API)
  const formatDuration = (durationString: string): string => {
    // Assuming duration comes as "HH:mm:ss" format from API
    if (!durationString) return "0h 0m 0s";

    const parts = durationString.split(":");
    if (parts.length !== 3) return durationString;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Show loading state
  if (isLoading) {
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
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Show error or not found state
  if (error || !shift) {
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
          <EmptyState
            icon="calendar"
            title="Shift not found"
            description="The shift you're looking for could not be found."
          />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate the map region based on all available location points
  const getMapRegion = () => {
    const locations = [];

    if (shift.startLocation) {
      locations.push({
        latitude: parseFloat(shift.startLocation.latitude),
        longitude: parseFloat(shift.startLocation.longitude),
      });
    }
    if (shift.endLocation) {
      locations.push({
        latitude: parseFloat(shift.endLocation.latitude),
        longitude: parseFloat(shift.endLocation.longitude),
      });
    }
    if (shift.breaks && shift.breaks.length > 0) {
      shift.breaks.forEach((breakItem) => {
        if (breakItem.breakStartLocation) {
          locations.push({
            latitude: parseFloat(breakItem.breakStartLocation.latitude),
            longitude: parseFloat(breakItem.breakStartLocation.longitude),
          });
        }
        if (breakItem.breakEndLocation) {
          locations.push({
            latitude: parseFloat(breakItem.breakEndLocation.latitude),
            longitude: parseFloat(breakItem.breakEndLocation.longitude),
          });
        }
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
            <Text style={styles.infoValue}>
              {formatDateTime(timeStampToDate(shift.startTime!)!).dateDay}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(timeStampToDate(shift.startTime!)!).timeOnly} -{" "}
              {shift.endTime
                ? formatDateTime(timeStampToDate(shift.endTime!)!).timeOnly
                : "In Progress"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>
              {shift.duration ? formatDuration(shift.duration) : "In Progress"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Breaks:</Text>
            <Text style={styles.infoValue}>
              {shift.breaks ? shift.breaks.length : 0} breaks
            </Text>
          </View>
        </View>

        {/* Location Map */}
        {(shift.startLocation ||
          shift.endLocation ||
          (shift.breaks && shift.breaks.length > 0)) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Data</Text>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                // provider={PROVIDER_GOOGLE}
                initialRegion={getMapRegion()}
              >
                {/* Shift start location */}
                {shift.startLocation && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(shift.startLocation.latitude),
                      longitude: parseFloat(shift.startLocation.longitude),
                    }}
                    pinColor="green"
                  >
                    <Callout>
                      <View>
                        <Text>Shift Started</Text>
                        <Text>{formatTime(shift.startTime)}</Text>
                      </View>
                    </Callout>
                  </Marker>
                )}

                {/* Shift end location */}
                {shift.endLocation && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(shift.endLocation.latitude),
                      longitude: parseFloat(shift.endLocation.longitude),
                    }}
                    pinColor="red"
                  >
                    <Callout>
                      <View>
                        <Text>Shift Ended</Text>
                        <Text>
                          {shift.endTime
                            ? formatTime(shift.endTime)
                            : "In Progress"}
                        </Text>
                      </View>
                    </Callout>
                  </Marker>
                )}

                {/* Break locations */}
                {shift.breaks &&
                  shift.breaks.map((breakItem, index) => (
                    <React.Fragment key={`break-${index}`}>
                      {breakItem.breakStartLocation && (
                        <Marker
                          coordinate={{
                            latitude: parseFloat(
                              breakItem.breakStartLocation.latitude
                            ),
                            longitude: parseFloat(
                              breakItem.breakStartLocation.longitude
                            ),
                          }}
                          pinColor="#ffc107"
                        >
                          <Callout>
                            <View>
                              <Text>Break Started</Text>
                              <Text>Break #{index + 1}</Text>
                              {breakItem.breakStartTime && (
                                <Text>
                                  {formatTime(breakItem.breakStartTime)}
                                </Text>
                              )}
                            </View>
                          </Callout>
                        </Marker>
                      )}

                      {breakItem.breakEndLocation && (
                        <Marker
                          coordinate={{
                            latitude: parseFloat(
                              breakItem.breakEndLocation.latitude
                            ),
                            longitude: parseFloat(
                              breakItem.breakEndLocation.longitude
                            ),
                          }}
                          pinColor="blue"
                        >
                          <Callout>
                            <View>
                              <Text>Break Ended</Text>
                              <Text>Break #{index + 1}</Text>
                              {breakItem.breakEndTime && (
                                <Text>
                                  {formatTime(breakItem.breakEndTime)}
                                </Text>
                              )}
                            </View>
                          </Callout>
                        </Marker>
                      )}
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
        {shift.breaks && shift.breaks.length > 0 && (
          <View style={[styles.card, { marginBottom: 132 }]}>
            <Text style={styles.cardTitle}>Break History</Text>

            {shift.breaks.map((breakItem, index) => (
              <View key={`break-details-${index}`} style={styles.breakItem}>
                <Text style={styles.breakTitle}>Break #{index + 1}</Text>

                {breakItem.breakStartTime && (
                  <Text style={styles.breakLocation}>
                    Started:{" "}
                    {
                      formatDateTime(
                        timeStampToDate(breakItem.breakStartTime!)!
                      ).timeOnly
                    }
                  </Text>
                )}

                {breakItem.breakStartLocation && (
                  <Text style={styles.breakLocation}>
                    Started at:{" "}
                    {parseFloat(breakItem.breakStartLocation.latitude).toFixed(
                      6
                    )}
                    ,{" "}
                    {parseFloat(breakItem.breakStartLocation.longitude).toFixed(
                      6
                    )}
                  </Text>
                )}

                {breakItem.breakEndTime && (
                  <Text style={styles.breakLocation}>
                    Ended:{" "}
                    {
                      formatDateTime(timeStampToDate(breakItem.breakEndTime!)!)
                        .timeOnly
                    }
                  </Text>
                )}

                {breakItem.breakEndLocation && (
                  <Text style={styles.breakLocation}>
                    Ended at:{" "}
                    {parseFloat(breakItem.breakEndLocation.latitude).toFixed(6)}
                    ,{" "}
                    {parseFloat(breakItem.breakEndLocation.longitude).toFixed(
                      6
                    )}
                  </Text>
                )}

                {breakItem.breakDuration && (
                  <Text style={styles.breakLocation}>
                    Duration: {formatDuration(breakItem.breakDuration!)}
                  </Text>
                )}
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
