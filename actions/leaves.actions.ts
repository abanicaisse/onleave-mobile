import { auth } from "@/FirebaseConfig";

import axios from "axios";

import { updateOrg } from "@/actions/organizations.actions";
import { updateUserProfile } from "@/actions/users.actions";
import { ILeaveReq } from "@/types/leaves.types";

import { getUserCustomClaims } from "@/actions/auth.actions";

interface ILeaveReqReturnResponse {
  id: string;
  openedBy: string;
  openedByName: string;
  openedAt: Date;
  organization: string;
  title: string;
  reason: string;
  supervisor: string;
  supervisorEmail: string;
  department: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejectionReason: string;
}

type IUpdateLeaveData = Omit<
  ILeaveReq,
  "id" | "openedAt" | "openedBy" | "openedByName" | "organization"
>;

export async function openLeaveReq(
  leaveReqPayload: ILeaveReq
): Promise<ILeaveReqReturnResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const { orgId } = await getUserCustomClaims(authToken);

    if (!orgId) {
      throw new Error("Organization ID is required to open a leave request");
    }

    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/leaves`, leaveReqPayload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    await updateUserProfile({
      leaves: [response.data.leaveReq],
    });

    await updateOrg(orgId, {
      leaves: [response.data.leaveReq],
    });

    return response.data.leaveReq as ILeaveReqReturnResponse;
  } catch (error) {
    throw error;
  }
}

export async function getSpecificLeaveReq(
  leaveId: string
): Promise<ILeaveReqReturnResponse | undefined> {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/leaves/${leaveId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data.leaveReq as ILeaveReqReturnResponse;
  } catch (error) {
    throw error;
  }
}

export async function getLeaveRequests(
  target: string,
  limit: number,
  page: number
): Promise<
  { leaveRequests: ILeaveReqReturnResponse[]; totalPages: number } | undefined
> {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();
  const userId = auth.currentUser?.uid;

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const { orgId } = await getUserCustomClaims(authToken);

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/leaves?userId=${userId}&orgId=${orgId}&target=${target}&limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const leaveRequests: ILeaveReqReturnResponse[] =
      response.data.leaveRequests;

    return {
      leaveRequests,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const updateLeaveReq = async (
  leaveId: string,
  leaveDataToUpdate: IUpdateLeaveData
): Promise<ILeaveReq | undefined> => {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/leaves/${leaveId}`,
      leaveDataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.leaveReq as ILeaveReqReturnResponse;
  } catch (error) {
    throw error;
  }
};
