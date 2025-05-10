import { Feather } from "@expo/vector-icons";
import "expo-dev-client";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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

export default function Index() {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0]);
  const [orgSelectorVisible, setOrgSelectorVisible] = useState(false);
  const [hasActiveShift, setHasActiveShift] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftStartDate, setShiftStartDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [elapsedTime, setElapsedTime] = useState("0h 0m 0s");

  // New state variables for pause functionality
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const [pauseStartTimeString, setPauseStartTimeString] = useState("");
  const [totalPausedTime, setTotalPausedTime] = useState(0); // in milliseconds
  const [currentBreakDuration, setCurrentBreakDuration] = useState("0h 0m 0s");
  const [breakHistory, setBreakHistory] = useState<
    {
      startTime: string;
      endTime: string;
      duration: string;
    }[]
  >([]);

  // Format duration in milliseconds to "Xh Ym Zs" format
  const formatDuration = (durationMs: number): string => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const pauseShift = () => {
    if (!isPaused && hasActiveShift) {
      const now = new Date();
      const pauseTimeString = formatTime(now);
      setIsPaused(true);
      setPauseStartTime(now);
      setPauseStartTimeString(pauseTimeString);
    }
  };

  const resumeShift = () => {
    if (isPaused && hasActiveShift && pauseStartTime) {
      const now = new Date();
      const resumeTimeString = formatTime(now);

      // Calculate how long this break was
      const breakDurationMs = now.getTime() - pauseStartTime.getTime();
      const breakDurationFormatted = formatDuration(breakDurationMs);

      // Add to total paused time
      setTotalPausedTime((prevTime) => prevTime + breakDurationMs);

      // Add to break history
      setBreakHistory((prevHistory) => [
        ...prevHistory,
        {
          startTime: pauseStartTimeString,
          endTime: resumeTimeString,
          duration: breakDurationFormatted,
        },
      ]);

      // Reset pause state
      setIsPaused(false);
      setPauseStartTime(null);
      setPauseStartTimeString("");
      setCurrentBreakDuration("0h 0m 0s");
    }
  };

  // Calculate elapsed time and update every second
  useEffect(() => {
    if (!hasActiveShift || !shiftStartDate) return;

    // If paused, don't run the timer that updates elapsed time
    if (isPaused) return;

    // Set initial times
    const now = new Date();
    updateElapsedTime(shiftStartDate, now);

    // Update current time and elapsed time every second
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      setCurrentTime(formatTime(currentDate));
      updateElapsedTime(shiftStartDate, currentDate);

      // Update the Dynamic Island Live Activity if active on iOS
      // Update live activity less frequently to avoid excessive updates
      if (Platform.OS === "ios" && hasActiveShift) {
        updateShiftLiveActivity({
          organizationName: selectedOrg.name,
          startTime: shiftStartTime,
          elapsedTime: elapsedTime,
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    hasActiveShift,
    shiftStartDate,
    shiftStartTime,
    isPaused,
    elapsedTime,
    selectedOrg.name,
  ]);

  // Effect to track ongoing break duration
  useEffect(() => {
    if (!isPaused || !pauseStartTime) return;

    // Update break duration every second
    const breakIntervalId = setInterval(() => {
      const now = new Date();
      const breakDuration = now.getTime() - pauseStartTime.getTime();
      setCurrentBreakDuration(formatDuration(breakDuration));
    }, 1000);

    return () => clearInterval(breakIntervalId);
  }, [isPaused, pauseStartTime]);

  // Initial time setup
  useEffect(() => {
    const now = new Date();
    setCurrentTime(formatTime(now));
  }, []);

  const updateElapsedTime = (startTime: Date, currentTime: Date) => {
    if (
      !startTime ||
      !currentTime ||
      isNaN(startTime.getTime()) ||
      isNaN(currentTime.getTime())
    ) {
      setElapsedTime("0h 0m 0s");
      return;
    }

    let diffMs = currentTime.getTime() - startTime.getTime();

    // Subtract total paused time from the elapsed time
    diffMs = diffMs - totalPausedTime;

    // If currently paused, also subtract the current pause duration
    if (isPaused && pauseStartTime) {
      diffMs = diffMs - (currentTime.getTime() - pauseStartTime.getTime());
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    setElapsedTime(`${hours}h ${minutes}m ${seconds}s`);
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const toggleShift = async () => {
    if (!hasActiveShift) {
      // Start a new shift
      const now = new Date();
      const startTime = formatTime(now);
      setShiftStartTime(startTime);
      setShiftStartDate(now);
      setCurrentTime(startTime);

      // Immediately update elapsed time (which will be 0h 0m)
      updateElapsedTime(now, now);

      // If on iOS, trigger dynamic island live activity
      if (Platform.OS === "ios" && isLiveActivitySupported()) {
        await startShiftLiveActivity({
          organizationName: selectedOrg.name,
          startTime: startTime,
        });
      }
    } else {
      // End the shift
      if (Platform.OS === "ios" && isLiveActivitySupported()) {
        await endShiftLiveActivity();
      }

      // Reset shift data
      setShiftStartDate(null);
      setShiftStartTime("");
      setElapsedTime("0h 0m 0s");

      // Reset pause-related data
      setIsPaused(false);
      setPauseStartTime(null);
      setPauseStartTimeString("");
      setTotalPausedTime(0);
      setCurrentBreakDuration("0h 0m 0s");
      setBreakHistory([]);
    }

    setHasActiveShift(!hasActiveShift);
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
            {hasActiveShift ? (
              <View style={styles.activeShiftCard} className="bg-white p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold text-primary-blue">
                    Ongoing Shift
                  </Text>
                  <View className="flex-row">
                    {/* Pause/Resume Button */}
                    <TouchableOpacity
                      onPress={isPaused ? resumeShift : pauseShift}
                      style={[
                        styles.pauseResumeButton,
                        { backgroundColor: isPaused ? "#00b300" : "#ffc107" },
                      ]}
                      className="mr-2"
                    >
                      <Text className="text-white font-medium">
                        {isPaused ? "Resume" : "Break"}
                      </Text>
                    </TouchableOpacity>

                    {/* End Shift Button */}
                    <TouchableOpacity
                      onPress={toggleShift}
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
                          {shiftStartTime}
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
                {isPaused && (
                  <View className="mt-3 bg-yellow-50 p-3 rounded-[.5rem]">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600 font-medium">
                        Break in progress:
                      </Text>
                      <Text className="text-yellow-600 font-bold text-base">
                        {currentBreakDuration}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      Started at: {pauseStartTimeString}
                    </Text>
                  </View>
                )}

                {/* Break History */}
                {breakHistory.length > 0 && (
                  <View className="mt-3 bg-white border border-gray-200 p-3 rounded-[.5rem]">
                    <Text className="text-input-label-color font-medium mb-4">
                      Break History:
                    </Text>
                    {breakHistory.map((breakItem, index) => (
                      <View
                        key={index}
                        className="flex-row justify-between mb-2 pb-2 border-b border-light-gray"
                      >
                        <Text className="text-input-label-color">
                          {breakItem.startTime} - {breakItem.endTime}
                        </Text>
                        <Text className="text-primary-blue font-medium">
                          {breakItem.duration}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startShiftButton}
                onPress={toggleShift}
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

            {mockShifts.map((shift) => (
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
                </View>
              </View>
            ))}
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
  activeShiftCard: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  endShiftButton: {
    backgroundColor: "#fd1b1b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  pauseResumeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeContainer: {
    flex: 1,
    alignItems: "center",
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  startShiftButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
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
});
