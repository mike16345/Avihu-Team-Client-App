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
  ChartBounds,
} from "victory-native";
import {
  DerivedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Circle,
  LinearGradient,
  Paint,
  useFont,
  vec,
  Group,
  RoundedRect,
  Text as SkText,
  Shadow,
  SkFont,
} from "@shopify/react-native-skia";
import { SafeAreaView, StyleSheet } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { getRadiusSizeBasedOnData } from "@/utils/utils";
import { useVictoryNativeGraphWeighIns } from "@/hooks/graph/useVictoryNativeGraphWeighIns";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";

const AssistantRegular = require("../../assets/fonts/Assistant/Assistant-Regular.ttf");

export default function Sandbox() {
  const font = useFont(AssistantRegular, 14);
  const { layout, spacing } = useStyles();

  const { state: transformState } = useChartTransformState();
  const { state, isActive } = useChartPressState({ x: 0, y: { weight: 0 } });

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
  const { data: weighIns } = useWeighInsQuery();
  const { getWeighInsByTab } = useVictoryNativeGraphWeighIns(weighIns);
  const DATA = getWeighInsByTab("יומי");

  const value = useDerivedValue(() => state.y.weight.value.value, [state]);
  const radius = useMemo(() => getRadiusSizeBasedOnData(DATA.length), [DATA.length]);

  return (
    <SafeAreaView style={styles.safeView}>
      <Card variant="gray" style={{ flex: 1, maxHeight: 300 }}>
        <Card.Header style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Icon name="clock" />
          <Text fontSize={16}>מעקב שקילה</Text>
        </Card.Header>
        <CartesianChart
          data={DATA}
          xKey="date"
          domainPadding={8}
          chartPressState={state}
          transformConfig={{ pan: { enabled: false }, pinch: { enabled: false } }}
          yKeys={["weight"]}
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
                points={points.weight}
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
                points={points.weight}
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
              <Scatter points={points.weight} radius={radius} color={"#95FDA8"}>
                <Paint color="#FFF" style="stroke" strokeWidth={2.5} />
              </Scatter>
              {isActive ? (
                <ToolTip
                  x={state.x.position}
                  font={font}
                  y={state.y.weight.position}
                  value={value}
                  radius={radius + 1}
                  chartBounds={chartBounds}
                />
              ) : null}
            </>
          )}
        </CartesianChart>
      </Card>
    </SafeAreaView>
  );
}

type ToolTipProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  value?: DerivedValue<number>;
  radius?: number;
  font: SkFont | null;
  boxOffsetX?: number;
  boxOffsetY?: number;
  chartBounds: ChartBounds;
};

export function ToolTip({
  x,
  y,
  value,
  chartBounds,
  font,
  radius = 8,
  boxOffsetX = 14,
  boxOffsetY = 10,
}: ToolTipProps) {
  const tooltipTransform = useDerivedValue(
    () => [{ translateX: x.value }, { translateY: y.value }],
    [x, y]
  );

  const labelText = useDerivedValue(() => (value ? value.value.toFixed(1) : "--"), [value]);

  const labelWidth = 44;
  const labelHeight = 24;
  const corner = 6;

  // Compute localX
  const localX = useDerivedValue(() => {
    const dotX = x.value;
    const { left, right } = chartBounds;

    // prefer right of the dot
    let lx = boxOffsetX;

    // flip left if overflowing right
    if (dotX + lx + labelWidth > right) {
      lx = -boxOffsetX - labelWidth;
    }
    // clamp if still overflowing left
    if (dotX + lx < left) {
      lx = left - dotX;
    }
    return lx;
  }, [x, chartBounds, boxOffsetX]);

  // Compute localY
  const localY = useDerivedValue(() => {
    const dotY = y.value;
    const { top, bottom } = chartBounds;

    // prefer above the dot
    let ly = -boxOffsetY - labelHeight;

    // flip below if overflowing top
    if (dotY + ly < top) {
      ly = boxOffsetY;
    }
    // clamp if still overflowing bottom
    if (dotY + ly + labelHeight > bottom) {
      ly = bottom - dotY - labelHeight;
    }
    return ly;
  }, [y, chartBounds, boxOffsetY]);

  const textX = useDerivedValue(() => localX.value + 10, [localX]);
  const textY = useDerivedValue(() => localY.value + (labelHeight - 8), [localY]);

  return (
    <Group>
      <Circle cx={x} cy={y} r={radius} color="#79F681">
        <Paint color="#FFF" style="stroke" strokeWidth={4} />
      </Circle>

      <Group transform={tooltipTransform}>
        <RoundedRect
          x={localX}
          y={localY}
          width={labelWidth}
          height={labelHeight}
          r={corner}
          color="#FFF"
        >
          <Shadow dx={0} dy={2} blur={4} color="rgba(0,0,0,0.35)" />
          <Paint color="rgba(255,255,255,0.06)" style="stroke" strokeWidth={1} />
        </RoundedRect>

        <SkText x={textX} y={textY} text={labelText} font={font} color="#000" />
      </Group>
    </Group>
  );
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    padding: 16,
  },
});
