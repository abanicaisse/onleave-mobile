import {
  endShift,
  endShiftBreak,
  startShift,
  startShiftBreak,
} from "@/actions/shifts.actions";
import { getAccessControlDetails } from "@/utils";
import { create } from "zustand";
import { getCurrentLocation } from "../utils/locationService";

export type ShiftStatus = "idle" | "active" | "break";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

interface BreakRecord {
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
  startLocation?: LocationData;
  endLocation?: LocationData;
}

export interface CompletedShift {
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

interface ShiftState {
  shiftId: string;
  setShiftId: (id: string) => void;
  status: ShiftStatus;
  startTime: Date | null;
  breakStartTime: Date | null;
  breakId: string | null;
  setBreakId: (id: string | null) => void;
  totalBreakTime: number; // in milliseconds
  breakHistory: BreakRecord[];
  startLocation: LocationData | null;
  lastKnownLocation: LocationData | null;
  currentBreakStartLocation: LocationData | null;
  completedShifts: CompletedShift[];
  isStartingShift: boolean;
  isEndingShift: boolean;
  isTakingBreak: boolean;
  isResumingShift: boolean;
  setIsStartingShift: (isStarting: boolean) => void;
  setIsEndingShift: (isEnding: boolean) => void;
  setIsTakingBreak: (isTaking: boolean) => void;
  setIsResumingShift: (isResuming: boolean) => void;
  actions: {
    startShift: () => Promise<void>;
    takeBreak: () => Promise<void>;
    resumeShift: () => Promise<void>;
    endShift: () => Promise<void>;
    updateLocation: () => Promise<LocationData | null>;
  };
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  shiftId: "",
  setShiftId: (id) => set({ shiftId: id }),
  status: "idle",
  startTime: null,
  breakId: null,
  setBreakId: (id) => set({ breakId: id }),
  breakStartTime: null,
  totalBreakTime: 0,
  breakHistory: [],
  startLocation: null,
  lastKnownLocation: null,
  currentBreakStartLocation: null,
  completedShifts: [],
  isStartingShift: false,
  isEndingShift: false,
  isTakingBreak: false,
  isResumingShift: false,
  setIsStartingShift: (isStarting) => set({ isStartingShift: isStarting }),
  setIsEndingShift: (isEnding) => set({ isEndingShift: isEnding }),
  setIsTakingBreak: (isTaking) => set({ isTakingBreak: isTaking }),
  setIsResumingShift: (isResuming) => set({ isResumingShift: isResuming }),

  actions: {
    startShift: async () => {
      const { setIsStartingShift } = get();
      setIsStartingShift(true);

      try {
        const location = await getCurrentLocation();

        if (!location) {
          throw new Error("Location permission denied");
        }

        const accessControl = await getAccessControlDetails();

        if (!accessControl.orgId) {
          console.error(
            "Missing orgId in access control details:",
            accessControl
          );
          throw new Error("Organization ID is required to start a shift");
        }

        // Create the payload with all required fields
        const startShiftPayload = {
          orgId: accessControl.orgId,
          departmentId: "default", // Always include departmentId even if it's a default value
          startLocation: {
            longitude: location.longitude.toString(),
            latitude: location.latitude.toString(),
          },
        };

        console.log(
          "Starting shift with payload:",
          JSON.stringify(startShiftPayload)
        );

        const response = await startShift(startShiftPayload);

        if (!response) {
          throw new Error("No response received from server");
        }

        console.log("Shift started successfully with ID:", response.id);
        const shiftId = response.id;

        set({
          shiftId,
          status: "active",
          startTime: new Date(),
          breakStartTime: null,
          totalBreakTime: 0,
          breakHistory: [],
          startLocation: location,
          lastKnownLocation: location,
        });
      } catch (error: any) {
        // Handle axios errors more specifically
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response from server:", {
            status: error.response.status,
            data: JSON.stringify(error.response.data),
            headers: error.response.headers,
          });

          if (error.response.data && error.response.data.message) {
            throw new Error(
              `Failed to start shift: ${error.response.data.message}`
            );
          } else if (
            error.response.data &&
            typeof error.response.data === "object"
          ) {
            // Check for validation errors
            const errorMessages = Object.values(error.response.data)
              .flat()
              .join(", ");
            if (errorMessages) {
              throw new Error(`Failed to start shift: ${errorMessages}`);
            }
          }
          throw new Error(
            `Failed to start shift: Server returned ${error.response.status}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error starting shift:", error);
          throw new Error(
            `Could not start shift: ${error.message || "Unknown error"}`
          );
        }
      } finally {
        setIsStartingShift(false);
      }
    },

    takeBreak: async () => {
      const { setIsTakingBreak, shiftId } = get();
      setIsTakingBreak(true);

      try {
        if (get().status === "active") {
          if (!shiftId) {
            throw new Error("No active shift ID found");
          }

          const location = await getCurrentLocation();

          if (!location) {
            throw new Error("Location permission denied");
          }

          const breakPayload = {
            breakStartLocation: {
              longitude: location.longitude.toString(),
              latitude: location.latitude.toString(),
            },
          };

          console.log(
            "Starting break with payload:",
            JSON.stringify({
              shiftId,
              ...breakPayload,
            })
          );

          const response = await startShiftBreak(shiftId, breakPayload);

          if (!response) {
            throw new Error("No response received from server");
          }

          console.log("Break started successfully with ID:", response.id);
          const breakId = response.id;

          set({
            status: "break",
            breakId,
            breakStartTime: new Date(),
            currentBreakStartLocation: location,
            lastKnownLocation: location,
          });
        }
      } catch (error: any) {
        // Handle axios errors more specifically
        if (error.response) {
          console.error("Error response from server:", {
            status: error.response.status,
            data: JSON.stringify(error.response.data),
          });

          if (error.response.data && error.response.data.message) {
            throw new Error(
              `Failed to take break: ${error.response.data.message}`
            );
          } else if (
            error.response.data &&
            typeof error.response.data === "object"
          ) {
            // Check for validation errors
            const errorMessages = Object.values(error.response.data)
              .flat()
              .join(", ");
            if (errorMessages) {
              throw new Error(`Failed to take break: ${errorMessages}`);
            }
          }
          throw new Error(
            `Failed to take break: Server returned ${error.response.status}`
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          console.error("Error taking break:", error);
          throw new Error(
            `Could not take break: ${error.message || "Unknown error"}`
          );
        }
      } finally {
        setIsTakingBreak(false);
      }
    },

    resumeShift: async () => {
      const {
        breakStartTime,
        totalBreakTime,
        breakHistory,
        currentBreakStartLocation,
      } = get();
      const { setIsResumingShift, shiftId, breakId } = get();
      setIsResumingShift(true);

      try {
        if (get().status !== "break" || !breakStartTime) {
          throw new Error("No active break to resume from");
        }

        if (!shiftId) {
          throw new Error("No active shift ID found");
        }

        if (!breakId) {
          throw new Error("No active break ID found");
        }

        const now = new Date();
        const breakDuration = now.getTime() - breakStartTime.getTime();

        const location = await getCurrentLocation();

        if (!location) {
          throw new Error("Location permission denied");
        }

        console.log(
          "Ending break with payload:",
          JSON.stringify({
            shiftId,
            breakId,
            breakEndLocation: {
              longitude: location.longitude.toString(),
              latitude: location.latitude.toString(),
            },
          })
        );

        const newBreakRecord: BreakRecord = {
          startTime: breakStartTime,
          endTime: now,
          duration: breakDuration,
          startLocation: currentBreakStartLocation || undefined,
          endLocation: location || undefined,
        };

        await endShiftBreak(shiftId, breakId, {
          breakEndLocation: {
            longitude: location.longitude.toString(),
            latitude: location.latitude.toString(),
          },
        });

        console.log("Break ended successfully");

        set({
          status: "active",
          breakStartTime: null,
          breakId: null,
          totalBreakTime: totalBreakTime + breakDuration,
          breakHistory: [...breakHistory, newBreakRecord],
          currentBreakStartLocation: null,
          lastKnownLocation: location,
        });
      } catch (error: any) {
        // Handle axios errors more specifically
        if (error.response) {
          console.error("Error response from server:", {
            status: error.response.status,
            data: JSON.stringify(error.response.data),
          });

          if (error.response.data && error.response.data.message) {
            throw new Error(
              `Failed to resume shift: ${error.response.data.message}`
            );
          } else if (
            error.response.data &&
            typeof error.response.data === "object"
          ) {
            // Check for validation errors
            const errorMessages = Object.values(error.response.data)
              .flat()
              .join(", ");
            if (errorMessages) {
              throw new Error(`Failed to resume shift: ${errorMessages}`);
            }
          }
          throw new Error(
            `Failed to resume shift: Server returned ${error.response.status}`
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          console.error("Error resuming shift:", error);
          throw new Error(
            `Could not resume shift: ${error.message || "Unknown error"}`
          );
        }
      } finally {
        setIsResumingShift(false);
      }
    },

    updateLocation: async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          set({ lastKnownLocation: location });
          return location;
        }
        return null;
      } catch (error) {
        console.error("Error updating location:", error);
        return null;
      }
    },

    endShift: async () => {
      const {
        startTime,
        totalBreakTime,
        breakHistory,
        completedShifts,
        startLocation,
        setIsEndingShift,
        shiftId,
      } = get();
      setIsEndingShift(true);

      try {
        if (!startTime) {
          throw new Error("No active shift to end");
        }

        if (!shiftId) {
          throw new Error("No active shift ID found");
        }

        const now = new Date();
        const shiftDuration = now.getTime() - startTime.getTime();

        const endLocation = await getCurrentLocation();

        if (!endLocation) {
          throw new Error("Location permission denied");
        }

        // Format date strings
        const formatDate = (date: Date): string => {
          const options: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
            year: "numeric",
          };
          return date.toLocaleDateString("en-US", options);
        };

        // Format time strings
        const formatTime = (date: Date): string => {
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          return `${formattedHours}:${formattedMinutes} ${ampm}`;
        };

        // Process break locations for the completed shift
        const breakLocations = breakHistory
          .filter((record) => record.startLocation && record.endLocation)
          .map((record) => ({
            start: record.startLocation!,
            end: record.endLocation!,
          }));

        // Create a new completed shift record with location data
        const newCompletedShift: CompletedShift = {
          id: Date.now().toString(),
          date: formatDate(startTime),
          startTime: formatTime(startTime),
          endTime: formatTime(now),
          duration: shiftDuration,
          breakCount: breakHistory.length,
          totalBreakTime: totalBreakTime,
          startLocation: startLocation || undefined,
          endLocation: endLocation || undefined,
          breakLocations:
            breakLocations.length > 0 ? breakLocations : undefined,
        };

        const endShiftPayload = {
          endLocation: {
            longitude: endLocation.longitude.toString(),
            latitude: endLocation.latitude.toString(),
          },
        };

        console.log(
          "Ending shift with payload:",
          JSON.stringify({
            shiftId,
            ...endShiftPayload,
          })
        );

        await endShift(shiftId, endShiftPayload);
        console.log("Shift ended successfully");

        set({
          status: "idle",
          shiftId: "",
          startTime: null,
          breakStartTime: null,
          breakId: null,
          totalBreakTime: 0,
          breakHistory: [],
          startLocation: null,
          lastKnownLocation: null,
          currentBreakStartLocation: null,
          // Add the new shift to the beginning of the completed shifts array
          completedShifts: [newCompletedShift, ...completedShifts.slice(0, 9)],
        });
      } catch (error: any) {
        // Handle axios errors more specifically
        if (error.response) {
          console.error("Error response from server:", {
            status: error.response.status,
            data: JSON.stringify(error.response.data),
          });

          if (error.response.data && error.response.data.message) {
            throw new Error(
              `Failed to end shift: ${error.response.data.message}`
            );
          } else if (
            error.response.data &&
            typeof error.response.data === "object"
          ) {
            // Check for validation errors
            const errorMessages = Object.values(error.response.data)
              .flat()
              .join(", ");
            if (errorMessages) {
              throw new Error(`Failed to end shift: ${errorMessages}`);
            }
          }
          throw new Error(
            `Failed to end shift: Server returned ${error.response.status}`
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          console.error("Error ending shift:", error);
          throw new Error(
            `Could not end shift: ${error.message || "Unknown error"}`
          );
        }
      } finally {
        setIsEndingShift(false);
      }
    },
  },
}));
