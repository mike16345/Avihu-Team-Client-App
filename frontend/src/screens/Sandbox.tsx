import {
  CartesianChart,
  Line,
  Area,
  useChartTransformState,
  Scatter,
  setScale,
  setTranslate,
  useChartPressState,
  getTransformComponents,
} from "victory-native";
import {
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Circle, LinearGradient, Paint, useFont, vec } from "@shopify/react-native-skia";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";

const AssistantRegular = require("../../assets/fonts/Assistant/Assistant-Regular.ttf");

const DATA = Array.from({ length: 31 }, (_, i) => {
  const base = 85;
  const trend = base - i * 0.3;
  const fluctuation = (Math.random() - 0.5) * 1.5;

  const weight = trend + fluctuation;

  return {
    day: i + 1, // day 1 → 31
    lowTmp: weight,
    highTmp: weight + Math.random() * 0.5,
  };
});

export default function Sandbox() {
  const font = useFont(AssistantRegular, 14);
  const { layout, spacing } = useStyles();

  const { state: transformState } = useChartTransformState();
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const k = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return transformState.panActive.value || transformState.zoomActive.value;
    },
    (cv, pv) => {
      if (!cv && pv) {
        const vals = getTransformComponents(transformState.matrix.value);
        k.value = vals.scaleX;
        tx.value = vals.translateX;
        ty.value = vals.translateY;

        k.value = withTiming(1);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
      }
    }
  );

  useAnimatedReaction(
    () => {
      return { k: k.value, tx: tx.value, ty: ty.value };
    },
    ({ k, tx, ty }) => {
      const m = setTranslate(transformState.matrix.value, tx, ty);
      transformState.matrix.value = setScale(m, k);
    }
  );

  return (
    <SafeAreaView style={styles.safeView}>
      <Card variant="gray" style={{ flex: 1, maxHeight: 300, padding: 24 }}>
        <Card.Header style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Icon name="clock" />
          <Text fontSize={16}>מעקב שקילה</Text>
        </Card.Header>
        <CartesianChart
          data={DATA}
          xKey="day"
          chartPressState={state}
          yKeys={["highTmp"]}
          yAxis={[
            {
              font: font,
              enableRescaling: true,
              lineWidth: 0,
            },
          ]}
          xAxis={{
            enableRescaling: true,
            font: font,
            lineWidth: 0,
          }}
          transformState={transformState}
          onChartBoundsChange={({ top, left, right, bottom }) => {
            setWidth(right - left);
            setHeight(bottom - top);
          }}
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
    </SafeAreaView>
  );
}

function ToolTip({
  x,
  y,
  isLargeAmountOfData = false,
}: {
  x: SharedValue<number>;
  y: SharedValue<number>;
  isLargeAmountOfData: boolean;
}) {
  return (
    <Circle cx={x} cy={y} r={isLargeAmountOfData ? 6 : 8} color="#79F681">
      <Paint color="#FFF" style="stroke" strokeWidth={4} />
    </Circle>
  );
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
});
