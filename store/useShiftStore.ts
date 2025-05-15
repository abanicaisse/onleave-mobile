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
  status: ShiftStatus;
  startTime: Date | null;
  breakStartTime: Date | null;
  totalBreakTime: number; // in milliseconds
  breakHistory: BreakRecord[];
  startLocation: LocationData | null;
  lastKnownLocation: LocationData | null;
  currentBreakStartLocation: LocationData | null;
  completedShifts: CompletedShift[];
  actions: {
    startShift: () => Promise<void>;
    takeBreak: () => Promise<void>;
    resumeShift: () => Promise<void>;
    endShift: () => Promise<void>;
    updateLocation: () => Promise<LocationData | null>;
  };
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  status: "idle",
  startTime: null,
  breakStartTime: null,
  totalBreakTime: 0,
  breakHistory: [],
  startLocation: null,
  lastKnownLocation: null,
  currentBreakStartLocation: null,
  completedShifts: [],

  actions: {
    startShift: async () => {
      // Get current location
      const location = await getCurrentLocation();

      // Abort if location is not available
      if (!location) {
        throw new Error("Location permission denied");
      }

      set({
        status: "active",
        startTime: new Date(),
        breakStartTime: null,
        totalBreakTime: 0,
        breakHistory: [],
        startLocation: location,
        lastKnownLocation: location,
      });
    },

    takeBreak: async () => {
      if (get().status === "active") {
        // Get current location when break starts
        const location = await getCurrentLocation();

        // Abort if location is not available
        if (!location) {
          throw new Error("Location permission denied");
        }

        set({
          status: "break",
          breakStartTime: new Date(),
          currentBreakStartLocation: location,
          lastKnownLocation: location,
        });
      }
    },

    resumeShift: async () => {
      const {
        breakStartTime,
        totalBreakTime,
        breakHistory,
        currentBreakStartLocation,
      } = get();
      if (get().status === "break" && breakStartTime) {
        const now = new Date();
        const breakDuration = now.getTime() - breakStartTime.getTime();

        // Get current location when break ends
        const location = await getCurrentLocation();

        // Abort if location is not available
        if (!location) {
          throw new Error("Location permission denied");
        }

        // Add to break history with location data
        const newBreakRecord: BreakRecord = {
          startTime: breakStartTime,
          endTime: now,
          duration: breakDuration,
          startLocation: currentBreakStartLocation || undefined,
          endLocation: location || undefined,
        };

        set({
          status: "active",
          breakStartTime: null,
          totalBreakTime: totalBreakTime + breakDuration,
          breakHistory: [...breakHistory, newBreakRecord],
          currentBreakStartLocation: null,
          lastKnownLocation: location,
        });
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
      } = get();

      if (startTime) {
        const now = new Date();
        const shiftDuration = now.getTime() - startTime.getTime();

        // Get current location for end of shift
        const endLocation = await getCurrentLocation();

        // Abort if location is not available
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

        set({
          status: "idle",
          startTime: null,
          breakStartTime: null,
          totalBreakTime: 0,
          breakHistory: [],
          startLocation: null,
          lastKnownLocation: null,
          currentBreakStartLocation: null,
          // Add the new shift to the beginning of the completed shifts array
          completedShifts: [newCompletedShift, ...completedShifts.slice(0, 9)], // Keep the most recent 10 shifts
        });
      } else {
        // If there was no startTime for some reason, just reset the state
        set({
          status: "idle",
          startTime: null,
          breakStartTime: null,
          totalBreakTime: 0,
          breakHistory: [],
          startLocation: null,
          lastKnownLocation: null,
          currentBreakStartLocation: null,
        });
      }
    },
  },
}));
