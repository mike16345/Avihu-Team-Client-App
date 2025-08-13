import { IExercise, IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Chat: undefined;
  Settings: undefined;
  MyWorkoutPlanPage: undefined;
  MyDietPlanPage: undefined;
  VideoGallery: undefined;
  MyProgressScreen: undefined;
  LoginScreen: undefined;
  BlogScreen: undefined;
  EmailScreen: undefined;
};

export type WorkoutPlanStackParamList = {
  WorkoutPlanPage: undefined;
  RecordSet: {
    handleRecordSet: (recordSet: Omit<IRecordedSet, "plan">, sessionId?: string) => Promise<void>;
    recordedSet?: IRecordedSetResponse;
    exercise: IExercise;
    muscleGroup: string;
    setNumber: number;
  };
  RecordedSets: {
    recordedSets: IRecordedSetResponse[];
  };
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

export interface StackNavigatorProps<T extends ParamListBase, S extends keyof T> {
  route?: RouteProp<T, S>;
  navigation?: NativeStackNavigationProp<T, S>;
}
