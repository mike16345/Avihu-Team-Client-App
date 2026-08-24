import { BottomStackParamList } from "@/types/navigatorTypes";
import { Keyboard, StyleSheet, useWindowDimensions, View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { DEFAULT_PAGE_TOP_PADDING } from "@/constants/Constants";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "@/components/ui/Text";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon/Icon";
import { indicators } from "@/utils/navbar";
import { IconLayoutContext } from "@/context/useiconLayout";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import useNotification from "@/hooks/useNotification";
import { selectionHaptic } from "@/utils/haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FLOATING_TAB_BAR_HEIGHT, getBottomTabLayout } from "./bottomTabLayout";

const Tab = createBottomTabNavigator<BottomStackParamList>();
const HORIZONTAL_MARGIN = 5;
const ACTIVE_INDICATOR_WIDTH = 80;
const REACT_NAVIGATION_BOTTOM_INSET = 0;
const INITIAL_ROUTE_NAME: keyof BottomStackParamList = "Home";

const BottomTabNavigator = () => {
  const { layout, colors, common, spacing } = useStyles();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { initializeNotifications } = useNotification();

  const [activeIndex, setActiveIndex] = useState(() => {
    return BottomScreenNavigatorTabs.findIndex((tab) => tab.name == INITIAL_ROUTE_NAME);
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const bottomTabLayout = getBottomTabLayout({
    bottomInset: insets.bottom,
    keyboardVisible,
  });

  const indicatorAnim = useSharedValue(0);

  const layoutsRef = useRef<Record<string, number>>({});

  const setIconLayout = (name: string, x: number) => {
    layoutsRef.current[name] = x;
  };

  const getIconLayout = (name: string) => layoutsRef.current[name];

  const indicatorStyle = useAnimatedStyle(() => ({
    end: indicatorAnim.value,
  }));

  const moveIndicatorToTab = (tabName: string) => {
    selectionHaptic();
    const x = getIconLayout(tabName); // x is absolute center of icon

    const isWorkoutSceen = tabName == "MyWorkoutPlanPage";
    const isArticleScreen = tabName == "ArticleScreen";

    const xValue = x - ACTIVE_INDICATOR_WIDTH / 2;
    const addedSpacing = isWorkoutSceen ? -10 : isArticleScreen ? +10 : 0;

    const value = xValue + addedSpacing;

    if (x != null && ACTIVE_INDICATOR_WIDTH > 0) {
      indicatorAnim.value = withSpring(value, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    initializeNotifications();

    return () => {
      setKeyboardVisible(false);
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Animated.View style={[layout.flex1, colors.background]}>
      <IconLayoutContext.Provider value={{ setIconLayout, getIconLayout }}>
        <Tab.Navigator
          backBehavior="initialRoute"
          initialRouteName={INITIAL_ROUTE_NAME}
          safeAreaInsets={{ bottom: REACT_NAVIGATION_BOTTOM_INSET }}
          sceneContainerStyle={[
            colors.backgroundTransparent,

            {
              paddingBottom: bottomTabLayout.scenePaddingBottom,
              paddingTop: DEFAULT_PAGE_TOP_PADDING,
            },
          ]}
          screenOptions={{
            headerShown: false,
            tabBarStyle: [
              styles.navigationBar,
              spacing.mgHorizontalSm,
              colors.backgroundSurface,
              {
                opacity: bottomTabLayout.tabBarVisible ? 1 : 0,
                position: "absolute",
                left: HORIZONTAL_MARGIN,
                right: HORIZONTAL_MARGIN,
                bottom: bottomTabLayout.tabBarBottom,
                paddingBottom: 0,
              },
            ],
            tabBarItemStyle: { height: FLOATING_TAB_BAR_HEIGHT },
            tabBarActiveTintColor: colors.textPrimary.color,
            tabBarInactiveTintColor: colors.textPrimary.color,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          {BottomScreenNavigatorTabs.map((tab, index) => {
            return (
              <Tab.Screen
                listeners={(props) => ({
                  focus: () => {
                    setActiveIndex(index);
                    moveIndicatorToTab(tab.name);
                  },
                  ...(typeof tab.listeners === "function" ? tab.listeners(props) : tab.listeners),
                })}
                key={tab.name}
                name={tab.name}
                component={tab.component}
                options={{ ...tab.options }}
              />
            );
          })}
        </Tab.Navigator>
      </IconLayoutContext.Provider>

      <Animated.View
        style={[
          styles.activeIndicator,
          colors.backgroundPrimary,
          layout.flexRow,
          layout.itemsCenter,
          spacing.pdSm,
          spacing.gapSm,
          common.roundedFull,
          indicatorStyle,
          {
            bottom: bottomTabLayout.activeIndicatorBottom,
            display: bottomTabLayout.tabBarVisible ? "flex" : "none",
          },
        ]}
      >
        <Icon name={indicators[activeIndex].icon} color="white" />
        <Text
          allowFontScaling={false}
          fontSize={11}
          fontVariant="semibold"
          style={[colors.textOnPrimary]}
        >
          {indicators[activeIndex].name}
        </Text>
      </Animated.View>
      {bottomTabLayout.tabBarVisible && (
        <View
          style={[
            styles.shadowContainer,
            {
              bottom: bottomTabLayout.shadowBottom,
              width: width - HORIZONTAL_MARGIN * 2 - 40,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: "absolute",
    width: ACTIVE_INDICATOR_WIDTH,
    height: 40,
    zIndex: 10000,
  },
  navigationBar: {
    height: FLOATING_TAB_BAR_HEIGHT,
    alignItems: "center",
    borderRadius: 100,
    shadowColor: "#072723",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  shadowContainer: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 100,
    height: FLOATING_TAB_BAR_HEIGHT,
    alignItems: "center",
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
