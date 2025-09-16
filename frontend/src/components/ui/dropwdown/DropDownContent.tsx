import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import Collapsible from "../Collapsible";
import DropDownList from "./DropDownList";

const ANIMATION_DURATION = 200;

const DropDownContent = () => {
  const { common } = useStyles();

  const { shouldCollapse, items } = useDropwDownContext();

  const opacity = useRef(new Animated.Value(0)).current;
  const fadeRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    fadeRef.current?.stop();
    const toValue = shouldCollapse ? 0 : 1;

    fadeRef.current = Animated.timing(opacity, {
      toValue,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    });

    fadeRef.current.start(() => {
      fadeRef.current = null;
    });

    return () => {
      fadeRef.current?.stop();
      fadeRef.current = null;
    };
  }, [shouldCollapse]);

  return (
    <Animated.View style={{ opacity }}>
      <Collapsible
        key={items.length}
        isCollapsed={shouldCollapse}
        style={[common.roundedMd, shouldCollapse && { paddingVertical: 0 }]}
      >
        <DropDownList />
      </Collapsible>
    </Animated.View>
  );
};

export default DropDownContent;
