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
import { Easing, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

import { Circle, LinearGradient, Paint, useFont, vec } from "@shopify/react-native-skia";
import { Dimensions, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { SharedValue } from "react-native-reanimated";
import { DATA, yMax } from "./my-data";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useRef } from "react";

const AssistantRegular = require("../../assets/fonts/Assistant/Assistant-Regular.ttf");

const INITIAL_SCALE_X = 1.0;
const INITIAL_SCALE_Y = 1.0;

export default function Sandbox() {
  const font = useFont(AssistantRegular, 14);
  const { state: transformState } = useChartTransformState({
    scaleX: INITIAL_SCALE_X, // Initial X-axis scale
    scaleY: INITIAL_SCALE_Y, // Initial Y-axis scale
  });

  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  const handleMove = (dx: number, dy: number) => {
    const { translateX, translateY } = getTransformComponents(transformState.matrix.value);
    transformState.matrix.value = setTranslate(
      transformState.matrix.value,
      translateX + dx,
      translateY + dy
    );
  };

  const handleZoom = (factorX: number, factorY: number = factorX) => {
    const { scaleX, scaleY } = getTransformComponents(transformState.matrix.value);
    transformState.matrix.value = setScale(
      transformState.matrix.value,
      scaleX * factorX,
      scaleY * factorY
    );
  };

  const X_MIN = 0;
  const X_MAX = DATA.length - 1; // or your real x max
  const Y_MIN = 0;
  const Y_MAX = yMax; // your real y max
  const EPS_X = 1e-4;
  const EPS_Y = 1e-4;

  // keep last domains + a debounce timer
  const lastDomainRef = useRef<{ x: [number, number]; y: [number, number] }>({
    x: [0, 0],
    y: [0, 0],
  });
  const scaleChangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // check bounds AFTER gesture ended, then (optionally animated) reset
  const checkBoundsAndMaybeReset = () => {
    // make sure gesture actually ended (Victory's transform state flags)
    const panActive = transformState.panActive.value;
    const zoomActive = transformState.zoomActive.value;
    if (panActive || zoomActive) return;

    const { x, y } = lastDomainRef.current;
    const [xStart, xEnd] = x;
    const [yStart, yEnd] = y;

    const outX = xStart < X_MIN - EPS_X || xEnd > X_MAX + EPS_X;
    const outY = yStart < Y_MIN - EPS_Y || yEnd > Y_MAX + EPS_Y;

    if (outX || outY) {
      handleReset();
    }
  };

  const handleReset = () => {
    const { scaleX, scaleY, translateX, translateY } = getTransformComponents(
      transformState.matrix.value
    );

    // snapshot "from" values
    fromSx.value = scaleX;
    fromSy.value = scaleY;
    fromTx.value = translateX;
    fromTy.value = translateY;

    // kick off animation  (0 -> 1)
    resetProgress.value = 0;
    resetProgress.value = withTiming(
      1,
      {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
      () => {
        // mark idle when finished
        resetProgress.value = -1;
      }
    );
  };

  const resetProgress = useSharedValue(-1); // -1 = idle
  const fromSx = useSharedValue(1);
  const fromSy = useSharedValue(1);
  const fromTx = useSharedValue(0);
  const fromTy = useSharedValue(0);

  // drive the matrix each frame while animating
  useDerivedValue(() => {
    const p = resetProgress.value;
    if (p < 0) return; // not animating

    const sx = fromSx.value + (INITIAL_SCALE_X - fromSx.value) * p;
    const sy = fromSy.value + (INITIAL_SCALE_Y - fromSy.value) * p;
    const tx = fromTx.value + (0 - fromTx.value) * p;
    const ty = fromTy.value + (0 - fromTy.value) * p;

    // rebuild matrix on the UI thread
    let m = transformState.matrix.value;
    m = setTranslate(m, tx, ty);
    m = setScale(m, sx, sy);
    transformState.matrix.value = m;
  });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16, gap: 20 }}>
      <Card variant="gray" style={{ width: Dimensions.get("screen").width, height: 300 }}>
        <CartesianChart
          chartPressState={state}
          transformConfig={{
            pan: { dimensions: ["x", "y"] },
            pinch: {
              enabled: true,
            },
          }}
          onScaleChange={(xScale, yScale) => {
            lastDomainRef.current = {
              x: xScale.domain() as [number, number],
              y: yScale.domain() as [number, number],
            };

            // debounce: reset the timer, schedule a check shortly after the last change
            if (scaleChangeTimerRef.current) {
              clearTimeout(scaleChangeTimerRef.current);
            }
            scaleChangeTimerRef.current = setTimeout(() => {
              checkBoundsAndMaybeReset();
            }, 120);
          }}
          padding={{ top: 24, bottom: 12, left: 0, right: 0 }}
          transformState={transformState}
          yAxis={[
            {
              font: font,
              //  lineColor: "transparent"
            },
          ]}
          xAxis={{
            font: font,
            // lineColor: "transparent",
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
        <PrimaryButton onPress={() => handleMove(0, -50)}>Move Up</PrimaryButton>
        <PrimaryButton onPress={() => handleMove(0, 50)}>Move Down</PrimaryButton>
        <PrimaryButton onPress={() => handleMove(50, 0)}>Move Right</PrimaryButton>
        <PrimaryButton onPress={() => handleMove(-50, 0)}>Move Left</PrimaryButton>
        <PrimaryButton onPress={() => handleZoom(1.2)}>Zoom In</PrimaryButton>
        <PrimaryButton onPress={() => handleZoom(0.8)}>Zoom Out</PrimaryButton>
        <PrimaryButton onPress={() => handleReset()}>Reset</PrimaryButton>
      </View>
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
