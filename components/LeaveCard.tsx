import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface LeaveCardProps {
  request: LeaveRequest;
  getStatusColor: (status: string) => string;
}

export const LeaveCard: React.FC<LeaveCardProps> = ({
  request,
  getStatusColor,
}) => {
  const statusColorClasses = getStatusColor(request.status);
  const isGrayStatus = statusColorClasses.includes("bg-gray-100");

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Feather name="calendar" size={18} color="#7e22ce" />
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.typeText}>{request.type}</Text>
            <Text style={styles.dateText}>
              {request.startDate} - {request.endDate}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusBadgeColor(request.status),
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isGrayStatus ? "#374151" : "#ffffff",
              },
            ]}
          >
            {request.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const getStatusBadgeColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#eab308"; // yellow-500
    case "approved":
      return "#00b300"; // green
    case "rejected":
      return "#fd1b1b"; // red
    default:
      return "#f3f4f6"; // gray-100
  }
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
    borderRadius: 20,
    backgroundColor: "#f3e8ff", // purple-100
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
