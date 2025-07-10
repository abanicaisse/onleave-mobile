import {
  getAccessControlFromStorage,
  removeAccessControlFromStorage,
  saveAccessControlToStorage,
  updateAccessControlInStorage,
} from "@/lib/accessControlStorage";
import { useAccessControlStore } from "@/store/accessControlStore";
import { IAccessControlData } from "@/types/access-control.types";
import { useEffect, useState } from "react";

export const useAccessControlManager = () => {
  const {
    accessControlData,
    setAccessControlData,
    updateAccessControlData,
    clearAccessControlData,
  } = useAccessControlStore();

  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from secure storage on mount
  useEffect(() => {
    let mounted = true;

    const initializeAccessControl = async () => {
      try {
        setIsLoading(true);
        const storedData = await getAccessControlFromStorage();
        if (mounted && storedData) {
          setAccessControlData(storedData);
        } else if (mounted) {
          console.log("No access control data found in storage");
        }
      } catch (error) {
        if (mounted) {
          console.error("Error initializing access control data:", error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAccessControl();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Save access control data to both the store and secure storage
  const saveAccessControl = async (data: IAccessControlData) => {
    try {
      setAccessControlData(data);
      await saveAccessControlToStorage(data);
    } catch (error) {
      console.error("Error saving access control data:", error);
    }
  };

  // Update access control data in both store and secure storage
  const updateAccessControl = async (data: Partial<IAccessControlData>) => {
    try {
      const updatedData = {
        ...accessControlData,
        ...data,
      };
      updateAccessControlData(updatedData);
      await updateAccessControlInStorage(data);
    } catch (error) {
      console.error("Error updating access control data:", error);
    }
  };

  // Update the current organization and related data
  const switchOrganization = async (
    orgId: string,
    appRole: string,
    orgRole: string
  ) => {
    if (!accessControlData.organizations) {
      console.warn("No organizations available in access control data");
      return;
    }

    const targetOrg = accessControlData.organizations.find(
      (org) => org.id === orgId
    );
    if (!targetOrg) {
      console.warn("Target organization not found:", orgId);
      return;
    }

    const updatedData: Partial<IAccessControlData> = {
      appRole: appRole,
      orgRole: orgRole,
      orgId: targetOrg.id,
      orgName: targetOrg.name,
      orgLogo: targetOrg.photoURL,
      orgPlan: targetOrg.plan,
    };

    await updateAccessControl(updatedData);
    return updatedData;
  };

  // Clear access control data from both store and secure storage
  const clearAccessControl = async () => {
    try {
      clearAccessControlData();
      await removeAccessControlFromStorage();
    } catch (error) {
      console.error("Error clearing access control data:", error);
    }
  };

  return {
    accessControlData,
    isLoading,
    saveAccessControl,
    updateAccessControl,
    switchOrganization,
    clearAccessControl,
  };
};
