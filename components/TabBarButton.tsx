import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import React, { JSX } from "react";
import { Image, StyleSheet, Text } from "react-native";

interface TabBarButtonProps {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  label: string;
  // icon: JSX.Element | null;
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
}

export default function TabBarButton({
  colors,
  label,
  // icon,
  onPress,
  onLongPress,
  isFocused,
  routeName,
}: TabBarButtonProps) {
  const { buildHref } = useLinkBuilder();

  const icon: Record<string, (isFocused: boolean) => JSX.Element> = {
    index: (isFocused: boolean) => (
      <Image
        source={
          isFocused
            ? require("@/assets/images/home-blue.png")
            : require("@/assets/images/home.png")
        }
        className="w-[20px] h-[20px]"
        alt="logo"
      />
    ),
    "shifts/index": (isFocused: boolean) => (
      <Image
        source={
          isFocused
            ? require("@/assets/images/explore-blue.png")
            : require("@/assets/images/explore.png")
        }
        className="w-[20px] h-[20px]"
        alt="logo"
      />
    ),
    "settings/index": (isFocused: boolean) => (
      <Image
        source={
          isFocused
            ? require("@/assets/images/setting-blue.png")
            : require("@/assets/images/setting.png")
        }
        className="w-[20px] h-[20px]"
        alt="logo"
      />
    ),
  };
  // Since we're now filtering for only the main routes in TabBar.tsx,
  // we can simply use the routeName directly

  return (
    <PlatformPressable
      key={routeName}
      href={buildHref(routeName)}
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabBarItem}
    >
      {icon[routeName](isFocused)}

      <Text style={{ color: isFocused ? colors.primary : colors.text }}>
        {label}
      </Text>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
