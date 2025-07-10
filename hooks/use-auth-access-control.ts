import { auth } from "@/FirebaseConfig";
import { useEffect } from "react";
import { useAccessControl } from "./use-access-control";
import { useAccessControlManager } from "./use-access-control-manager";

/**
 * Combined hook that manages authentication and access control
 * This hook should be used in your main app component to initialize access control
 */
export const useAuthAccessControl = () => {
  const {
    accessControlData,
    isLoading: isStorageLoading,
    saveAccessControl,
    clearAccessControl,
  } = useAccessControlManager();

  const {
    data: accessControlFromAPI,
    isLoading: isAPILoading,
    error,
    refetch,
  } = useAccessControl();

  // When access control data is fetched from API, save it to secure storage
  useEffect(() => {
    if (accessControlFromAPI && !isAPILoading) {
      const dataToSave = {
        user: accessControlFromAPI.user
          ? {
              uid: accessControlFromAPI.user.uid,
              email: accessControlFromAPI.user.email || "",
              photoURL: accessControlFromAPI.user.photoURL || undefined,
              fullName: accessControlFromAPI.user.displayName || undefined,
            }
          : undefined,
        appRole: accessControlFromAPI.appRole,
        orgRole: accessControlFromAPI.orgRole,
        orgId: accessControlFromAPI.orgId,
      };

      saveAccessControl(dataToSave);
    }
  }, [accessControlFromAPI, isAPILoading, saveAccessControl]);

  // Clear access control when user signs out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        clearAccessControl();
      }
    });

    return unsubscribe;
  }, [clearAccessControl]);

  return {
    // Access control data from secure storage (immediate)
    localAccessControl: accessControlData,
    // Access control data from API (fresh)
    remoteAccessControl: accessControlFromAPI,
    // Loading states
    isLocalLoading: isStorageLoading,
    isRemoteLoading: isAPILoading,
    isLoading: isStorageLoading || isAPILoading,
    // Error from API
    error,
    // Refetch from API
    refetch,
    // Current user info
    user: accessControlData.user || accessControlFromAPI?.user,
    // Access control info
    appRole: accessControlData.appRole || accessControlFromAPI?.appRole,
    orgRole: accessControlData.orgRole || accessControlFromAPI?.orgRole,
    orgId: accessControlData.orgId || accessControlFromAPI?.orgId,
    orgName: accessControlData.orgName,
    orgLogo: accessControlData.orgLogo,
    organizations: accessControlData.organizations,
  };
};
