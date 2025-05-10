import { AppleMaps } from "expo-maps";
import { StatusBar } from "expo-status-bar";
import { Platform, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#007aff" }}
        edges={["top"]}
      >
        {/* <View style={styles.container}>
          <Text>Start Shifts page</Text>
        </View> */}
        {Platform.OS === "ios" ? (
          <AppleMaps.View style={{ flex: 1 }} />
        ) : (
          <Text>No Maps available for your platform</Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f3f4f6",
//   },
// });
