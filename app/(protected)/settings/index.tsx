import { useRouter } from "expo-router";
import React, { useState } from "react";
// @ts-ignore
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import ProfileImagePicker from "../../../components/ProfileImagePicker";

// Define types for form data
type ProfileFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profileImage?: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Define validation schemas using Yup
const profileSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
});

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Current password is required")
    .min(8, "Password must be at least 8 characters"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .notOneOf(
      [yup.ref("currentPassword")],
      "New password must be different from current password"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export default function SettingsPage() {
  const router = useRouter();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Initialize form handling for profile section
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: "Aba",
      lastName: "Nicaisse",
      username: "abanicaisse",
      email: "",
    },
  });

  // Initialize form handling for password section
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Submit handlers
  const onProfileSubmit = (data: ProfileFormData) => {
    setIsSubmittingProfile(true);

    // Include profile image in the submission
    const dataWithImage = {
      ...data,
      profileImage: profileImage,
    };

    // Simulate API call
    console.log("Profile data submitted:", dataWithImage);

    // Explicitly log the image URI for clarity
    if (profileImage) {
      console.log("Profile image URI:", profileImage);
    } else {
      console.log("No profile image selected");
    }

    setTimeout(() => {
      setIsSubmittingProfile(false);
      Alert.alert("Success", "Profile information updated successfully");
    }, 1000);

    return dataWithImage;
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setIsSubmittingPassword(true);

    // Simulate API call
    console.log("Password data submitted:", data);
    setTimeout(() => {
      setIsSubmittingPassword(false);
      resetPassword();
      Alert.alert("Success", "Password updated successfully");
    }, 1000);

    return data;
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Simulate account deletion
            console.log("Account deletion requested");
            Alert.alert(
              "Account Deleted",
              "Your account has been deleted successfully"
            );
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#007aff" }}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Navigation tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "profile" && styles.activeTab,
              ]}
              onPress={() => setActiveSection("profile")}
            >
              <Feather
                name="user"
                size={18}
                color={activeSection === "profile" ? "#007aff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "password" && styles.activeTab,
              ]}
              onPress={() => setActiveSection("password")}
            >
              <Feather
                name="lock"
                size={18}
                color={activeSection === "password" ? "#007aff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "password" && styles.activeTabText,
                ]}
              >
                Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeSection === "danger" && styles.activeTab,
              ]}
              onPress={() => setActiveSection("danger")}
            >
              <Feather
                name="alert-triangle"
                size={18}
                color={activeSection === "danger" ? "#fd1b1b" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeSection === "danger" && styles.dangerActiveTabText,
                ]}
              >
                Danger
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Information Section */}
          {activeSection === "profile" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="person-outline"
                  size={22}
                  color="#007aff"
                />
                <Text style={styles.sectionTitle}>Profile Information</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Update your account&apos;s profile information and email address
              </Text>

              <BlurView intensity={10} tint="light" style={styles.formCard}>
                <ProfileImagePicker
                  initials="AN"
                  selectedImage={profileImage}
                  onImageSelected={(uri) => setProfileImage(uri)}
                />

                <Controller<ProfileFormData>
                  control={profileControl}
                  name="firstName"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>First Name</Text>
                      <TextInput
                        style={[
                          styles.input,
                          profileErrors.firstName && styles.inputError,
                        ]}
                        placeholder="Enter your first name"
                        value={value}
                        onChangeText={onChange}
                      />
                      {profileErrors.firstName && (
                        <Text style={styles.errorText}>
                          {profileErrors.firstName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller<ProfileFormData>
                  control={profileControl}
                  name="lastName"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Last Name</Text>
                      <TextInput
                        style={[
                          styles.input,
                          profileErrors.lastName && styles.inputError,
                        ]}
                        placeholder="Enter your last name"
                        value={value}
                        onChangeText={onChange}
                      />
                      {profileErrors.lastName && (
                        <Text style={styles.errorText}>
                          {profileErrors.lastName.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller<ProfileFormData>
                  control={profileControl}
                  name="username"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Username</Text>
                      <TextInput
                        style={[
                          styles.input,
                          profileErrors.username && styles.inputError,
                        ]}
                        placeholder="Enter your username"
                        value={value}
                        onChangeText={onChange}
                      />
                      {profileErrors.username && (
                        <Text style={styles.errorText}>
                          {profileErrors.username.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller<ProfileFormData>
                  control={profileControl}
                  name="email"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <TextInput
                        style={[
                          styles.input,
                          profileErrors.email && styles.inputError,
                        ]}
                        placeholder="Enter your email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                      />
                      {profileErrors.email && (
                        <Text style={styles.errorText}>
                          {profileErrors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleProfileSubmit(onProfileSubmit)}
                  className="mb-12"
                  disabled={isSubmittingProfile}
                >
                  {isSubmittingProfile ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="save" size={16} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
          )}

          {/* Password Section */}
          {activeSection === "password" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="lock" size={22} color="#007aff" />
                <Text style={styles.sectionTitle}>Update Password</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Ensure your account is using a long, random password to stay
                secure
              </Text>

              <BlurView intensity={10} tint="light" style={styles.formCard}>
                <Controller<PasswordFormData>
                  control={passwordControl}
                  name="currentPassword"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Current Password</Text>
                      <View
                        style={[
                          styles.passwordInputWrapper,
                          passwordErrors.currentPassword && styles.inputError,
                        ]}
                      >
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Enter your current password"
                          secureTextEntry={!showCurrentPassword}
                          value={value}
                          onChangeText={onChange}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          style={styles.eyeIcon}
                        >
                          <Feather
                            name={showCurrentPassword ? "eye-off" : "eye"}
                            size={18}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {passwordErrors.currentPassword && (
                        <Text style={styles.errorText}>
                          {passwordErrors.currentPassword.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller<PasswordFormData>
                  control={passwordControl}
                  name="newPassword"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>New Password</Text>
                      <View
                        style={[
                          styles.passwordInputWrapper,
                          passwordErrors.newPassword && styles.inputError,
                        ]}
                      >
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Enter your new password"
                          secureTextEntry={!showNewPassword}
                          value={value}
                          onChangeText={onChange}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          style={styles.eyeIcon}
                        >
                          <Feather
                            name={showNewPassword ? "eye-off" : "eye"}
                            size={18}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {passwordErrors.newPassword && (
                        <Text style={styles.errorText}>
                          {passwordErrors.newPassword.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller<PasswordFormData>
                  control={passwordControl}
                  name="confirmPassword"
                  render={({
                    field: { onChange, value },
                  }: {
                    field: { onChange: (text: string) => void; value: string };
                  }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>
                        Confirm New Password
                      </Text>
                      <View
                        style={[
                          styles.passwordInputWrapper,
                          passwordErrors.confirmPassword && styles.inputError,
                        ]}
                      >
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Confirm your new password"
                          secureTextEntry={!showConfirmPassword}
                          value={value}
                          onChangeText={onChange}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={styles.eyeIcon}
                        >
                          <Feather
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={18}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {passwordErrors.confirmPassword && (
                        <Text style={styles.errorText}>
                          {passwordErrors.confirmPassword.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <View style={styles.passwordTips}>
                  <Text style={styles.passwordTipsTitle}>Password Tips:</Text>
                  <View style={styles.passwordTipItem}>
                    <Feather name="check" size={14} color="#4CAF50" />
                    <Text style={styles.passwordTipText}>
                      Use at least 8 characters
                    </Text>
                  </View>
                  <View style={styles.passwordTipItem}>
                    <Feather name="check" size={14} color="#4CAF50" />
                    <Text style={styles.passwordTipText}>
                      Include uppercase and lowercase letters
                    </Text>
                  </View>
                  <View style={styles.passwordTipItem}>
                    <Feather name="check" size={14} color="#4CAF50" />
                    <Text style={styles.passwordTipText}>
                      Include numbers and special characters
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handlePasswordSubmit(onPasswordSubmit)}
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="save" size={16} color="#fff" />
                      <Text style={styles.saveButtonText}>Update Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
          )}

          {/* Danger Zone Section */}
          {activeSection === "danger" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="alert-triangle" size={22} color="#fd1b1b" />
                <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Actions in this section can lead to permanent data loss
              </Text>

              <View style={styles.dangerCard}>
                <View style={styles.dangerItem}>
                  <Text style={styles.dangerTitle}>Delete Account</Text>
                  <Text style={styles.dangerDescription}>
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteAccount}
                  >
                    <Feather name="trash-2" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007aff",
    paddingVertical: 12,
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    position: "absolute",
    left: 16,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#e6f2ff",
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#007aff",
    fontWeight: "600",
  },
  dangerActiveTabText: {
    color: "#fd1b1b",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#fd1b1b",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    paddingLeft: 30,
  },
  formCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    overflow: "hidden",
  },

  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#fd1b1b",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#fd1b1b",
    marginTop: 4,
    marginLeft: 2,
  },
  passwordTips: {
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordTipsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordTipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  passwordTipText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: "#007aff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 8,
    marginTop: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  dangerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dangerItem: {
    flexDirection: "column",
    paddingVertical: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: "#fd1b1b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 4,
  },
});
