import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigatorTypes";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateFromRoot = <T extends keyof RootStackParamList>(
  name: T,
  params: RootStackParamList[T]
) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};
