import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

interface MockShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface CompletedShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakCount: number;
  totalBreakTime: number;
  startLocation?: LocationData;
  endLocation?: LocationData;
  breakLocations?: {
    start: LocationData;
    end: LocationData;
  }[];
}

type Shift = MockShift | CompletedShift;

interface ShiftCardProps {
  shift: Shift;
  formatDuration: (durationMs: number) => string;
  onPress: (shift: Shift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  formatDuration,
  onPress,
}) => {
  const hasLocationData = "startLocation" in shift || "endLocation" in shift;
  const hasDuration = "duration" in shift;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(shift)}>
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Feather name="calendar" size={18} color="#1e40af" />
            </View>
            <View style={styles.shiftInfo}>
              <Text style={styles.dateText}>{shift.date}</Text>
              <Text style={styles.timeText}>
                {shift.startTime} - {shift.endTime}
              </Text>
            </View>
          </View>

          {/* Show the duration for completed shifts from our store */}
          {hasDuration && (
            <Text style={styles.durationText}>
              {formatDuration((shift as CompletedShift).duration)}
            </Text>
          )}
        </View>

        {/* Show location information if available */}
        {hasLocationData && (shift as CompletedShift).startLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              <Text style={styles.locationLabel}>Start:</Text>{" "}
              {(shift as CompletedShift).startLocation!.latitude.toFixed(6)},{" "}
              {(shift as CompletedShift).startLocation!.longitude.toFixed(6)}
            </Text>
            {(shift as CompletedShift).endLocation && (
              <Text style={styles.locationText}>
                <Text style={styles.locationLabel}>End:</Text>{" "}
                {(shift as CompletedShift).endLocation!.latitude.toFixed(6)},{" "}
                {(shift as CompletedShift).endLocation!.longitude.toFixed(6)}
              </Text>
            )}
            {(shift as CompletedShift).breakLocations &&
              (shift as CompletedShift).breakLocations!.length > 0 && (
                <Text style={styles.locationTextWithMargin}>
                  <Text style={styles.locationLabel}>Breaks recorded:</Text>{" "}
                  {(shift as CompletedShift).breakLocations!.length}
                </Text>
              )}

            <View style={styles.mapPromptContainer}>
              <Text style={styles.mapPromptText}>
                Tap to view detailed map →
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  timeText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  durationText: {
    color: "#007aff",
    fontWeight: "500",
    fontSize: 14,
  },
  locationContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  locationText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  locationTextWithMargin: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  locationLabel: {
    fontWeight: "500",
  },
  mapPromptContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  mapPromptText: {
    fontSize: 12,
    color: "#007aff",
  },
});
