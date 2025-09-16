import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import React, { ReactNode, useMemo } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "../../Icon/Icon";
import { type GraphData } from "@/hooks/graph/useGraphWeighIns";
import { getRadiusSizeBasedOnData, padXLabel } from "@/utils/utils";
import { LinearGradient, vec, Paint, useFont } from "@shopify/react-native-skia";
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Line,
  CartesianChart,
  Area,
  Scatter,
  getTransformComponents,
  setScale,
  setTranslate,
  useChartPressState,
  useChartTransformState,
  CurveType,
} from "victory-native";
import AssistantRegular from "@assets/fonts/Assistant/Assistant-Regular.ttf";
import SkiaLine from "./SkiaLine";
import { GRAPH_HEIGHT } from "@/constants/Constants";
import { ToolTip } from "./ToolTip";

interface GraphProps {
  header?: ReactNode;
  style?: StyleProp<ViewStyle>;
  mounted?: boolean;
  data: GraphData[];
  enableZoom?: boolean;
  enablePan?: boolean;
}
type AnimationType = "spring" | "decay" | "timing";
const curveType: CurveType = "natural";
const animationType: AnimationType = "spring";
const animationDuration = 300;
const LARGE_AMOUNT_OF_DOTS = 20;

const Graph: React.FC<GraphProps> = ({
  header,
  style,
  data,
  enableZoom = false,
  enablePan = false,
}) => {
  const labelColor = "rgba(69, 68, 89, 0.5)";
  const showDots = data.length < LARGE_AMOUNT_OF_DOTS;

  const font = useFont(AssistantRegular, 14);
  const { layout, spacing } = useStyles();

  const { state: transformState } = useChartTransformState();
  const { state, isActive } = useChartPressState({ x: 5, y: { value: 0 } });

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

  const value = useDerivedValue(() => state.y.value.value.value, [state]);
  const radius = useMemo(() => getRadiusSizeBasedOnData(data?.length), [data?.length]);

  return (
    <View style={[layout.flex1, spacing.gap20, { maxHeight: GRAPH_HEIGHT }, style]}>
      <ConditionalRender condition={!!header}>
        <View style={styles.header}>{header}</View>
      </ConditionalRender>

      <CartesianChart
        data={data}
        xKey="label"
        domainPadding={{ top: 40, bottom: 30, left: 8, right: 8 }}
        chartPressState={state}
        transformConfig={{ pan: { enabled: enablePan }, pinch: { enabled: enableZoom } }}
        yKeys={["value"]}
        yAxis={[
          {
            font: font,
            enableRescaling: true,
            labelColor: labelColor,
            lineWidth: 0,
          },
        ]}
        xAxis={{
          enableRescaling: true,
          font: font,
          labelColor: labelColor,
          lineWidth: 0,
          formatXLabel(label) {
            return padXLabel(label);
          },
        }}
        transformState={transformState}
        renderOutside={({ chartBounds }) => <SkiaLine chartBounds={chartBounds} />}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              curveType={curveType}
              animate={{ type: animationType, duration: animationDuration }}
              points={points.value}
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
              points={points.value}
              curveType={curveType}
              strokeWidth={2.5}
              connectMissingData
              animate={{ type: animationType, duration: animationDuration }}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(chartBounds.right, 0)}
                colors={["#9FFFA2", "#79F681"]}
              />
            </Line>
            {showDots && (
              <Scatter
                animate={{ type: animationType, duration: animationDuration }}
                points={points.value}
                radius={radius}
                color={"#95FDA8"}
              >
                <Paint color="#FFF" style="stroke" strokeWidth={2.5} />
              </Scatter>
            )}
            {isActive ? (
              <ToolTip
                x={state.x.position}
                font={font}
                y={state.y.value.position}
                value={value}
                radius={radius + 1}
                chartBounds={chartBounds}
              />
            ) : null}
          </>
        )}
      </CartesianChart>
      <View style={[layout.flexRow, styles.indicators, spacing.gapDefault]}>
        <Icon name={"arrowRoundRightSmall"} rotation={0} height={20} width={20} />
        <Icon name={"arrowRoundLeftSoftSmall"} rotation={0} height={20} width={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingTop: 15,
    paddingBottom: 0,
  },
  indicators: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    marginTop: -15,
  },
});

export default Graph;
