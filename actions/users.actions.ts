import { auth } from "@/FirebaseConfig";

import axios from "axios";

import { ILeaveReq } from "@/types/leaves.types";
import { IUser, IUserOrganizations } from "@/types/users.types";
import { getUserCustomClaims } from "./auth.actions";

export interface IUpdateUser {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  userName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  organizations?: IUserOrganizations[];
  userOrgsIds?: string[];
  leaves?: ILeaveReq[];
  onboardingStep?: number;
  isOnboarded?: boolean;
}

// Create a new user document in the firestore database
export async function createNewUser(authToken: string) {
  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}}/users`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data?.user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user document to the firestore database");
  }
}

// Update user details
export const updateUserProfile = async (userDataToUpdate: IUpdateUser) => {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}}/users/${auth.currentUser?.uid}`,
      userDataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

// Get user details
export const getUserDetails = async (
  userId: string
): Promise<IGetUserResponse | undefined> => {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

interface IGetUserResponse extends IUser {
  orgRole: string;
}

// Get all users in the organization
export async function getOrgUsers(
  limit: number,
  page: number
): Promise<{ users: IGetUserResponse[]; totalPages: number } | undefined> {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const { orgId, orgRole } = await getUserCustomClaims(authToken);

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/users?orgId=${orgId}&limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const users: IGetUserResponse[] = response.data.users.map(
      (user: IUser) => ({
        ...user,
        orgRole,
      })
    );

    return {
      users,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all users with orgRole of supervisor or hr in the organization
export async function getSupervisors(): Promise<
  | {
      supervisors: ({
        id: string;
        email: string;
        appRole: string;
        orgRole: string;
        addedAt: Date;
      } & IUser)[];
    }
  | undefined
> {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const { orgId } = await getUserCustomClaims(authToken);

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const filteredSupervisors: {
      id: string;
      email: string;
      appRole: string;
      orgRole: string;
      addedAt: Date;
    }[] = response.data.organization.members.filter(
      (member: {
        id: string;
        email: string;
        appRole: string;
        orgRole: string;
        addedAt: Date;
      }) => member.orgRole === "supervisor" || member.orgRole === "hr"
    );

    const supervisors = await Promise.all(
      filteredSupervisors.map(async (supervisor) => {
        const userDetails = await getUserDetails(supervisor.id);
        return { ...supervisor, ...userDetails };
      })
    );

    return { supervisors };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
