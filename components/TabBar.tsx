import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./TabBarButton";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();

  // Define the main routes that should appear in the tab bar
  const mainRoutes = ["index", "shifts/index", "settings/index"];

  return (
    <View className="w-full flex flex-row justify-center items-center">
      <View style={styles.tabBar}>
        {state.routes
          .filter((route) => mainRoutes.includes(route.name))
          .map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabBarButton
                key={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                // icon={icon[route.name]?.(isFocused) || null}
                label={String(label)}
                routeName={route.name}
                colors={colors}
              />
              // <PlatformPressable
              //   key={route.name}
              //   href={buildHref(route.name, route.params)}
              //   accessibilityState={isFocused ? { selected: true } : {}}
              //   accessibilityLabel={options.tabBarAccessibilityLabel}
              //   testID={options.tabBarButtonTestID}
              //   onPress={onPress}
              //   onLongPress={onLongPress}
              //   style={styles.tabBarItem}
              // >
              //   {icon[route.name](isFocused)}

              //   <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              //     {label}
              //   </Text>
              // </PlatformPressable>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    width: "70%",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
