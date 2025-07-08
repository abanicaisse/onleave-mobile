import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileImagePickerProps {
  initials: string;
  onImageSelected: (uri: string) => void;
  selectedImage: string | null;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  initials,
  onImageSelected,
  selectedImage,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a profile picture."
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Image selected from camera:", imageUri);
        onImageSelected(imageUri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Image selected from library:", imageUri);
        onImageSelected(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhoto,
        },
        {
          text: "Choose from Library",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatar} onPress={showImageOptions}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
        <View style={styles.editBadge}>
          <Feather name="edit-2" size={10} color="#fff" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.changeAvatarButton}
        onPress={showImageOptions}
      >
        <Text style={styles.changeAvatarText}>Change Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    marginHorizontal: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  changeAvatarButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#e6f2ff",
  },
  changeAvatarText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#007aff",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#007aff",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default ProfileImagePicker;
