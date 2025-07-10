import { useAccessControlManager } from "@/hooks/use-access-control-manager";
import { useAuthAccessControl } from "@/hooks/use-auth-access-control";
import React from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

/**
 * Example component demonstrating how to use the access control system
 * You can integrate this into your main app component or create similar patterns
 */
export const AccessControlExample = () => {
  const {
    user,
    appRole,
    orgRole,
    orgId,
    orgName,
    organizations,
    isLoading,
    error,
  } = useAuthAccessControl();

  const { switchOrganization } = useAccessControlManager();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading access control...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading access control: {error.message}</Text>
      </View>
    );
  }

  const handleSwitchOrganization = async (
    targetOrgId: string,
    newAppRole: string,
    newOrgRole: string
  ) => {
    try {
      await switchOrganization(targetOrgId, newAppRole, newOrgRole);
      Alert.alert("Success", "Organization switched successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to switch organization");
      console.error("Switch organization error:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Access Control Info
      </Text>

      {user && (
        <View style={{ marginBottom: 15 }}>
          <Text>User: {user.email || "No email"}</Text>
          <Text>UID: {user.uid}</Text>
          {"fullName" in user && user.fullName && (
            <Text>Name: {user.fullName}</Text>
          )}
          {"displayName" in user && user.displayName && (
            <Text>Display Name: {user.displayName}</Text>
          )}
        </View>
      )}

      <View style={{ marginBottom: 15 }}>
        <Text>App Role: {appRole || "Not set"}</Text>
        <Text>Org Role: {orgRole || "Not set"}</Text>
        <Text>Org ID: {orgId || "Not set"}</Text>
        <Text>Org Name: {orgName || "Not set"}</Text>
      </View>

      {organizations && organizations.length > 0 && (
        <View>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Available Organizations:
          </Text>
          {organizations.map((org) => (
            <View key={org.id} style={{ marginBottom: 5 }}>
              <Text>
                {org.name} ({org.id})
              </Text>
              {org.plan && <Text>Plan: {org.plan}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
