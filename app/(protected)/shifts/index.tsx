import React from "react";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const INITIAL_REGION = {
  latitude: 0.3008559,
  longitude: 32.5931917,
  latitudeDelta: 2,
  longitudeDelta: 2,
};

export default function ShiftsPage() {
  const mapRef = React.useRef<MapView>(null);

  const onRegionChange = (region: Region) => {
    console.log("Region changed:", region);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#007aff" }}
        edges={["top"]}
      >
        <View style={styles.container}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
            onRegionChangeComplete={onRegionChange}
            ref={mapRef}
          >
            {
              <Marker
                coordinate={{
                  latitude: 0.3008559,
                  longitude: 32.5931917,
                }}
              >
                <Callout>
                  <View>
                    <Text>Cavendish University Uganda</Text>
                  </View>
                </Callout>
              </Marker>
            }
          </MapView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
