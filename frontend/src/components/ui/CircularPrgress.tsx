import { View, Text } from "react-native";
import React from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import useStyles from "@/styles/useGlobalStyles";
import { useTimerStore } from "@/store/timerStore";
import { formatTime } from "@/utils/timer";
import { ConditionalRender } from "./ConditionalRender";

interface ICircularProgressProps {
  size?: number;
  width?: number;
  color?: string;
  secondaryColor?: string;
  textColor?: string;
  onFinish?: () => void;
  type?: "full" | "arc";
  value: number;
  maxValue: number;
  isTimer?: boolean;
  labelSize?: number;
  prefil?: "from-start" | "from-end" | "current-value";
  showValue?: boolean;
}

const CircularPrgress: React.FC<ICircularProgressProps> = ({
  type = "full",
  color = "white",
  secondaryColor = "black",
  onFinish = () => {},
  size = 120,
  width = 15,
  value,
  maxValue,
  textColor = "white",
  isTimer = false,
  labelSize,
  prefil = "from-start",
  showValue = true,
}) => {
  const { text } = useStyles();

  return (
    <AnimatedCircularProgress
      size={size}
      width={width}
      fill={(value / maxValue) * 100}
      arcSweepAngle={type == `arc` ? 260 : 360}
      rotation={type == `arc` ? 232 : 360}
      tintColor={color}
      onAnimationComplete={() => onFinish()}
      backgroundColor={secondaryColor}
      lineCap="round"
      prefill={prefil == "from-start" ? 100 : prefil == "from-end" ? 0 : (value / maxValue) * 100}
    >
      {() => (
        <ConditionalRender
          condition={showValue}
          children={
            <Text style={[{ color: textColor }, text.textBold, { fontSize: labelSize }]}>
              {isTimer ? formatTime(value) : value}
            </Text>
          }
        />
      )}
    </AnimatedCircularProgress>
  );
};

export default CircularPrgress;
