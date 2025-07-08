import * as Location from "expo-location";
import { Alert, Platform } from "react-native";

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

/**
 * Request and check location permissions
 * @returns Promise resolving to boolean indicating if permission is granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      // Show alert explaining why location is needed
      Alert.alert(
        "Location Permission Required",
        "You need to allow location access to use the shift tracking features. Location data is used to record where shifts start and end.",
        [
          {
            text: "Settings",
            onPress: () =>
              Platform.OS === "ios"
                ? Location.requestForegroundPermissionsAsync()
                : Location.getForegroundPermissionsAsync(),
          },
          { text: "Cancel" },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking location permission:", error);
    return false;
  }
};

/**
 * Get the current location of the device
 * @returns Promise resolving to location data or null if permission denied
 */
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return null;
    }

    // Get current position with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      accuracy: location.coords.accuracy ?? undefined,
      altitude: location.coords.altitude ?? undefined,
      speed: location.coords.speed ?? undefined,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
};
