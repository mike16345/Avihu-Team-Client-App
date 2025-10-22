import useStyles from "@/styles/useGlobalStyles";
import { FC, useRef } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Animated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";

interface SwitchProps {
  isOn: boolean;
  setIsOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Switch: FC<SwitchProps> = ({ isOn, setIsOn }) => {
  const { colors } = useStyles();
  const translateX = useSharedValue(isOn ? -15 : 1);

  const toggleSwitch = () => {
    setIsOn((prev) => !prev);

    translateX.value = withTiming(isOn ? 1 : -15, { duration: 150 });
  };

  return (
    <TouchableOpacity style={[colors.backgroundPrimary, styles.switch]} onPress={toggleSwitch}>
      <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switch: {
    width: 36,
    height: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: "white",
    position: "absolute",
    start: 3,
  },
});

export default Switch;
