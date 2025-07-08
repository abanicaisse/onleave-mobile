import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// interface ILoginSchema {
//   email: string;
//   password: string;
// }

export default function Login() {
  const router = useRouter();
  return (
    <View className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white">
      <View className="my-auto flex w-full justify-center p-6 md:px-8 lg:p-5">
        <View
          className="flex max-w-[30em] flex-col gap-8 rounded-2xl border border-gray-200 p-8 shadow bg-white"
          style={styles.roundedView}
        >
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-[140px] h-[25px]"
            alt="logo"
          />

          <View>
            <Text className="text-[14px] -mt-1 mb-8 text-heading-text-color font-semibold">
              Welcome back! Log in to continue.
            </Text>

            <Pressable className="w-full mb-5 flex flex-row gap-4 justify-center items-center border border-input bg-background p-2 rounded-lg">
              <Image
                source={require("@/assets/images/google.png")}
                className="w-[20px] h-[20px]"
                alt="google"
              />
              <Text className="text-[14px] font-normal">
                Continue with Google
              </Text>
            </Pressable>

            <View className="relative mb-5 flex flex-row items-center justify-between gap-4 text-gray-600">
              <Hr />
              <Text className="text-[14px] font-normal">or</Text>
              <Hr />
            </View>

            {/* Form */}
            <View className="mt-2 flex flex-col gap-5">
              <View className="flex flex-col gap-2">
                <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                  Email
                </Text>

                <View className="w-full flex flex-row items-center gap-3 border border-input rounded-lg px-3 py-3">
                  <TextInput
                    className="w-full flex items-center text-input-text-color outline-none font-normal"
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                </View>
              </View>

              <View className="flex flex-col gap-2">
                <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                  Password
                </Text>

                <View className="w-full flex flex-row items-center gap-3 border border-input rounded-lg px-3 py-3">
                  <TextInput
                    className="w-full flex items-center text-input-text-color outline-none font-normal"
                    placeholder="Enter password"
                    keyboardType="default"
                    secureTextEntry={true}
                    textContentType="password"
                  />
                </View>
              </View>

              <Text className="text-[12px] text-right font-normal text-primary-blue hover:underline">
                Forgot password?
              </Text>

              <Pressable
                className="w-full mt-3 mb-5 flex flex-row gap-4 justify-center items-center border border-input bg-primary-blue p-3 rounded-lg"
                onPress={() => {
                  router.replace("/");
                }}
              >
                <Text className="text-[14px] text-white font-normal">
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roundedView: {
    borderRadius: 8,
  },
});

const Hr = () => {
  return <View className="border-b-[1px] border-b-gray-600 w-[40%] bg-black" />;
};
