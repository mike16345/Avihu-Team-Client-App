import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import Collapsible from "../Collapsible";
import DropDownList from "./DropDownList";

const DropDownContent = () => {
  const { common } = useStyles();

  const { setSelectedValue, shouldCollapse, setShouldCollapse } = useDropwDownContext();

  const opacity = useRef(new Animated.Value(0)).current;

  const handleSelect = (val: any) => {
    setSelectedValue(val);
    setShouldCollapse(true);
  };

  useEffect(() => {
    if (!shouldCollapse) {
      Animated.timing(opacity, {
        toValue: 1,
        useNativeDriver: false,
        duration: 500,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        useNativeDriver: false,
        duration: 500,
      }).start();
    }
  }, [shouldCollapse]);

  return (
    <Animated.View style={{ opacity }}>
      <Collapsible isCollapsed={shouldCollapse} style={common.roundedMd}>
        <DropDownList handleSelect={handleSelect} />
      </Collapsible>
    </Animated.View>
  );
};

export default DropDownContent;
