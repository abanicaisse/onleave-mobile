import { TabBar } from "@/components/TabBar";
import { Tabs } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="shifts/index"
        options={{
          title: "Shifts",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="shifts/[id]"
        options={{
          title: "Shift Details",
          headerShown: false,
          // Hide this route from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
