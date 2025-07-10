import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BreakItem {
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface OngoingShiftProps {
  shiftStatus: "idle" | "active" | "break";
  shiftStartDate: Date | null;
  breakStartTime: Date | null;
  breakHistory: BreakItem[];
  elapsedTime: string;
  breakDuration: string;
  currentTime: string;
  formatTime: (date: Date) => string;
  formatDuration: (durationMs: number) => string;
  onTakeBreak: () => void;
  onResumeShift: () => void;
  onEndShift: () => void;
  onStartShift: () => void;
}

export const OngoingShift: React.FC<OngoingShiftProps> = ({
  shiftStatus,
  shiftStartDate,
  breakStartTime,
  breakHistory,
  elapsedTime,
  breakDuration,
  currentTime,
  formatTime,
  formatDuration,
  onTakeBreak,
  onResumeShift,
  onEndShift,
  onStartShift,
}) => {
  return (
    <View style={styles.container}>
      {shiftStatus !== "idle" ? (
        <View style={styles.activeShiftCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Ongoing Shift</Text>
            <View style={styles.buttonRow}>
              {/* Pause/Resume Button */}
              <TouchableOpacity
                onPress={() => {
                  if (shiftStatus === "break") {
                    onResumeShift();
                  } else {
                    onTakeBreak();
                  }
                }}
                style={[
                  styles.pauseResumeButton,
                  {
                    backgroundColor:
                      shiftStatus === "break" ? "#00b300" : "#ffc107",
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {shiftStatus === "break" ? "Resume" : "Break"}
                </Text>
              </TouchableOpacity>

              {/* End Shift Button */}
              <TouchableOpacity
                onPress={onEndShift}
                style={styles.endShiftButton}
              >
                <Text style={styles.buttonText}>End Shift</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeRowContainer}>
            <View style={styles.timeContainer}>
              <Feather
                name="clock"
                size={32}
                color="#007aff"
                style={styles.clockIcon}
              />
              <View>
                <Text style={styles.timeLabel}>Start time</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeValue}>
                    {shiftStartDate && formatTime(shiftStartDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.timeContainer, styles.timeContainerEnd]}>
              <Feather
                name="clock"
                size={32}
                color="#007aff"
                style={styles.clockIcon}
              />
              <View>
                <Text style={styles.timeLabel}>Current time</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeValue}>{currentTime}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Elapsed Time Display */}
          <View style={styles.elapsedTimeContainer}>
            <View style={styles.elapsedTimeRow}>
              <Text style={styles.elapsedTimeLabel}>Total Shift Time:</Text>
              <Text style={styles.elapsedTimeValue}>{elapsedTime}</Text>
            </View>
          </View>

          {/* Break Status */}
          {shiftStatus === "break" && (
            <View style={styles.breakStatusContainer}>
              <View style={styles.breakStatusRow}>
                <Text style={styles.breakStatusLabel}>Break in progress:</Text>
                <Text style={styles.breakStatusValue}>{breakDuration}</Text>
              </View>
              <Text style={styles.breakStartText}>
                Started at: {breakStartTime && formatTime(breakStartTime)}
              </Text>
            </View>
          )}

          {/* Break History */}
          {breakHistory.length > 0 && (
            <View style={styles.breakHistoryContainer}>
              <Text style={styles.breakHistoryTitle}>Break History:</Text>
              {breakHistory.map((breakItem, index) => (
                <View key={index} style={styles.breakHistoryItem}>
                  <Text style={styles.breakHistoryTime}>
                    {formatTime(breakItem.startTime)} -{" "}
                    {formatTime(breakItem.endTime)}
                  </Text>
                  <Text style={styles.breakHistoryDuration}>
                    {formatDuration(breakItem.duration)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.startShiftButton}
          onPress={onStartShift}
        >
          <View style={styles.startShiftContent}>
            <Feather
              name="play-circle"
              size={20}
              color="white"
              style={styles.playIcon}
            />
            <Text style={styles.startShiftText}>Start Shift</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  activeShiftCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007aff",
  },
  buttonRow: {
    flexDirection: "row",
  },
  pauseResumeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  endShiftButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
  timeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeContainerEnd: {
    justifyContent: "flex-end",
  },
  clockIcon: {
    marginRight: 5,
  },
  timeLabel: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 4,
  },
  timeBox: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f0f8ff",
    minWidth: 80,
    alignItems: "center",
  },
  timeValue: {
    color: "#007aff",
    fontWeight: "600",
  },
  elapsedTimeContainer: {
    marginTop: 12,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
  },
  elapsedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  elapsedTimeLabel: {
    color: "#4b5563",
    fontWeight: "500",
  },
  elapsedTimeValue: {
    color: "#007aff",
    fontWeight: "bold",
    fontSize: 18,
  },
  breakStatusContainer: {
    marginTop: 12,
    backgroundColor: "#fefce8",
    padding: 12,
    borderRadius: 8,
  },
  breakStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakStatusLabel: {
    color: "#4b5563",
    fontWeight: "500",
  },
  breakStatusValue: {
    color: "#d97706",
    fontWeight: "bold",
    fontSize: 16,
  },
  breakStartText: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  breakHistoryContainer: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
  },
  breakHistoryTitle: {
    color: "#4b5563",
    fontWeight: "500",
    marginBottom: 16,
  },
  breakHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  breakHistoryTime: {
    color: "#4b5563",
  },
  breakHistoryDuration: {
    color: "#007aff",
    fontWeight: "500",
  },
  startShiftButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  startShiftContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    marginRight: 8,
  },
  startShiftText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 16,
  },
});
