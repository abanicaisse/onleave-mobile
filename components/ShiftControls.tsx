import React, { memo } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useShiftStore } from "../store/useShiftStore";
import { checkLocationPermission } from "../utils/locationService";

interface ShiftControlsProps {
  variant?: "default" | "compact";
}

function ShiftControlsComponent({ variant = "default" }: ShiftControlsProps) {
  const status = useShiftStore((state) => state.status);
  const startShift = useShiftStore((state) => state.actions.startShift);
  const takeBreak = useShiftStore((state) => state.actions.takeBreak);
  const resumeShift = useShiftStore((state) => state.actions.resumeShift);
  const endShift = useShiftStore((state) => state.actions.endShift);
  const {
    isStartingShift,
    setIsStartingShift,
    isTakingBreak,
    setIsTakingBreak,
    isEndingShift,
    setIsEndingShift,
    isResumingShift,
    setIsResumingShift,
  } = useShiftStore();

  const isCompact = variant === "compact";

  const handleStartShift = React.useCallback(async () => {
    setIsStartingShift(true);
    try {
      const hasPermission = await checkLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Location Required",
          "You can't start a shift without providing your location."
        );
        return;
      }

      await startShift();
    } catch (error) {
      console.error("Error starting shift:", error);
      Alert.alert("Error", "Could not start your shift. Please try again.");
    } finally {
      setIsStartingShift(false);
    }
  }, [startShift]);

  const handleTakeBreak = React.useCallback(async () => {
    setIsTakingBreak(true);
    try {
      const hasPermission = await checkLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Location Required",
          "You can't record a break without providing your location."
        );
        return;
      }

      await takeBreak();
    } catch (error) {
      console.error("Error taking break:", error);
      Alert.alert("Error", "Could not start your break. Please try again.");
    } finally {
      setIsTakingBreak(false);
    }
  }, [takeBreak]);

  const handleResumeShift = React.useCallback(async () => {
    setIsResumingShift(true);
    try {
      const hasPermission = await checkLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Location Required",
          "You can't resume your shift without providing your location."
        );
        return;
      }

      await resumeShift();
    } catch (error) {
      console.error("Error resuming shift:", error);
      Alert.alert("Error", "Could not resume your shift. Please try again.");
    } finally {
      setIsResumingShift(false);
    }
  }, [resumeShift]);

  const handleEndShift = React.useCallback(async () => {
    setIsEndingShift(true);
    try {
      const hasPermission = await checkLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Location Required",
          "You can't end your shift without providing your location."
        );
        return;
      }

      await endShift();
    } catch (error) {
      console.error("Error ending shift:", error);
      Alert.alert("Error", "Could not end your shift. Please try again.");
    } finally {
      setIsEndingShift(false);
    }
  }, [endShift]);

  if (status === "idle") {
    return (
      <View
        style={[styles.container, isCompact ? styles.compactContainer : null]}
      >
        <TouchableOpacity
          style={[
            styles.startButton,
            isCompact ? styles.compactButton : null,
            isStartingShift ? styles.disabledButton : null,
          ]}
          onPress={handleStartShift}
          disabled={isStartingShift}
        >
          {isStartingShift ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Start Shift</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isCompact ? styles.compactContainer : null,
        { flexDirection: isCompact ? "column" : "row" },
      ]}
    >
      {status === "active" ? (
        <TouchableOpacity
          style={[
            styles.breakButton,
            isCompact ? styles.compactButton : null,
            isTakingBreak ? styles.disabledButton : null,
          ]}
          disabled={isTakingBreak}
          onPress={handleTakeBreak}
        >
          {isTakingBreak ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Take Break</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.resumeButton,
            isCompact ? styles.compactButton : null,
            isResumingShift ? styles.disabledButton : null,
          ]}
          onPress={handleResumeShift}
          disabled={isResumingShift}
        >
          {isResumingShift ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Resume Shift</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.endButton,
          isCompact ? styles.compactButton : null,
          isEndingShift ? styles.disabledButton : null,
          { marginLeft: isCompact ? 0 : 10 },
        ]}
        onPress={handleEndShift}
        disabled={isEndingShift}
      >
        {isEndingShift ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>End Shift</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Export memoized component to prevent unnecessary re-renders
const ShiftControls = memo(ShiftControlsComponent);
export default ShiftControls;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  compactContainer: {
    position: "absolute",
    bottom: 130,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    width: "100%",
    maxWidth: 120,
    alignItems: "center",
  },
  breakButton: {
    backgroundColor: "#ffc107",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    width: "100%",
    alignItems: "center",
  },
  resumeButton: {
    backgroundColor: "#34c759",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    width: "100%",
    alignItems: "center",
  },
  endButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    width: "100%",
    alignItems: "center",
  },
  compactButton: {
    minWidth: 100,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
