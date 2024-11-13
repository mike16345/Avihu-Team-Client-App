import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import { View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { layout, colors } = useStyles();

  return (
    <View style={[layout.flex1, colors.background]}>
      <Tab.Navigator
        barStyle={[
          {
            height: BOTTOM_BAR_HEIGHT,
            ...colors.background,
            borderTopWidth: 0.199,
            borderTopColor: colors.textOnSurfaceDisabled.color,
          },
        ]}
        initialRouteName="MyDietPlanPage"
        activeIndicatorStyle={{
          ...layout.center,
          width: 45,
          height: 40,
          backgroundColor: colors.textOnBackground.color,
          padding: 8,
          borderRadius: 99,
        }}
        inactiveColor={colors.textOnBackground.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={tab.component}
              options={{ ...tab.options }}
            />
          );
        })}
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
