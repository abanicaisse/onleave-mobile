import React from "react";
import { StyleSheet, View } from "react-native";

export const ShiftCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={[styles.skeleton, styles.iconContainer]} />
            <View style={styles.shiftInfo}>
              <View style={[styles.skeleton, styles.dateText]} />
              <View style={[styles.skeleton, styles.timeText]} />
            </View>
          </View>
          <View style={[styles.skeleton, styles.durationText]} />
        </View>
      </View>
    </View>
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
    marginRight: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  dateText: {
    height: 16,
    width: "60%",
    marginBottom: 6,
    borderRadius: 4,
  },
  timeText: {
    height: 14,
    width: "80%",
    borderRadius: 4,
  },
  durationText: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
  skeleton: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },
});
