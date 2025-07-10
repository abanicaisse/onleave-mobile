import { getUserDetails } from "@/actions/users.actions";
import { useAccessControlManager } from "@/hooks/use-access-control-manager";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { HomeTopBar } from "./HomeTopBar";

interface ConnectedHomeTopBarProps {
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  showUserInfo?: boolean;
  onUserPress?: () => void;
}

/**
 * Connected version of HomeTopBar that integrates with the access control system
 */
export const ConnectedHomeTopBar: React.FC<ConnectedHomeTopBarProps> = (
  props
) => {
  const { auth } = useAuthStore();
  const user = auth?.currentUser;

  const { accessControlData, isLoading: accessLoading } =
    useAccessControlManager();

  const { data: userDetails } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUserDetails(auth?.currentUser?.uid!),
  });

  // Create user object for the component
  const userForComponent = React.useMemo(() => {
    if (!userDetails) {
      return { initials: "..." };
    }

    const initials = (() => {
      if (userDetails && "fullName" in userDetails && userDetails.fullName) {
        return userDetails.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();
      }
      return userDetails?.email?.[0]?.toUpperCase() || "U";
    })();

    return {
      initials,
      avatarUrl:
        (userDetails && "photoURL" in userDetails && userDetails.photoURL) ||
        undefined,
      fullName:
        (userDetails && "fullName" in userDetails && userDetails.fullName) ||
        undefined,
      email: userDetails?.email || undefined,
    };
  }, [userDetails]);

  // Simple teams array from access control data only
  const teams = React.useMemo(() => {
    if (accessControlData?.organizations) {
      return accessControlData.organizations
        .filter((org) => org.id && org.name)
        .map((org) => ({ id: org.id!, name: org.name! }));
    }
    return [];
  }, [accessControlData?.organizations]);

  // Get active team
  const activeTeam = React.useMemo(() => {
    if (accessControlData?.orgId && accessControlData?.orgName) {
      return {
        id: accessControlData.orgId,
        name: accessControlData.orgName,
      };
    }

    if (teams.length > 0) {
      return teams[0];
    }

    return {
      id: "default",
      name: "No Organization",
    };
  }, [accessControlData?.orgId, accessControlData?.orgName, teams]);

  const handleOrgChange = async (org: { id: string; name: string }) => {
    // Minimal implementation to prevent errors
    console.log("Organization change requested:", org);
  };

  // Early return with loading state if no user
  if (!user) {
    return (
      <HomeTopBar
        organizations={[]}
        selectedOrg={{ id: "loading", name: "Loading..." }}
        onOrgChange={handleOrgChange}
        user={{ initials: "..." }}
        isLoading={true}
        disabled={true}
        {...props}
      />
    );
  }

  return (
    <HomeTopBar
      organizations={teams}
      selectedOrg={activeTeam}
      onOrgChange={handleOrgChange}
      user={userForComponent}
      isLoading={accessLoading}
      disabled={false}
      {...props}
    />
  );
};
