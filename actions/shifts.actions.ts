import { getUserCustomClaims } from "@/actions/auth.actions";
import { auth } from "@/FirebaseConfig";
import axios from "axios";

// Import types from API and types folder
import { IShift, IShiftBreak } from "@/types/shifts.types";

// Response interfaces for better type safety
export interface IShiftResponse {
  id: string;
  orgId: string;
  departmentId: string;
  openedBy: string;
  openedByName?: string;
  openedByEmail?: string;
  openedByProfileImage?: string;
  department?: string;
  startTime: Date;
  startLocation: {
    longitude: string;
    latitude: string;
  };
  endTime?: Date;
  endLocation?: {
    longitude: string;
    latitude: string;
  };
  duration: string;
  breaks: IShiftBreak[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface IShiftBreakResponse {
  id: string;
  shiftId: string;
  breakStartTime: Date;
  breakStartLocation: {
    longitude: string;
    latitude: string;
  };
  breakEndTime?: Date;
  breakEndLocation?: {
    longitude: string;
    latitude: string;
  };
  breakDuration: string;
  updatedAt?: Date;
}

export interface IPaginationResponse {
  currentPage: number;
  totalPages: number;
  totalShifts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request payload types
interface ICreateShiftPayload {
  orgId: string;
  departmentId: string;
  startTime?: Date;
  startLocation: {
    longitude: string;
    latitude: string;
  };
}

interface IStartShiftPayload {
  orgId: string;
  departmentId: string;
  startTime?: Date;
  startLocation: {
    longitude: string;
    latitude: string;
  };
}

interface IEndShiftPayload {
  endTime?: Date;
  endLocation?: {
    longitude: string;
    latitude: string;
  };
}

interface ICreateBreakPayload {
  breakStartTime?: Date;
  breakStartLocation: {
    longitude: string;
    latitude: string;
  };
  breakEndTime?: Date;
  breakEndLocation?: {
    longitude: string;
    latitude: string;
  };
  breakDuration?: string;
}

interface IStartBreakPayload {
  breakStartTime?: Date;
  breakStartLocation: {
    longitude: string;
    latitude: string;
  };
}

interface IEndBreakPayload {
  breakEndTime?: Date;
  breakEndLocation?: {
    longitude: string;
    latitude: string;
  };
}

type IUpdateShiftData = Partial<
  Omit<
    IShift,
    "id" | "openedBy" | "openedByName" | "openedByEmail" | "createdAt"
  >
>;
type IUpdateBreakData = Partial<Omit<IShiftBreak, "id" | "shiftId">>;

// ====================
// CORE SHIFT OPERATIONS
// ====================

/**
 * Get all shifts for the authenticated user with pagination
 */
export async function getShifts(
  target: "user" | "organization",
  page: number = 1,
  limit: number = 10,
  status?: "active" | "completed",
  departmentId?: string
): Promise<
  { shifts: IShiftResponse[]; pagination: IPaginationResponse } | undefined
> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const { orgId } = await getUserCustomClaims(authToken);
    const userId = auth.currentUser?.uid;

    if (!orgId) {
      throw new Error("Organization ID is required to retrieve shifts");
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      userId: userId || "",
      orgId,
      target,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) queryParams.append("status", status);
    if (departmentId) queryParams.append("departmentId", departmentId);

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return {
      shifts: response.data.shifts as IShiftResponse[],
      pagination: response.data.pagination as IPaginationResponse,
    };
  } catch (error) {
    console.error("Failed to get shifts:", error);
    throw error;
  }
}

/**
 * Create a new shift
 */
export async function createShift(
  shiftPayload: ICreateShiftPayload
): Promise<IShiftResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts`,
      shiftPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.shift as IShiftResponse;
  } catch (error) {
    console.error("Failed to create shift:", error);
    throw error;
  }
}

/**
 * Get a specific shift by ID
 */
export async function getShiftById(
  shiftId: string
): Promise<IShiftResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.shift as IShiftResponse;
  } catch (error) {
    console.error("Failed to get shift:", error);
    throw error;
  }
}

/**
 * Update a specific shift
 */
export async function updateShift(
  shiftId: string,
  shiftDataToUpdate: IUpdateShiftData
): Promise<IShiftResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}`,
      shiftDataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.shift as IShiftResponse;
  } catch (error) {
    console.error("Failed to update shift:", error);
    throw error;
  }
}

/**
 * Delete a specific shift and all its breaks
 */
export async function deleteShift(shiftId: string): Promise<void> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    console.error("Failed to delete shift:", error);
    throw error;
  }
}

// ====================
// SHIFT START/END OPERATIONS
// ====================

/**
 * Start a new shift
 */
export async function startShift(
  startShiftPayload: IStartShiftPayload
): Promise<IShiftResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/start`,
      startShiftPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.shift as IShiftResponse;
  } catch (error) {
    console.error("Failed to start shift:", error);
    throw error;
  }
}

/**
 * End an active shift
 */
export async function endShift(
  shiftId: string,
  endShiftPayload: IEndShiftPayload
): Promise<{ shift: IShiftResponse; totalDuration: string } | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/end`,
      endShiftPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return {
      shift: response.data.shift as IShiftResponse,
      totalDuration: response.data.totalDuration as string,
    };
  } catch (error) {
    console.error("Failed to end shift:", error);
    throw error;
  }
}

// ====================
// BREAK MANAGEMENT OPERATIONS
// ====================

/**
 * Get all breaks for a specific shift
 */
export async function getShiftBreaks(
  shiftId: string
): Promise<IShiftBreakResponse[] | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.breaks as IShiftBreakResponse[];
  } catch (error) {
    console.error("Failed to get shift breaks:", error);
    throw error;
  }
}

/**
 * Create a new break for a shift
 */
export async function createShiftBreak(
  shiftId: string,
  breakPayload: ICreateBreakPayload
): Promise<IShiftBreakResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks`,
      breakPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.break as IShiftBreakResponse;
  } catch (error) {
    console.error("Failed to create shift break:", error);
    throw error;
  }
}

/**
 * Get a specific break by ID
 */
export async function getShiftBreakById(
  shiftId: string,
  breakId: string
): Promise<IShiftBreakResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks/${breakId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.break as IShiftBreakResponse;
  } catch (error) {
    console.error("Failed to get shift break:", error);
    throw error;
  }
}

/**
 * Update a specific break
 */
export async function updateShiftBreak(
  shiftId: string,
  breakId: string,
  breakDataToUpdate: IUpdateBreakData
): Promise<IShiftBreakResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks/${breakId}`,
      breakDataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.break as IShiftBreakResponse;
  } catch (error) {
    console.error("Failed to update shift break:", error);
    throw error;
  }
}

/**
 * Delete a specific break
 */
export async function deleteShiftBreak(
  shiftId: string,
  breakId: string
): Promise<void> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    await axios.delete(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks/${breakId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to delete shift break:", error);
    throw error;
  }
}

// ====================
// BREAK UTILITY OPERATIONS
// ====================

/**
 * Start a new break for an active shift
 */
export async function startShiftBreak(
  shiftId: string,
  startBreakPayload: IStartBreakPayload
): Promise<IShiftBreakResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks/start`,
      startBreakPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.break as IShiftBreakResponse;
  } catch (error) {
    console.error("Failed to start shift break:", error);
    throw error;
  }
}

/**
 * End an active break
 */
export async function endShiftBreak(
  shiftId: string,
  breakId: string,
  endBreakPayload: IEndBreakPayload
): Promise<{ break: IShiftBreakResponse; totalDuration: string } | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/breaks/${breakId}/end`,
      endBreakPayload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return {
      break: response.data.break as IShiftBreakResponse,
      totalDuration: response.data.totalDuration as string,
    };
  } catch (error) {
    console.error("Failed to end shift break:", error);
    throw error;
  }
}

// ====================
// DATA SYNCHRONIZATION
// ====================

/**
 * Synchronize shift breaks data
 */
export async function syncShiftBreaks(
  shiftId: string
): Promise<{ breaksCount: number; breaks: IShiftBreakResponse[] } | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/shifts/${shiftId}/sync-breaks`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return {
      breaksCount: response.data.breaksCount as number,
      breaks: response.data.breaks as IShiftBreakResponse[],
    };
  } catch (error) {
    console.error("Failed to sync shift breaks:", error);
    throw error;
  }
}

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Check if user has an active shift
 */
export async function hasActiveShift(): Promise<boolean> {
  try {
    const shifts = await getShifts("user", 1, 1, "active");
    return (shifts?.shifts.length || 0) > 0;
  } catch (error) {
    console.error("Failed to check active shift:", error);
    return false;
  }
}

/**
 * Get current active shift
 */
export async function getActiveShift(): Promise<IShiftResponse | undefined> {
  try {
    const shifts = await getShifts("user", 1, 1, "active");
    return shifts?.shifts[0];
  } catch (error) {
    console.error("Failed to get active shift:", error);
    return undefined;
  }
}

/**
 * Check if shift has an active break
 */
export async function hasActiveBreak(shiftId: string): Promise<boolean> {
  try {
    const breaks = await getShiftBreaks(shiftId);
    return (
      breaks?.some((breakItem) => breakItem.breakDuration === "In Progress") ||
      false
    );
  } catch (error) {
    console.error("Failed to check active break:", error);
    return false;
  }
}

/**
 * Get current active break for a shift
 */
export async function getActiveBreak(
  shiftId: string
): Promise<IShiftBreakResponse | undefined> {
  try {
    const breaks = await getShiftBreaks(shiftId);
    return breaks?.find(
      (breakItem) => breakItem.breakDuration === "In Progress"
    );
  } catch (error) {
    console.error("Failed to get active break:", error);
    return undefined;
  }
}
