import useStyles from "@/styles/useGlobalStyles";
import { FC, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";

interface SwitchProps {
  isOn: boolean;
  setIsOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Switch: FC<SwitchProps> = ({ isOn, setIsOn }) => {
  const { colors } = useStyles();
  const anim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  const toggleSwitch = () => {
    setIsOn((prev) => !prev);

    Animated.spring(anim, {
      toValue: isOn ? 0 : 1,
      useNativeDriver: false,
      friction: 6,
    }).start();
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, -15],
  });

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
