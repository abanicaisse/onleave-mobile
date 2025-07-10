import { auth } from "@/FirebaseConfig";

import axios from "axios";
import * as Yup from "yup";

import { CreateOrgSchema } from "@/lib/formSchemas";
import { ILeaveReq } from "@/types/leaves.types";

import { IOrganization } from "@/types/organizations.types";
import { getUserDetails } from "./users.actions";

export interface IUpdateOrgData {
  name?: string;
  owner?: string;
  roles?: string[];
  members?: {
    id: string;
    email: string;
    orgRole: string;
    appRole: string;
    addedAt: Date;
  }[];
  leaveTypes?: string[];
  leaves?: ILeaveReq[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const createOrg = async (
  inputValues: Yup.InferType<typeof CreateOrgSchema>
): Promise<IOrganization | undefined> => {
  const validatedValues = await CreateOrgSchema.validate(inputValues, {
    abortEarly: false,
  });

  const { organizationName } = validatedValues;

  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations`,
      {
        organizationName,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.organization;
  } catch (error) {
    throw error;
  }
};

export const updateOrg = async (
  orgId: string,
  orgDataToUpdate: IUpdateOrgData
) => {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}`,
      orgDataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data.organization;
  } catch (error) {
    throw error;
  }
};

export const getOrgDetails = async (orgId: string) => {
  if (!auth) return;
  const authToken = await auth.currentUser?.getIdToken();

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations/${orgId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data.organization;
  } catch (error) {
    throw error;
  }
};

export async function getMultipleOrgDetails(
  orgsIds: string[],
  limit: number,
  page: number
): Promise<{ organizations: IOrganization[]; totalPages: number } | undefined> {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();

  // const orgsIds = await getUserDetails(userId!).then(
  //   (user) => user?.userOrgsIds
  // );

  if (!orgsIds || orgsIds.length === 0) {
    return { organizations: [], totalPages: 0 };
  }

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations?orgsIds=${orgsIds}&limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const organizations: IOrganization[] = response.data.organizations;

    return {
      organizations,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error("Error fetching organization details:", error);
    throw error;
  }
}

// Get details of all organizations the user is a member of
export async function getUserOrgsDetails(
  limit: number,
  page: number
): Promise<{ organizations: IOrganization[]; totalPages: number } | undefined> {
  if (!auth) return;

  const authToken = await auth.currentUser?.getIdToken();
  const userId = auth.currentUser?.uid;

  const orgsIds = await getUserDetails(userId!).then(
    (user) => user?.userOrgsIds
  );

  if (!orgsIds || orgsIds.length === 0) {
    return { organizations: [], totalPages: 0 };
  }

  if (!authToken) {
    throw new Error("Auth Token is required");
  }

  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_API_URL}/organizations?orgsIds=${orgsIds}&limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const organizations: IOrganization[] = response.data.organizations;

    return {
      organizations,
      totalPages: response.data.totalPages,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
