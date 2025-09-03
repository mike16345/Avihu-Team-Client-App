import {
  CartesianChart,
  Line,
  Area,
  useChartTransformState,
  Scatter,
  useChartPressState,
  setScale,
  setTranslate,
} from "victory-native";
import { Circle, LinearGradient, Paint, useFont, vec } from "@shopify/react-native-skia";
import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useSharedValue, SharedValue } from "react-native-reanimated";
import { useEffect } from "react";

const DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));
const AssistantRegular = require("../../assets/fonts/Assistant/Assistant-Regular.ttf");

export default function Sandbox() {
  const chartWidth = useSharedValue(0);
  const chartHeight = useSharedValue(0);

  const font = useFont(AssistantRegular, 14);
  const transformState = useChartTransformState({
    scaleX: 1, // Initial X-axis scale
    scaleY: 1, // Initial Y-axis scale
  });

  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
      <Card
        onLayout={(e) => {
          chartWidth.value = e.nativeEvent.layout.width;
          chartHeight.value = e.nativeEvent.layout.height;
        }}
        variant="gray"
        style={{ width: 300, height: 300 }}
      >
        <CartesianChart
          chartPressState={state}
          transformConfig={{
            pan: { dimensions: "x" },
            pinch: {
              enabled: false,
            },
          }}
          padding={{ top: 24, bottom: 12, left: 0, right: 0 }}
          transformState={transformState.state}
          yAxis={[{ font: font, lineColor: "transparent" }]}
          xAxis={{
            lineWidth: 0,
            font: font,
            lineColor: "transparent",
            labelColor: "rgba(0, 0, 0, 0.6)",
          }}
          data={DATA}
          xKey="day"
          yKeys={["highTmp"]}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                curveType="natural"
                points={points.highTmp}
                connectMissingData
                y0={chartBounds.bottom}
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={["rgba(159, 255, 162, 0.2)", "rgba(121, 246, 129, 0.05)"]}
                />
              </Area>

              <Line
                points={points.highTmp}
                curveType="natural"
                strokeWidth={2.5}
                connectMissingData
                animate={{ type: "timing", duration: 500 }}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(chartBounds.right, 0)}
                  colors={["#9FFFA2", "#79F681"]}
                />
              </Line>
              <Scatter points={points.highTmp} radius={6} color={"#95FDA8"}>
                <Paint color="#FFF" style="stroke" strokeWidth={2.5} />
              </Scatter>
              {isActive ? <ToolTip x={state.x.position} y={state.y.highTmp.position} /> : null}
            </>
          )}
        </CartesianChart>
      </Card>
    </View>
  );
}

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return (
    <Circle cx={x} cy={y} r={8} color="#79F681">
      <Paint color="#FFF" style="stroke" strokeWidth={4} />
    </Circle>
  );
}
