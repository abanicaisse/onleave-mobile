import { useRouter } from "expo-router";

import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#007aff" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#007aff" }}
        edges={["top"]}
      >
        <ScrollView className="w-full bg-background h-full flex flex-col mr-2 px-1">
          <View className="w-full flex flex-col gap-4 mb-8">
            <View className="w-full flex flex-col gap-2 p-4">
              <Text className="text-[1.5rem] text-heading-text-color font-semibold">
                Profile Information
              </Text>
              <Text className="text-[14px] text-input-label-color font-normal">
                Update your account&apos;s profile information and email address
              </Text>
            </View>

            <View className="w-[95%] flex flex-col gap-2 mx-auto bg-white rounded-lg p-4">
              <View className="mt-2 flex flex-col gap-5">
                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    First Name
                  </Text>

                  <View className="w-full flex flex-row items-center gap-3 border border-input rounded-lg px-3 py-3">
                    <TextInput
                      className="w-full flex items-center text-input-text-color outline-none font-normal"
                      placeholder="Aba"
                      keyboardType="default"
                      textContentType="givenName"
                    />
                  </View>
                </View>

                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    Last Name
                  </Text>

                  <View className="w-full flex flex-row items-center gap-3 border border-input rounded-lg px-3 py-3">
                    <TextInput
                      className="w-full flex items-center text-input-text-color outline-none font-normal"
                      placeholder="Nicaisse"
                      keyboardType="default"
                      textContentType="familyName"
                    />
                  </View>
                </View>

                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    Username
                  </Text>

                  <View className="w-full flex flex-row items-center gap-3 border border-input rounded-lg px-3 py-3">
                    <TextInput
                      className="w-full flex items-center text-input-text-color outline-none font-normal"
                      placeholder="abanicaisse"
                      keyboardType="default"
                      textContentType="username"
                    />
                  </View>
                </View>

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

                <Pressable
                  className="w-[60px] flex flex-row items-center justify-center bg-primary-blue rounded-lg mt-3 mb-5 p-3 ml-auto"
                  onPress={() => {
                    router.replace("/");
                  }}
                >
                  <Text className="text-[14px] text-white font-normal">
                    save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Hr />

          <View className="w-full flex flex-col gap-4 mt-6 mb-8">
            <View className="w-full flex flex-col gap-2 px-4 py-0">
              <Text className="text-[1.5rem] text-heading-text-color font-semibold">
                Update Password
              </Text>
              <Text className="text-[14px] text-input-label-color font-normal">
                Ensure your account is using a long, random password to keep it
                secure.
              </Text>
            </View>

            <View className="w-[95%] flex flex-col gap-2 mx-auto bg-white rounded-lg p-4">
              <View className="mt-2 flex flex-col gap-5">
                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    Current Password
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

                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    New Password
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

                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color font-semibold ml-[.05rem]">
                    Confirm New Password
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

                <Pressable
                  className="w-[60px] flex flex-row items-center justify-center bg-primary-blue rounded-lg mt-3 mb-5 p-3 ml-auto"
                  onPress={() => {
                    router.replace("/");
                  }}
                >
                  <Text className="text-[14px] text-white font-normal">
                    save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Hr />

          <View className="w-full flex flex-col gap-4 mt-6 mb-24">
            <View className="w-full flex flex-col gap-2 px-4 py-0">
              <Text className="text-[1.5rem] text-heading-text-color font-semibold">
                Delete Account
              </Text>
              <Text className="text-[14px] text-input-label-color font-normal">
                Permanently delete your account. This action cannot be undone.
              </Text>
            </View>

            <View className="w-[95%] flex flex-col gap-2 mx-auto bg-white rounded-lg p-4">
              <View className="mt-2 flex flex-col gap-5">
                <View className="flex flex-col gap-2">
                  <Text className="text-[14px] text-left text-input-label-color leading-6">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                  </Text>
                </View>

                <Pressable
                  className="flex flex-row items-center justify-center bg-[#fd1b1b] rounded-lg mt-3 mb-5 p-3"
                  onPress={() => {
                    router.replace("/");
                  }}
                >
                  <Text className="text-[14px] text-white font-normal">
                    Delete Account
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>

    // <SafeAreaProvider>

    //   <SafeAreaView style={[styles.container]} edges={["top"]}>

    //   </SafeAreaView>
    // </SafeAreaProvider>
  );
}

const Hr = () => {
  return (
    <View className="w-[95%] border-b-[1px] border-b-input-text-color mx-auto" />
  );
};
