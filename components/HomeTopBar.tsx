import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Types
interface Organization {
  id: string;
  name: string;
  plan?: string;
  photoURL?: string;
}

interface User {
  initials: string;
  avatarUrl?: string;
  fullName?: string;
  email?: string;
}

interface HomeTopBarProps {
  organizations: Organization[];
  selectedOrg: Organization;
  onOrgChange: (org: Organization) => void;
  user: User;
  style?: ViewStyle;
  showUserInfo?: boolean;
  onUserPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const HomeTopBar: React.FC<HomeTopBarProps> = ({
  organizations,
  selectedOrg,
  onOrgChange,
  user,
  style,
  showUserInfo = false,
  onUserPress,
  isLoading = false,
  disabled = false,
}) => {
  const [orgSelectorVisible, setOrgSelectorVisible] = useState(false);

  const handleOrgSelect = (org: Organization) => {
    if (disabled) return;
    onOrgChange(org);
    setOrgSelectorVisible(false);
  };

  const toggleDropdown = () => {
    if (disabled || isLoading) return;
    setOrgSelectorVisible(!orgSelectorVisible);
  };

  return (
    <View style={[styles.orgSelectorContainer, style]}>
      <View style={styles.headerRow}>
        <View style={styles.orgSection}>
          <Text style={styles.labelText}>
            Organization
          </Text>
          <TouchableOpacity
            onPress={toggleDropdown}
            style={[
              styles.orgSelector,
              disabled && styles.disabled
            ]}
            disabled={disabled || isLoading}
          >
            <Text style={styles.orgName}>
              {isLoading ? "Loading..." : selectedOrg.name}
            </Text>
            {!isLoading && (
              <Feather
                name={orgSelectorVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color={disabled ? "#999" : "#333"}
                style={styles.chevronIcon}
              />
            )}
          </TouchableOpacity>
          {showUserInfo && user.email && (
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onUserPress}
          disabled={!onUserPress || isLoading}
          style={[
            styles.avatar,
            isLoading && styles.avatarLoading
          ]}
        >
          <Text style={[
            styles.avatarText,
            isLoading && styles.avatarTextLoading
          ]}>
            {isLoading ? "..." : user.initials}
          </Text>
        </TouchableOpacity>
      </View>

      {orgSelectorVisible && !disabled && !isLoading && (
        <View style={styles.dropdownMenu}>
          {organizations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No organizations available
              </Text>
            </View>
          ) : (
            organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                onPress={() => handleOrgSelect(org)}
                style={[
                  styles.dropdownItem,
                  selectedOrg.id === org.id && styles.selectedItem,
                ]}
              >
                <View style={styles.dropdownItemContent}>
                  <View style={styles.orgInfo}>
                    <Text
                      style={[
                        styles.dropdownOrgName,
                        selectedOrg.id === org.id && styles.selectedOrgName,
                      ]}
                      numberOfLines={1}
                    >
                      {org.name}
                    </Text>
                    {org.plan && (
                      <Text style={styles.planText}>
                        {org.plan} Plan
                      </Text>
                    )}
                  </View>
                  {selectedOrg.id === org.id && (
                    <Feather name="check" size={16} color="#007aff" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orgSelectorContainer: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orgSection: {
    flex: 1,
    marginRight: 16,
  },
  labelText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  orgSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  orgName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  userEmail: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLoading: {
    backgroundColor: "#e5e7eb",
  },
  avatarText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 16,
  },
  avatarTextLoading: {
    color: "#9ca3af",
  },
  dropdownMenu: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    padding: 16,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: 16,
  },
  dropdownItem: {
    borderRadius: 4,
    padding: 12,
  },
  selectedItem: {
    backgroundColor: "#e6f7ff",
  },
  dropdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orgInfo: {
    flex: 1,
  },
  dropdownOrgName: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "400",
  },
  selectedOrgName: {
    color: "#2563eb",
    fontWeight: "500",
  },
  planText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
});
