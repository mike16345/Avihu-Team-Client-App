import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { BottomStackParamList } from "@/types/navigatorTypes";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import TopBar from "./TopBar";

import TimerDrawer from "@/components/ui/TimerDrawer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import { useTimerStore } from "@/store/timerStore";
import { Text } from "@/components/ui/Text";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon/Icon";
import { indicators } from "@/utils/navbar";
import { useFadeIn } from "@/styles/useFadeIn";

const Tab = createMaterialBottomTabNavigator<BottomStackParamList>();
const HORIZONTAL_MARGIN = 10;
const TABS_COUNT = 5;
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

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  const translateX = indicatorAnim.interpolate({
    inputRange: [0, TABS_COUNT - 1],
    outputRange: [0, (-indicatorWidth - 5) * (TABS_COUNT - 1)],
  });

  return (
    <Animated.View style={[layout.flex1, colors.background, layout.justifyEvenly, { opacity }]}>
      <TopBar />
      <Tab.Navigator
        barStyle={[styles.navigationBar, spacing.mgHorizontalDefault, colors.backgroundSurface]}
        initialRouteName={INITIAL_ROUTE_NAME}
        activeIndicatorStyle={{
          backgroundColor: "",
        }}
        inactiveColor={colors.textPrimary.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              listeners={{
                state: (e) => {
                  setActiveIndex(e.data.state.index);
                },
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
          colors.backgroundPrimary,
          layout.flexRow,
          layout.itemsCenter,
          spacing.pdSm,
          spacing.gapSm,
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
    start: 20,
    height: 40,
  },
  navigationBar: {
    height: 80,
    alignItems: "center",
    marginTop: 10,
    marginBottom: BOTTOM_BAR_HEIGHT,
    borderRadius: 60,
    overflow: "hidden",
    zIndex: 9999,
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
