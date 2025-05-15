import { create } from "zustand";

export type ShiftStatus = "idle" | "active" | "break";

interface BreakRecord {
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
}

export interface CompletedShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakCount: number;
  totalBreakTime: number;
}

interface ShiftState {
  status: ShiftStatus;
  startTime: Date | null;
  breakStartTime: Date | null;
  totalBreakTime: number; // in milliseconds
  breakHistory: BreakRecord[];
  completedShifts: CompletedShift[];
  actions: {
    startShift: () => void;
    takeBreak: () => void;
    resumeShift: () => void;
    endShift: () => void;
  };
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  status: "idle",
  startTime: null,
  breakStartTime: null,
  totalBreakTime: 0,
  breakHistory: [],
  completedShifts: [],

  actions: {
    startShift: () => {
      set({
        status: "active",
        startTime: new Date(),
        breakStartTime: null,
        totalBreakTime: 0,
        breakHistory: [],
      });
    },

    takeBreak: () => {
      if (get().status === "active") {
        set({
          status: "break",
          breakStartTime: new Date(),
        });
      }
    },

    resumeShift: () => {
      const { breakStartTime, totalBreakTime, breakHistory } = get();
      if (get().status === "break" && breakStartTime) {
        const now = new Date();
        const breakDuration = now.getTime() - breakStartTime.getTime();

        // Add to break history
        const newBreakRecord: BreakRecord = {
          startTime: breakStartTime,
          endTime: now,
          duration: breakDuration,
        };

        set({
          status: "active",
          breakStartTime: null,
          totalBreakTime: totalBreakTime + breakDuration,
          breakHistory: [...breakHistory, newBreakRecord],
        });
      }
    },

    endShift: () => {
      const { startTime, totalBreakTime, breakHistory, completedShifts } =
        get();

      if (startTime) {
        const now = new Date();
        const shiftDuration = now.getTime() - startTime.getTime();

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

        // Create a new completed shift record
        const newCompletedShift: CompletedShift = {
          id: Date.now().toString(),
          date: formatDate(startTime),
          startTime: formatTime(startTime),
          endTime: formatTime(now),
          duration: shiftDuration,
          breakCount: breakHistory.length,
          totalBreakTime: totalBreakTime,
        };

        set({
          status: "idle",
          startTime: null,
          breakStartTime: null,
          totalBreakTime: 0,
          breakHistory: [],
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
        });
      }
    },
  },
}));
