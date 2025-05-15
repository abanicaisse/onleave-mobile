import { Feather } from "@expo/vector-icons";
import "expo-dev-client";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useShiftStore } from "../../store/useShiftStore";
import {
  endShiftLiveActivity,
  isLiveActivitySupported,
  startShiftLiveActivity,
  updateShiftLiveActivity,
} from "../../utils/LiveActivities";

// Mock data for demonstration
const mockOrganizations = [
  { id: "1", name: "onLeave Inc." },
  { id: "2", name: "Nicaisse Engineering" },
  { id: "3", name: "Power Slap" },
];

const mockShifts = [
  {
    id: "1",
    date: "May 8, 2025",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    status: "completed",
  },
  {
    id: "2",
    date: "May 7, 2025",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    status: "completed",
  },
  {
    id: "3",
    date: "May 6, 2025",
    startTime: "10:00 AM",
    endTime: "06:00 PM",
    status: "completed",
  },
];

const mockLeaveRequests = [
  {
    id: "1",
    type: "Vacation",
    startDate: "May 15, 2025",
    endDate: "May 22, 2025",
    status: "Pending",
  },
  {
    id: "2",
    type: "Sick Leave",
    startDate: "Apr 28, 2025",
    endDate: "Apr 29, 2025",
    status: "Approved",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0]);
  const [orgSelectorVisible, setOrgSelectorVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(""); // Get shift state from Zustand store using individual selectors to avoid unnecessary re-renders
  const shiftStatus = useShiftStore((state) => state.status);
  const shiftStartDate = useShiftStore((state) => state.startTime);
  const breakStartTime = useShiftStore((state) => state.breakStartTime);
  const totalBreakTime = useShiftStore((state) => state.totalBreakTime);
  const breakHistory = useShiftStore((state) => state.breakHistory);
  const completedShifts = useShiftStore((state) => state.completedShifts);

  // Get actions from the store
  const startShiftAction = useShiftStore((state) => state.actions.startShift);
  const takeBreakAction = useShiftStore((state) => state.actions.takeBreak);
  const resumeShiftAction = useShiftStore((state) => state.actions.resumeShift);
  const endShiftAction = useShiftStore((state) => state.actions.endShift);

  const [elapsedTime, setElapsedTime] = useState("0h 0m 0s");
  const [breakDuration, setBreakDuration] = useState("0h 0m 0s");

  // Memoize these functions to prevent unnecessary re-renders
  // Format duration in milliseconds to "Xh Ym Zs" format
  const formatDuration = useCallback((durationMs: number): string => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);

  const formatTime = useCallback((date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  // Handle Live Activities for iOS
  useEffect(() => {
    const initializeLiveActivity = async () => {
      if (!isLiveActivitySupported()) return;

      if (shiftStatus === "active" && shiftStartDate) {
        await startShiftLiveActivity({
          organizationName: selectedOrg.name,
          startTime: formatTime(shiftStartDate),
          status: "Active",
        });
      } else if (shiftStatus === "break") {
        await updateShiftLiveActivity({
          organizationName: selectedOrg.name,
          status: "On Break",
        });
      } else if (shiftStatus === "idle") {
        await endShiftLiveActivity();
      }
    };

    initializeLiveActivity();
  }, [shiftStatus, selectedOrg.name, formatTime, shiftStartDate]);

  // Keep reference to organizational name to prevent re-renders
  const orgNameRef = useRef(selectedOrg.name);
  useEffect(() => {
    orgNameRef.current = selectedOrg.name;
  }, [selectedOrg.name]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (shiftStatus !== "idle" && shiftStartDate) {
      intervalId = setInterval(() => {
        const now = new Date();
        setCurrentTime(formatTime(now));

        if (shiftStatus === "active") {
          const elapsedMs =
            now.getTime() - shiftStartDate.getTime() - totalBreakTime;
          setElapsedTime(formatDuration(elapsedMs));

          // Update Live Activity every minute (approximately)
          if (
            Platform.OS === "ios" &&
            isLiveActivitySupported() &&
            elapsedMs % 60000 < 1000
          ) {
            updateShiftLiveActivity({
              organizationName: orgNameRef.current,
              elapsedTime: formatDuration(elapsedMs),
              status: "Active",
            });
          }
        } else if (shiftStatus === "break" && breakStartTime) {
          const breakMs = now.getTime() - breakStartTime.getTime();
          setBreakDuration(formatDuration(breakMs));

          // Update Live Activity for breaks (approximately)
          if (
            Platform.OS === "ios" &&
            isLiveActivitySupported() &&
            breakMs % 60000 < 1000
          ) {
            updateShiftLiveActivity({
              organizationName: orgNameRef.current,
              elapsedTime: formatDuration(
                now.getTime() - shiftStartDate.getTime() - totalBreakTime
              ),
              breakDuration: formatDuration(breakMs),
              status: "On Break",
            });
          }
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
    formatTime,
    formatDuration,
  ]);

  // formatTime is now defined as a useCallback above

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "approved":
        return "bg-[#00b300] text-white";
      case "rejected":
        return "bg-[#fd1b1b] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={[styles.container, { backgroundColor: "#007aff" }]}
        edges={["top"]}
      >
        <ScrollView className="flex-1 bg-gray-50">
          {/* Organization Selector */}
          <View
            style={styles.orgSelectorContainer}
            className="bg-white pt-4 px-4 pb-3"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 text-sm font-medium">
                  Organization
                </Text>
                <TouchableOpacity
                  onPress={() => setOrgSelectorVisible(!orgSelectorVisible)}
                  className="flex-row items-center"
                >
                  <Text className="text-lg font-bold">{selectedOrg.name}</Text>
                  <Feather
                    name={orgSelectorVisible ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#333"
                    className="ml-1"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={styles.avatar}
                className="h-10 w-10 bg-blue-100 items-center justify-center"
              >
                <Text className="text-primary-blue font-bold">AN</Text>
              </View>
            </View>

            {orgSelectorVisible && (
              <View style={styles.dropdownMenu} className="mt-3 bg-white p-2">
                {mockOrganizations.map((org) => (
                  <TouchableOpacity
                    key={org.id}
                    onPress={() => {
                      setSelectedOrg(org);
                      setOrgSelectorVisible(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      selectedOrg.id === org.id ? styles.selectedItem : null,
                    ]}
                    className={`p-3 ${
                      selectedOrg.id === org.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <Text
                      className={`${
                        selectedOrg.id === org.id
                          ? "text-primary-blue font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {org.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Today's Date */}
          <View className="px-4 mt-4">
            <Text className="text-gray-500 font-medium">{formatDate()}</Text>
          </View>

          {/* Ongoing Shift UI or Start Shift Button */}
          <View className="px-4 mt-2">
            {shiftStatus !== "idle" ? (
              <View style={styles.activeShiftCard} className="bg-white p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold text-primary-blue">
                    Ongoing Shift
                  </Text>
                  <View className="flex-row">
                    {/* Pause/Resume Button */}
                    <TouchableOpacity
                      onPress={() => {
                        if (shiftStatus === "break") {
                          resumeShiftAction();
                        } else {
                          takeBreakAction();
                        }
                      }}
                      style={[
                        styles.pauseResumeButton,
                        {
                          backgroundColor:
                            shiftStatus === "break" ? "#00b300" : "#ffc107",
                        },
                      ]}
                      className="mr-2"
                    >
                      <Text className="text-white font-medium">
                        {shiftStatus === "break" ? "Resume" : "Break"}
                      </Text>
                    </TouchableOpacity>

                    {/* End Shift Button */}
                    <TouchableOpacity
                      onPress={() => endShiftAction()}
                      style={styles.endShiftButton}
                    >
                      <Text className="text-white font-medium">End Shift</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-4">
                  <View
                    style={styles.timeContainer}
                    className="flex flex-row items-center"
                  >
                    <Feather
                      name="clock"
                      size={32}
                      color="#007aff"
                      style={{ marginRight: 5 }}
                    />
                    <View>
                      <Text className="text-gray-500 text-sm mb-1">
                        Start time
                      </Text>
                      <View style={styles.timeBox}>
                        <Text className="text-primary-blue font-semibold">
                          {shiftStartDate && formatTime(shiftStartDate)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={styles.timeContainer}
                    className="flex flex-row items-center justify-end"
                  >
                    <Feather
                      name="clock"
                      size={32}
                      color="#007aff"
                      style={{ marginRight: 5 }}
                    />
                    <View>
                      <Text className="text-gray-500 text-sm mb-1">
                        Current time
                      </Text>
                      <View style={styles.timeBox}>
                        <Text className="text-primary-blue font-semibold">
                          {currentTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Elapsed Time Display */}
                <View className="mt-3 bg-blue-50 p-3 rounded-[.5rem]">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 font-medium">
                      Total Shift Time:
                    </Text>
                    <Text className="text-primary-blue font-bold text-lg">
                      {elapsedTime}
                    </Text>
                  </View>
                </View>

                {/* Break Status */}
                {shiftStatus === "break" && (
                  <View className="mt-3 bg-yellow-50 p-3 rounded-[.5rem]">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600 font-medium">
                        Break in progress:
                      </Text>
                      <Text className="text-yellow-600 font-bold text-base">
                        {breakDuration}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      Started at: {breakStartTime && formatTime(breakStartTime)}
                    </Text>
                  </View>
                )}

                {/* Break History */}
                {breakHistory.length > 0 && (
                  <View className="mt-3 bg-white border border-gray-200 p-3 rounded-[.5rem]">
                    <Text className="text-gray-600 font-medium mb-4">
                      Break History:
                    </Text>
                    {breakHistory.map((breakItem, index) => (
                      <View
                        key={index}
                        className="flex-row justify-between mb-2 pb-2 border-b border-gray-200"
                      >
                        <Text className="text-gray-600">
                          {formatTime(breakItem.startTime)} -{" "}
                          {formatTime(breakItem.endTime)}
                        </Text>
                        <Text className="text-primary-blue font-medium">
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
                onPress={() => startShiftAction()}
                className="bg-primary-blue"
              >
                <View className="flex-row items-center justify-center">
                  <Feather
                    name="play-circle"
                    size={20}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-medium text-base">
                    Start Shift
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Work Shifts Section */}
          <View className="mt-4 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-heading-text-color text-lg font-bold">
                Recent Work Shifts
              </Text>
              <TouchableOpacity onPress={() => router.push("/shifts")}>
                <Text className="text-primary-blue">View All</Text>
              </TouchableOpacity>
            </View>

            {/* Use completed shifts from the store if available, otherwise fallback to mock data */}
            {(completedShifts.length > 0 ? completedShifts : mockShifts).map(
              (shift) => (
                <View
                  key={shift.id}
                  style={styles.card}
                  className="bg-white p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        style={styles.iconContainer}
                        className="bg-blue-100 mr-3"
                      >
                        <Feather name="calendar" size={18} color="#1e40af" />
                      </View>
                      <View>
                        <Text className="text-base font-medium">
                          {shift.date}
                        </Text>
                        <Text className="text-gray-500">
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>
                    </View>

                    {/* Show the duration for completed shifts from our store */}
                    {"duration" in shift && (
                      <Text className="text-primary-blue font-medium text-sm">
                        {formatDuration(shift.duration)}
                      </Text>
                    )}
                  </View>
                </View>
              )
            )}
          </View>

          {/* Leave Requests Section */}
          <View className="mt-4 px-4 mb-[8rem]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-heading-text-color text-lg font-bold">
                Leave Requests
              </Text>
              <TouchableOpacity>
                <Text className="text-primary-blue">View All</Text>
              </TouchableOpacity>
            </View>

            {mockLeaveRequests.map((request) => (
              <View
                key={request.id}
                style={styles.card}
                className="bg-white p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      style={styles.iconContainer}
                      className="bg-purple-100 mr-3"
                    >
                      <Feather name="calendar" size={18} color="#7e22ce" />
                    </View>
                    <View>
                      <Text className="text-base font-medium">
                        {request.type}
                      </Text>
                      <Text className="text-gray-500">
                        {request.startDate} - {request.endDate}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-[2rem] ${getStatusColor(
                      request.status
                    )}`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        getStatusColor(request.status).includes("bg-gray-100")
                          ? "text-gray-800"
                          : "text-white"
                      }`}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  orgSelectorContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  avatar: {
    borderRadius: 20,
  },
  dropdownMenu: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    borderRadius: 4,
  },
  selectedItem: {
    backgroundColor: "#e6f7ff",
  },
  card: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeShiftCard: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pauseResumeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  endShiftButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeBox: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f0f8ff",
    minWidth: 80,
    alignItems: "center",
  },
  startShiftButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
