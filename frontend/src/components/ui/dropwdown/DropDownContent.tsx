import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import Collapsible from "../Collapsible";
import DropDownList from "./DropDownList";

const ANIMATION_DURATION = 250;

const DropDownContent = () => {
  const { common } = useStyles();

  const { shouldCollapse } = useDropwDownContext();

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shouldCollapse) {
      Animated.timing(opacity, {
        toValue: 1,
        useNativeDriver: false,
        duration: ANIMATION_DURATION,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        useNativeDriver: false,
        duration: ANIMATION_DURATION,
      }).start();
    }
  }, [shouldCollapse]);

  return (
    <Animated.View style={{ opacity }}>
      <Collapsible isCollapsed={shouldCollapse} style={common.roundedMd}>
        <DropDownList />
      </Collapsible>
    </Animated.View>
  );
};

export default DropDownContent;
