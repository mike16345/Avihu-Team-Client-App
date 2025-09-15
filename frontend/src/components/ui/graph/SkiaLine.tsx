import { Line,  vec } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { ChartBounds } from "victory-native";

type Orientation = "horizontal" | "vertical";

interface SkiaLineProps  {
  chartBounds: ChartBounds;
  orientation?: Orientation;
}

const SkiaLine = ({ chartBounds, orientation = "horizontal", ...props }: SkiaLineProps) => {
  const { left, bottom, right } = chartBounds;
  const startLine = useDerivedValue(() => vec(left + 8, bottom + 2));
  const endLine = useDerivedValue(() => vec(right, bottom + 2));

  return (
    <Line
      {...props}
      opacity={0.1}
      strokeWidth={0.54}
      p1={startLine}
      p2={endLine}
      color={"#454459"}
    />
  );
};

export default SkiaLine;
