import { getUserDetails } from "@/actions/users.actions";
import { TabBar } from "@/components/TabBar";
import { useAccessControlManager } from "@/hooks/use-access-control-manager";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "expo-router";

export default function ProtectedLayout() {
  const { accessControlData } = useAccessControlManager();

  const { data: userDetails } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUserDetails(accessControlData.user?.uid!),
  });

  console.log("User Details:", userDetails);

  console.log("Access Control Data:", accessControlData);

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
