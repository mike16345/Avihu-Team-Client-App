import { CommonActions, createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigatorTypes";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const navigateFromRoot = <T extends keyof RootStackParamList>(
  name: T,
  params: RootStackParamList[T]
) => {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate(name, params);
};

export const resetRootTo = (name: string, params?: Record<string, any>) => {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: name as never, params: params as never }],
    })
  );

  return true;
};
