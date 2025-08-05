import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import { Animated, StyleSheet, useWindowDimensions, View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import TopBar from "./TopBar";

import TimerDrawer from "@/components/ui/TimerDrawer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import { useTimerStore } from "@/store/timerStore";
import Sandbox from "@/screens/Sandbox";
import { useNavigationState } from "@react-navigation/native";
import { Text } from "@/components/ui/Text";
import { useEffect, useRef } from "react";
import Icon from "@/components/Icon/Icon";
import { indicators } from "@/utils/navbar";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { layout, colors, common, fonts, spacing } = useStyles();
  const { countdown } = useTimerStore();
  const { width } = useWindowDimensions();
  const HORIZONTAL_MARGIN = 10;
  const TABS_COUNT = 5;

  const indicatorWidth = (width - HORIZONTAL_MARGIN * 4) / TABS_COUNT - 8;
  const activeIndex = useNavigationState((state) => {
    return state.routes[state.index].state?.index ?? 0;
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
    <View style={[layout.flex1, colors.background, layout.justifyEvenly]}>
      <TopBar />
      <Tab.Navigator
        barStyle={[
          {
            ...colors.backgroundSurface,
            marginHorizontal: HORIZONTAL_MARGIN,
            ...styles.navigationBar,
          },
        ]}
        initialRouteName="MyProgressScreen"
        activeIndicatorStyle={{
          backgroundColor: "",
        }}
        inactiveColor={colors.textPrimary.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={Sandbox}
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
        <Text style={[colors.textOnPrimary, fonts.sm]}>{indicators[activeIndex].name}</Text>
      </Animated.View>
      <View style={[styles.shadowContainer, { width: width - HORIZONTAL_MARGIN * 2 }]}></View>
      <ConditionalRender condition={!!countdown} children={<TimerDrawer />} />
    </View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: "absolute",
    bottom: 60,
    right: 20,
    height: 40,
  },
  navigationBar: {
    height: 80,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    borderRadius: 60,
    overflow: "hidden",
    zIndex: 9999,
  },
  shadowContainer: {
    position: "absolute",
    borderRadius: 60,
    bottom: 39,
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
