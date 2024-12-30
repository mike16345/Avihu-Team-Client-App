import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useLayoutStore } from "@/store/layoutStore";

const useHideTabBarOnScroll = () => {
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    useLayoutStore.getState().setIsNavbarOpen(!isBottom);
  };

  return { handleScroll };
}; 

export default useHideTabBarOnScroll;
