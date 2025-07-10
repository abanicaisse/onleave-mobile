import { ConnectedHomeTopBar } from "@/components/ConnectedHomeTopBar";
import { EmptyState } from "@/components/EmptyState";
import { LeaveCard } from "@/components/LeaveCard";
import { OngoingShift } from "@/components/OngoingShift";
import { ShiftCard } from "@/components/ShiftCard";
import { ShiftCardSkeleton } from "@/components/ShiftCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import "expo-dev-client";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getShifts } from "../../actions/shifts.actions";
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
  const [currentTime, setCurrentTime] = useState("");

  // Fetch recent shifts using react-query
  const {
    data: shiftsData,
    isLoading: isLoadingShifts,
    error: shiftsError,
  } = useQuery({
    queryKey: ["shifts", "user", 1, 10], // target: "user", page: 1, limit: 10
    queryFn: () => getShifts("user", 1, 10, "completed"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get shift state from Zustand store using individual selectors to avoid unnecessary re-renders
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
        <ScrollView style={styles.scrollView}>
          {/* Organization Selector */}
          <ConnectedHomeTopBar />

          {/* Today's Date */}
          <View className="px-4 mt-4">
            <Text className="text-gray-500 font-medium">{formatDate()}</Text>
          </View>

          {/* Ongoing Shift UI or Start Shift Button */}
          <OngoingShift
            shiftStatus={shiftStatus}
            shiftStartDate={shiftStartDate}
            breakStartTime={breakStartTime}
            breakHistory={breakHistory}
            elapsedTime={elapsedTime}
            breakDuration={breakDuration}
            currentTime={currentTime}
            formatTime={formatTime}
            formatDuration={formatDuration}
            onTakeBreak={takeBreakAction}
            onResumeShift={resumeShiftAction}
            onEndShift={endShiftAction}
            onStartShift={startShiftAction}
          />

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

            {/* Loading state */}
            {isLoadingShifts && (
              <>
                <ShiftCardSkeleton />
                <ShiftCardSkeleton />
                <ShiftCardSkeleton />
              </>
            )}

            {/* Error state */}
            {shiftsError && !isLoadingShifts && (
              <EmptyState
                icon="alert-circle"
                title="Unable to load shifts"
                description="Please check your connection and try again."
                iconColor="#ef4444"
              />
            )}

            {/* Empty state */}
            {!isLoadingShifts &&
              !shiftsError &&
              (!shiftsData?.shifts || shiftsData.shifts.length === 0) && (
                <EmptyState
                  icon="calendar"
                  title="No recent shifts"
                  description="Your recent work shifts will appear here once you start logging time."
                />
              )}

            {!isLoadingShifts &&
              !shiftsError &&
              shiftsData?.shifts &&
              shiftsData.shifts.length > 0 && (
                <>
                  {shiftsData.shifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      onPress={(shift) => {
                        // Only allow navigation to details for real shifts with location data
                        if ("startLocation" in shift && shift.startLocation) {
                          router.push(`/shifts/${shift.id}`);
                        }
                      }}
                    />
                  ))}
                </>
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
              <LeaveCard
                key={request.id}
                request={request}
                getStatusColor={getStatusColor}
              />
            ))}

            <Pressable
              className="w-full mt-3 mb-5 flex flex-row gap-4 justify-center items-center border border-input bg-primary-blue p-3 rounded-lg"
              onPress={() => {
                router.replace("/login");
              }}
            >
              <Text className="text-[14px] text-white font-normal">
                Login page
              </Text>
            </Pressable>
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
  scrollView: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  orgSelectorContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orgSection: {
    flex: 1,
    marginRight: 16,
  },
  labelText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  orgSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  orgName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdownMenu: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    borderRadius: 4,
    padding: 12,
  },
  selectedItem: {
    backgroundColor: "#e6f7ff",
  },
  dropdownOrgName: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "400",
  },
  selectedOrgName: {
    color: "#2563eb",
    fontWeight: "500",
  },
});
