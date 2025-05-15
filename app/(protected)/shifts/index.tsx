import React, { useCallback, useEffect, useState } from "react";

import * as Location from "expo-location";
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
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Helper function to check if two locations are approximately the same
  const isSameLocation = useCallback(
    (loc1: any, loc2: any, precisionMeters = 10) => {
      if (!loc1 || !loc2) return false;

      // Convert difference in lat/long to approximate meters
      // 0.00001 degrees is roughly 1.1 meters at the equator
      const latDiffMeters = Math.abs(loc1.latitude - loc2.latitude) * 111111;
      const lonDiffMeters =
        Math.abs(loc1.longitude - loc2.longitude) *
        111111 *
        Math.cos(loc1.latitude * (Math.PI / 180));

      // Calculate approximate distance using Pythagorean theorem
      const distanceMeters = Math.sqrt(
        Math.pow(latDiffMeters, 2) + Math.pow(lonDiffMeters, 2)
      );

      return distanceMeters <= precisionMeters;
    },
    []
  );

  // Get shift state from Zustand store using individual selectors
  const shiftStatus = useShiftStore((state) => state.status);
  const shiftStartDate = useShiftStore((state) => state.startTime);
  const breakStartTime = useShiftStore((state) => state.breakStartTime);
  const totalBreakTime = useShiftStore((state) => state.totalBreakTime);
  const startLocation = useShiftStore((state) => state.startLocation);
  const lastKnownLocation = useShiftStore((state) => state.lastKnownLocation);
  const currentBreakStartLocation = useShiftStore(
    (state) => state.currentBreakStartLocation
  );
  const breakHistory = useShiftStore((state) => state.breakHistory);
  const updateLocation = useShiftStore((state) => state.actions.updateLocation);

  const [elapsedTime, setElapsedTime] = useState("0h 0m 0s");
  const [breakDuration, setBreakDuration] = useState("0h 0m 0s");

  const onRegionChange = (region: Region) => {
    setCurrentRegion(region);
  };

  // Format duration in milliseconds to "Xh Ym Zs" format
  const formatDuration = useCallback((durationMs: number): string => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);

  // Get the appropriate color for the lastKnownLocation marker
  const getLocationMarkerColor = useCallback(() => {
    if (!lastKnownLocation) return "red";

    // Check if we're at the shift start location
    if (startLocation && isSameLocation(lastKnownLocation, startLocation)) {
      return "green";
    }

    // Check if we're currently on break and at the break start location
    if (
      shiftStatus === "break" &&
      currentBreakStartLocation &&
      isSameLocation(lastKnownLocation, currentBreakStartLocation)
    ) {
      return "#ffc107";
    }

    // Check if we're at any break start location from history
    const atBreakStart = breakHistory.some(
      (breakRecord) =>
        breakRecord.startLocation &&
        isSameLocation(lastKnownLocation, breakRecord.startLocation)
    );
    if (atBreakStart) return "#ffc107";

    // Check if we're at any break end location from history
    const atBreakEnd = breakHistory.some(
      (breakRecord) =>
        breakRecord.endLocation &&
        isSameLocation(lastKnownLocation, breakRecord.endLocation)
    );
    if (atBreakEnd) return "#1E88E5";

    // Default: red for active shift, orange for break
    return shiftStatus === "active" ? "red" : "#ffc107";
  }, [
    lastKnownLocation,
    startLocation,
    shiftStatus,
    currentBreakStartLocation,
    breakHistory,
    isSameLocation,
  ]);

  // Request location permissions when component mounts
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");

      if (status === "granted") {
        // Get initial location and center map
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion);
      }
    };

    requestLocationPermission();
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

  // Periodically update location during active shifts
  useEffect(() => {
    let locationInterval: ReturnType<typeof setInterval> | null = null;

    if (hasLocationPermission && shiftStatus !== "idle") {
      // Update location every minute during active shifts
      locationInterval = setInterval(async () => {
        await updateLocation();

        // If we have a new location, update the map view
        if (lastKnownLocation) {
          const newRegion = {
            latitude: lastKnownLocation.latitude,
            longitude: lastKnownLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };

          // Only animate to new region if it's significantly different
          if (
            Math.abs(currentRegion.latitude - lastKnownLocation.latitude) >
              0.0001 ||
            Math.abs(currentRegion.longitude - lastKnownLocation.longitude) >
              0.0001
          ) {
            mapRef.current?.animateToRegion(newRegion);
            setCurrentRegion(newRegion);
          }
        }
      }, 60000); // Update every minute
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [
    hasLocationPermission,
    shiftStatus,
    lastKnownLocation,
    updateLocation,
    currentRegion,
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
            initialRegion={currentRegion}
            showsUserLocation
            showsMyLocationButton
            onRegionChangeComplete={onRegionChange}
            ref={mapRef}
          >
            {/* Shift start location marker */}
            {startLocation && shiftStartDate && (
              <Marker
                coordinate={{
                  latitude: startLocation.latitude,
                  longitude: startLocation.longitude,
                }}
                pinColor="green"
              >
                <Callout>
                  <View style={styles.markerCallout}>
                    <Text style={styles.calloutTitle}>Shift Started</Text>
                    <Text style={styles.calloutText}>
                      {new Date(shiftStartDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                    <Text style={styles.calloutSubText}>
                      {new Date(shiftStartDate).toLocaleDateString()}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            )}

            {/* Break locations */}
            {breakHistory.map(
              (breakRecord, index) =>
                breakRecord.startLocation &&
                breakRecord.startTime && (
                  <Marker
                    key={`break-start-${index}`}
                    coordinate={{
                      latitude: breakRecord.startLocation.latitude,
                      longitude: breakRecord.startLocation.longitude,
                    }}
                    pinColor="#ffc107"
                  >
                    <Callout>
                      <View style={styles.markerCallout}>
                        <Text style={styles.calloutTitle}>Paused</Text>
                        <Text style={styles.calloutText}>
                          {new Date(breakRecord.startTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </Text>
                        <Text style={styles.calloutSubText}>
                          {new Date(breakRecord.startTime).toLocaleDateString()}
                        </Text>
                      </View>
                    </Callout>
                  </Marker>
                )
            )}

            {breakHistory.map(
              (breakRecord, index) =>
                breakRecord.endLocation &&
                breakRecord.endTime && (
                  <Marker
                    key={`break-end-${index}`}
                    coordinate={{
                      latitude: breakRecord.endLocation.latitude,
                      longitude: breakRecord.endLocation.longitude,
                    }}
                    pinColor="#1E88E5" /* Specific blue shade for consistency */
                  >
                    <Callout>
                      <View style={styles.markerCallout}>
                        <Text style={styles.calloutTitle}>Resumed</Text>
                        <Text style={styles.calloutText}>
                          {new Date(breakRecord.endTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </Text>
                        <Text style={styles.calloutSubText}>
                          {new Date(breakRecord.endTime).toLocaleDateString()}
                        </Text>
                        {breakRecord.duration && (
                          <Text style={styles.calloutText}>
                            {formatDuration(breakRecord.duration)}
                          </Text>
                        )}
                      </View>
                    </Callout>
                  </Marker>
                )
            )}

            {/* Current break location if on break */}
            {shiftStatus === "break" &&
              currentBreakStartLocation &&
              breakStartTime && (
                <Marker
                  coordinate={{
                    latitude: currentBreakStartLocation.latitude,
                    longitude: currentBreakStartLocation.longitude,
                  }}
                  pinColor="#ffc107" /* Match break color in legend */
                >
                  <Callout>
                    <View style={styles.markerCallout}>
                      <Text style={styles.calloutTitle}>
                        Currently on Break
                      </Text>
                      <Text style={styles.calloutText}>
                        Since:{" "}
                        {new Date(breakStartTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                      <Text style={styles.calloutSubText}>
                        Duration: {breakDuration}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              )}

            {/* Last known location with special styling based on context */}
            {shiftStatus !== "idle" && lastKnownLocation && (
              <Marker
                coordinate={{
                  latitude: lastKnownLocation.latitude,
                  longitude: lastKnownLocation.longitude,
                }}
                pinColor={getLocationMarkerColor()}
              >
                <Callout>
                  <View style={styles.markerCallout}>
                    <Text style={styles.calloutTitle}>
                      {(() => {
                        // Check if we're at the shift start location
                        if (
                          startLocation &&
                          isSameLocation(lastKnownLocation, startLocation)
                        ) {
                          return "Shift Start Location";
                        }

                        // Check if we're currently on break and at the break start location
                        if (
                          shiftStatus === "break" &&
                          currentBreakStartLocation &&
                          isSameLocation(
                            lastKnownLocation,
                            currentBreakStartLocation
                          )
                        ) {
                          return "Current Break Location";
                        }

                        // Check if we're at any break location from history
                        const atBreakStartIndex = breakHistory.findIndex(
                          (breakRecord) =>
                            breakRecord.startLocation &&
                            isSameLocation(
                              lastKnownLocation,
                              breakRecord.startLocation
                            )
                        );
                        if (atBreakStartIndex >= 0) {
                          return `Break #${
                            atBreakStartIndex + 1
                          } Start Location`;
                        }

                        // Check if we're at any resume location from history
                        const atBreakEndIndex = breakHistory.findIndex(
                          (breakRecord) =>
                            breakRecord.endLocation &&
                            isSameLocation(
                              lastKnownLocation,
                              breakRecord.endLocation
                            )
                        );
                        if (atBreakEndIndex >= 0) {
                          return `Break #${atBreakEndIndex + 1} End Location`;
                        }

                        // Default
                        return shiftStatus === "active"
                          ? "Current Position"
                          : "On Break";
                      })()}
                    </Text>
                    {lastKnownLocation.timestamp && (
                      <>
                        <Text style={styles.calloutText}>
                          Updated:{" "}
                          {new Date(
                            lastKnownLocation.timestamp
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </Text>
                        <Text style={styles.calloutSubText}>
                          {new Date(
                            lastKnownLocation.timestamp
                          ).toLocaleDateString()}
                        </Text>
                      </>
                    )}
                    {shiftStartDate && shiftStatus === "active" && (
                      <Text style={styles.calloutText}>
                        Shift Duration: {elapsedTime}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            )}
          </MapView>

          {/* Map Legend - Show when shift is active or markers are present */}
          {(shiftStatus !== "idle" ||
            startLocation ||
            breakHistory.length > 0) && (
            <View style={styles.legendContainer}>
              <Text style={styles.legendText}>Shift Locations</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "green" }]}
                  />
                  <Text style={styles.legendText}>Started</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "red" }]}
                  />
                  <Text style={styles.legendText}>Ended</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#ffc107" }]}
                  />
                  <Text style={styles.legendText}>Paused</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#1E88E5" }]}
                  />
                  <Text style={styles.legendText}>Resumed</Text>
                </View>
              </View>
            </View>
          )}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  markerCallout: {
    padding: 12,
    minWidth: 150,
    borderRadius: 6,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  calloutText: {
    fontSize: 12,
    color: "#444",
    marginBottom: 2,
  },
  calloutSubText: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  legendContainer: {
    position: "absolute",
    top: 70, // Position it below the status banner
    left: 10,
    right: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    alignItems: "center",
    zIndex: 5, // Ensure it's above the map but below controls
  },
  legendText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginLeft: 5,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
