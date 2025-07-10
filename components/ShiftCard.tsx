import { formatDateTime, timeStampToDate } from "@/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IShift } from "../types/shifts.types";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

type Shift = IShift;

interface ShiftCardProps {
  shift: Shift;
  formatDuration?: (durationMs: number) => string;
  onPress: (shift: Shift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  formatDuration,
  onPress,
}) => {
  const hasLocationData = "startLocation" in shift || "endLocation" in shift;
  // const hasDuration = "duration" in shift;

  // Helper function to get duration
  const getShiftDuration = (shift: Shift): string | null => {
    if ("duration" in shift) {
      if (typeof shift.duration === "number" && formatDuration) {
        return formatDuration(shift.duration);
      }
      if (typeof shift.duration === "string") {
        return shift.duration;
      }
    }
    return null;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(shift)}>
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Feather name="calendar" size={18} color="#1e40af" />
            </View>
            <View style={styles.shiftInfo}>
              <Text style={styles.dateText}>
                {formatDateTime(timeStampToDate(shift.startTime!)!).dateOnly ||
                  "Invalid Date"}
              </Text>
              <Text style={styles.timeText}>
                {formatDateTime(timeStampToDate(shift.startTime!)!).timeOnly} -{" "}
                {formatDateTime(timeStampToDate(shift.endTime!)!).timeOnly ||
                  "Invalid Time"}
              </Text>
            </View>
          </View>

          {/* Show the duration for completed shifts */}
          {getShiftDuration(shift) && (
            <Text style={styles.durationText}>{getShiftDuration(shift)}</Text>
          )}
        </View>

        {/* Show location information if available */}
        {hasLocationData && "startLocation" in shift && shift.startLocation && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              <Text style={styles.locationLabel}>Start:</Text>{" "}
              {typeof shift.startLocation.latitude === "string"
                ? `${shift.startLocation.latitude}, ${shift.startLocation.longitude}`
                : `${Number(shift.startLocation.latitude).toFixed(6)}, ${Number(
                    shift.startLocation.longitude
                  ).toFixed(6)}`}
            </Text>
            {"endLocation" in shift && shift.endLocation && (
              <Text style={styles.locationText}>
                <Text style={styles.locationLabel}>End:</Text>{" "}
                {typeof shift.endLocation.latitude === "string"
                  ? `${shift.endLocation.latitude}, ${shift.endLocation.longitude}`
                  : `${Number(shift.endLocation.latitude).toFixed(6)}, ${Number(
                      shift.endLocation.longitude
                    ).toFixed(6)}`}
              </Text>
            )}
            {"breaks" in shift && shift.breaks && shift.breaks.length > 0 && (
              <Text style={styles.locationTextWithMargin}>
                <Text style={styles.locationLabel}>Breaks recorded:</Text>{" "}
                {shift.breaks.length}
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
