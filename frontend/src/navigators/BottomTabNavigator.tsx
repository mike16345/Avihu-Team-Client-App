import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import { View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import TopBar from "./TopBar";
import * as Haptic from "expo-haptics";
import Draggable from "@/components/ui/Draggable";
import RestTimer from "@/components/WorkoutPlan/RestTimer";
import { useTimerStore } from "@/store/timerStore";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import TimerDraggable from "@/components/ui/TimerDraggable";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { layout, colors } = useStyles();
  const { countdown } = useTimerStore();

  return (
    <View style={[layout.flex1, colors.background, layout.justifyEvenly]}>
      <TopBar />
      <Tab.Navigator
        sceneAnimationType="shifting"
        barStyle={[
          {
            height: BOTTOM_BAR_HEIGHT,
            ...colors.background,
            borderTopWidth: 0.25,
            borderTopColor: colors.borderSecondaryContainer.borderColor,
          },
        ]}
        initialRouteName="MyProgressScreen"
        activeIndicatorStyle={{
          ...layout.center,
          width: 45,
          height: 40,
          backgroundColor: "",
          borderRadius: 999,
        }}
        inactiveColor={colors.textOnBackground.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              listeners={{ tabPress: () => Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Soft) }}
              component={tab.component}
              options={{ ...tab.options }}
            />
          );
        })}
      </Tab.Navigator>
      <TimerDraggable />
    </View>
  );
};

export default BottomTabNavigator;
