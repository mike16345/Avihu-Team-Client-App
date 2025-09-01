import { BottomStackParamList } from "@/types/navigatorTypes";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TimerDrawer from "@/components/ui/TimerDrawer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import { useTimerStore } from "@/store/timerStore";
import { Text } from "@/components/ui/Text";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon/Icon";
import { indicators } from "@/utils/navbar";
import { useFadeIn } from "@/styles/useFadeIn";

const Tab = createBottomTabNavigator<BottomStackParamList>();
const HORIZONTAL_MARGIN = 5;
const TABS_COUNT = 5;
const TAB_BAR_HEIGHT = 80;
const INITIAL_ROUTE_NAME: keyof BottomStackParamList = "Home";

const BottomTabNavigator = () => {
  const { layout, colors, common, fonts, spacing } = useStyles();
  const { countdown } = useTimerStore();
  const { width } = useWindowDimensions();
  const opacity = useFadeIn();

  const indicatorWidth = (width - HORIZONTAL_MARGIN * 4) / TABS_COUNT - 8;
  const [activeIndex, setActiveIndex] = useState(() => {
    return BottomScreenNavigatorTabs.findIndex((tab) => tab.name == INITIAL_ROUTE_NAME);
  });

  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const isHomeScreen = BottomScreenNavigatorTabs[activeIndex].name == "Home";
  const lastIndex = BottomScreenNavigatorTabs.length - 1;
  const activeIndicatorStartOffset = activeIndex == 0 ? 20 : activeIndex == lastIndex ? 0 : 10;

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, TABS_COUNT - 1],
    outputRange: [0, (-indicatorWidth - 5) * (TABS_COUNT - 1)],
  });

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <Animated.View style={[layout.flex1, colors.background, { opacity }]}>
      <Tab.Navigator
        initialRouteName={INITIAL_ROUTE_NAME}
        sceneContainerStyle={[
          colors.background,
          { paddingBottom: BOTTOM_BAR_HEIGHT + 85, paddingTop: isHomeScreen ? 36 : 36 },
        ]}
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.navigationBar,
            spacing.mgHorizontalSm,
            colors.backgroundSurface,
            {
              position: "absolute",
              left: HORIZONTAL_MARGIN,
              right: HORIZONTAL_MARGIN,
              bottom: BOTTOM_BAR_HEIGHT,
            },
          ],
          tabBarItemStyle: { height: TAB_BAR_HEIGHT },
          tabBarActiveTintColor: colors.textPrimary.color,
          tabBarInactiveTintColor: colors.textPrimary.color,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        {BottomScreenNavigatorTabs.map((tab, index) => {
          return (
            <Tab.Screen
              listeners={{
                focus: () => setActiveIndex(index),
              }}
              key={tab.name}
              name={tab.name}
              component={tab.component}
              options={{ ...tab.options }}
            />
          );
        })}
      </Tab.Navigator>
      <Animated.View
        style={[
          styles.activeIndicator,
          { start: activeIndicatorStartOffset },
          colors.backgroundPrimary,
          layout.flexRow,
          layout.itemsCenter,
          spacing.pdSm,
          spacing.gapXs,
          common.roundedFull,
          { transform: [{ translateX }] },
        ]}
      >
        <Icon name={indicators[activeIndex].icon} color="white" />
        <Text fontVariant="semibold" style={[colors.textOnPrimary, fonts.sm]}>
          {indicators[activeIndex].name}
        </Text>
      </Animated.View>
      <View style={[styles.shadowContainer, { width: width - HORIZONTAL_MARGIN * 2 }]}></View>
      <ConditionalRender condition={!!countdown} children={<TimerDrawer />} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: "absolute",
    bottom: BOTTOM_BAR_HEIGHT + 20,
    height: 40,
    zIndex: 10000,
  },
  navigationBar: {
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    marginTop: 10,
    borderRadius: 60,
    overflow: "hidden",
  },
  shadowContainer: {
    position: "absolute",
    borderRadius: 60,
    bottom: BOTTOM_BAR_HEIGHT,
    height: 85,
    alignSelf: "center",
    zIndex: -1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#fff",
  },
});

export default BottomTabNavigator;
