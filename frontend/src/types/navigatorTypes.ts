import { IExercise, IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import {
  BottomTabNavigationEventMap,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  BottomTabs: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  SuccessScreen: { title: string; message: string };
  LoginScreen: undefined;
};

export type BottomStackParamList = {
  Home: undefined;
  MyWorkoutPlanPage: undefined;
  ChatTab: undefined;
  MyDietPlanPage: undefined;
  MyProgressScreen: undefined;
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
  name: keyof BottomStackParamList;
  component: () => React.ReactNode;
  options: BottomTabNavigationOptions;
  listeners?: (props: {
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
    route: any;
  }) => object;
}

export interface StackNavigatorProps<T extends ParamListBase, S extends keyof T> {
  route?: RouteProp<T, S>;
  navigation?: NativeStackNavigationProp<T, S>;
}

export type RootStackParamListNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackParamListNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
