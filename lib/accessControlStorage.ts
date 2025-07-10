import { IAccessControlData } from "@/types/access-control.types";
import * as SecureStore from "expo-secure-store";

const ACCESS_CONTROL_KEY = "accessControlData";

/**
 * Helper function to serialize access control data
 */
const serializeOrgLogoAndOrganizations = (
  data: Partial<IAccessControlData>
) => {
  const serializedData = { ...data };

  // Convert orgLogo if it's a React element type
  if (typeof serializedData.orgLogo !== "string" && serializedData.orgLogo) {
    serializedData.orgLogo = "component";
  }

  // Handle organizations array
  if (serializedData.organizations) {
    serializedData.organizations = serializedData.organizations.map((org) => ({
      ...org,
      photoURL: typeof org.photoURL === "string" ? org.photoURL : "component",
    }));
  }

  return serializedData;
};

const serializeAccessControlData = (
  data: Partial<IAccessControlData>
): Partial<IAccessControlData> => {
  return serializeOrgLogoAndOrganizations(data);
};

/**
 * Save access control data to secure storage
 */
export const saveAccessControlToStorage = async (
  data: IAccessControlData
): Promise<void> => {
  try {
    // Create a serializable copy of the data
    const serializableData = serializeAccessControlData(data);
    await SecureStore.setItemAsync(
      ACCESS_CONTROL_KEY,
      JSON.stringify(serializableData)
    );
  } catch (error) {
    console.error("Error saving access control data to secure storage:", error);
  }
};

/**
 * Get access control data from secure storage
 */
export const getAccessControlFromStorage =
  async (): Promise<IAccessControlData | null> => {
    try {
      const storedData = await SecureStore.getItemAsync(ACCESS_CONTROL_KEY);
      if (storedData) {
        try {
          return JSON.parse(storedData) as IAccessControlData;
        } catch (error) {
          console.error(
            "Error parsing access control data from secure storage:",
            error
          );
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error(
        "Error getting access control data from secure storage:",
        error
      );
      return null;
    }
  };

/**
 * Update specific fields in the access control data in secure storage
 */
export const updateAccessControlInStorage = async (
  data: Partial<IAccessControlData>
): Promise<void> => {
  try {
    const currentData = (await getAccessControlFromStorage()) || {};
    const updatedData = { ...currentData, ...data };

    // Create a serializable copy of the updated data
    const serializableData = serializeAccessControlData(updatedData);

    await SecureStore.setItemAsync(
      ACCESS_CONTROL_KEY,
      JSON.stringify(serializableData)
    );
  } catch (error) {
    console.error(
      "Error updating access control data in secure storage:",
      error
    );
  }
};

/**
 * Remove access control data from secure storage
 */
export const removeAccessControlFromStorage = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_CONTROL_KEY);
  } catch (error) {
    console.error(
      "Error removing access control data from secure storage:",
      error
    );
  }
};
