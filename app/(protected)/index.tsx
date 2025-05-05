import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="mb-8">Home page</Text>
      <Button onPress={() => router.navigate("/login")}>Go to Login</Button>
    </View>
  );
}
