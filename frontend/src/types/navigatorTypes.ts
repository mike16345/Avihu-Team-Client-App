export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  MyWorkoutPlanPage: undefined;
  MyDietPlanPage: undefined;
  VideoGallery: undefined;
  MyProgressScreen: undefined;
  LoginScreen: undefined;
};
export type TabBarIcon = ({ color, focused }: TabBarIconProps) => React.ReactNode | React.ReactNode;
export type TabBarIconProps = { color: string; focused: boolean };
export type TabBarBadge = string | number | boolean | undefined;

export interface NavigatorTab {
  name: keyof RootStackParamList;
  component: () => React.ReactNode;
  options: {
    title?: string;
    tabBarButtonTestID?: string;
    tabBarLabel?: string;
    tabBarBadge?: TabBarBadge;
    tabBarAccessibilityLabel?: string;
    tabBarIcon: TabBarIcon;
  };
}
