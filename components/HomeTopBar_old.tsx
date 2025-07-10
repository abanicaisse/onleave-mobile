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
  selectedOrg: Organization; // Make this required and non-null
  onOrgChange: (org: Organization) => void;
  user: User;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
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
  className = "",
  containerClassName = "",
  dropdownClassName = "",
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

  const renderUserAvatar = () => (
    <TouchableOpacity
      onPress={onUserPress}
      disabled={!onUserPress}
      className={``}
      style={styles.avatar}
      accessibilityRole="button"
      accessibilityLabel={`User profile${
        user.fullName ? ` for ${user.fullName}` : ""
      }`}
    >
      {user.avatarUrl ? (
        // If you want to add image support later, you can uncomment and use:
        // <Image source={{ uri: user.avatarUrl }} className="w-full h-full rounded-full" />
        <Text className="text-primary-blue font-bold">{user.initials}</Text>
      ) : (
        <Text className="text-primary-blue font-bold">{user.initials}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className={`${className}`} style={styles.orgSelectorContainer}>
      <View
        className={`flex-row justify-between items-center ${containerClassName}`}
      >
        <View className="flex-1 mr-4">
          <Text className="text-gray-500 text-sm font-medium">
            Organization
          </Text>
          <TouchableOpacity
            onPress={toggleDropdown}
            className={`flex-row items-center ${
              disabled ? "opacity-50" : "active:opacity-70"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Select organization, currently ${selectedOrg.name}`}
            accessibilityHint="Tap to view and switch between organizations"
            disabled={disabled || isLoading}
          >
            <Text
              className="text-lg font-bold flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isLoading ? "Loading..." : selectedOrg.name}
            </Text>
            {!isLoading && (
              <Feather
                name={orgSelectorVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color={disabled ? "#999" : "#333"}
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>

          {showUserInfo && user.email && (
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>

        {renderUserAvatar()}
      </View>

      {orgSelectorVisible && !disabled && !isLoading && (
        <View className={`mt-3 bg-white p-2`} style={styles.dropdownMenu}>
          {organizations.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No organizations available
            </Text>
          ) : (
            organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                onPress={() => handleOrgSelect(org)}
                style={[
                  styles.dropdownItem,
                  selectedOrg.id === org.id && styles.selectedItem,
                ]}
                className={`p-3 ${
                  selectedOrg.id === org.id ? "bg-blue-50" : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${org.name}`}
                accessibilityState={{ selected: selectedOrg.id === org.id }}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text
                      className={`${
                        selectedOrg.id === org.id
                          ? "text-primary-blue font-medium"
                          : "text-gray-700"
                      }`}
                      numberOfLines={1}
                    >
                      {org.name}
                    </Text>
                    {org.plan && (
                      <Text className="text-gray-400 text-xs mt-1">
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
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  avatar: {
    borderRadius: 20,
  },
  dropdownMenu: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    borderRadius: 4,
  },
  selectedItem: {
    backgroundColor: "#e6f7ff",
  },
});
