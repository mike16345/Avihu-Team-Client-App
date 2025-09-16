import {
  Circle,
  Group,
  Paint,
  RoundedRect,
  Shadow,
  SkFont,
  Text as SkText,
} from "@shopify/react-native-skia";
import { DerivedValue, SharedValue, useDerivedValue } from "react-native-reanimated";
import { ChartBounds } from "victory-native";

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
