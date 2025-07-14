import { Text } from "react-native";
import React from "react";
import { AnimatedCircularProgress ,AnimatedCircularProgressProps} from "react-native-circular-progress";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "./ConditionalRender";

interface ICircularProgressProps extends AnimatedCircularProgressProps{
  textColor?: string;
  type?: "full" | "arc";
  value: number;
  maxValue: number;
  labelSize?: number;
  prefil?: "from-start" | "from-end" | "current-value";
  showValue?: boolean;
  valueFormatter?: (param: any) => string;
}

const CircularPrgress: React.FC<ICircularProgressProps> = ({
  type = "full",
  size = 120,
  width = 15,
  value,
  maxValue,
  textColor = "white",
  labelSize,
  prefil = "from-start",
  showValue = true,
  valueFormatter,
  ...rest
}) => {
  const { text } = useStyles();

  return (
    <AnimatedCircularProgress
      size={size}
      width={width}
      fill={(value / maxValue) * 100}
      arcSweepAngle={type == `arc` ? 260 : 360}
      rotation={type == `arc` ? 232 : 360}
      lineCap="round"
      prefill={prefil == "from-start" ? 100 : prefil == "from-end" ? 0 : (value / maxValue) * 100}
      {...rest}
    >
      {() => (
        <ConditionalRender
          condition={showValue}
          children={
            <Text style={[{ color: textColor }, text.textBold, { fontSize: labelSize }]}>
              {valueFormatter ? valueFormatter(value) : value}
            </Text>
          }
        />
      )}
    </AnimatedCircularProgress>
  );
};

export default CircularPrgress;
