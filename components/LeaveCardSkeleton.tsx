import React from "react";
import { StyleSheet, View } from "react-native";

export const LeaveCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <View style={styles.iconSkeleton} />
          </View>
          <View style={styles.requestInfo}>
            <View style={styles.typeSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
        </View>
        <View style={styles.statusSkeleton} />
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
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconSkeleton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f3f4f6",
  },
  requestInfo: {
    flex: 1,
  },
  typeSkeleton: {
    height: 16,
    width: "70%",
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    marginBottom: 8,
  },
  dateSkeleton: {
    height: 14,
    width: "90%",
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },
  statusSkeleton: {
    height: 24,
    width: 80,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
});
