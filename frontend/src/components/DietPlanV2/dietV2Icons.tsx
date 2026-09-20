import { semanticColors } from "@/themes/semanticColors";
import React from "react";
import Svg, { Path, Circle, Line, G } from "react-native-svg";

const GREEN = semanticColors.app.brandStrong;

interface IconProps {
  size?: number;
  color?: string;
}

export const DropIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 3 C12 3, 5 11, 5 15.5 C5 19.6, 8.1 22, 12 22 C15.9 22, 19 19.6, 19 15.5 C19 11, 12 3, 12 3 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const SproutIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 21 V11" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path
      d="M12 12 C12 8, 8 6, 4 7 C4 11, 8 13, 12 12 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M12 11 C12 7, 16 5, 20 6 C20 10, 16 12, 12 11 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const DrumstickIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M15.5 3 C11 3, 8 6.5, 8 10.5 C8 12, 8.5 13.2, 9.3 14 L6 17.3 L5 17.3 L4 19 L5.5 19 L5.5 20.5 L7.2 19.5 L7.2 18.5 L10.5 15.2 C11.3 16, 12.5 16.5, 14 16.5 C18 16.5, 21.5 13.5, 21.5 9 C21.5 5.5, 19 3, 15.5 3 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const FlameIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 C12 6, 8 8, 8 13 C8 16.9, 9.8 19.5, 12 21 C14.2 19.5, 16 16.9, 16 13 C16 11, 15 10, 14 10 C14.5 8, 13.5 5, 12 2 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const SunriseIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 18 H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path
      d="M6 15 A6 6 0 0 1 18 15"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Line x1={12} y1={4} x2={12} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line
      x1={4.5}
      y1={9.5}
      x2={6.5}
      y2={11}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Line
      x1={19.5}
      y1={9.5}
      x2={17.5}
      y2={11}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={4} fill="none" stroke={color} strokeWidth={1.8} />
    <G stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Line x1={12} y1={2.5} x2={12} y2={5} />
      <Line x1={12} y1={19} x2={12} y2={21.5} />
      <Line x1={2.5} y1={12} x2={5} y2={12} />
      <Line x1={19} y1={12} x2={21.5} y2={12} />
      <Line x1={5.5} y1={5.5} x2={7.2} y2={7.2} />
      <Line x1={16.8} y1={16.8} x2={18.5} y2={18.5} />
      <Line x1={5.5} y1={18.5} x2={7.2} y2={16.8} />
      <Line x1={16.8} y1={7.2} x2={18.5} y2={5.5} />
    </G>
  </Svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 22, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 14.5 A8 8 0 1 1 9.5 4 A6.5 6.5 0 0 0 20 14.5 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M17 5 L17.6 6.4 L19 7 L17.6 7.6 L17 9 L16.4 7.6 L15 7 L16.4 6.4 Z"
      fill={color}
      stroke={color}
      strokeWidth={0.5}
      strokeLinejoin="round"
    />
    <Path
      d="M14 10 L14.4 10.9 L15.3 11.3 L14.4 11.7 L14 12.6 L13.6 11.7 L12.7 11.3 L13.6 10.9 Z"
      fill={color}
      stroke={color}
      strokeWidth={0.4}
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 20, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 9 L12 15 L18 9"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 20, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 3 L13.6 9 L19.5 10.5 L13.6 12 L12 18 L10.4 12 L4.5 10.5 L10.4 9 Z"
      fill={color}
      stroke={color}
      strokeWidth={1}
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 15 L19.2 17 L21 17.6 L19.2 18.2 L18.5 20 L17.8 18.2 L16 17.6 L17.8 17 Z"
      fill={color}
      stroke={color}
      strokeWidth={0.5}
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={6.5} fill="none" stroke={color} strokeWidth={1.8} />
    <Line
      x1={16}
      y1={16}
      x2={20.5}
      y2={20.5}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const BarcodeIcon: React.FC<IconProps> = ({ size = 18, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <Line x1={4} y1={5.5} x2={4} y2={18.5} />
      <Line x1={7} y1={5.5} x2={7} y2={18.5} />
      <Line x1={10} y1={5.5} x2={10} y2={18.5} strokeWidth={2.4} />
      <Line x1={13} y1={5.5} x2={13} y2={18.5} />
      <Line x1={16} y1={5.5} x2={16} y2={18.5} strokeWidth={2.4} />
      <Line x1={19} y1={5.5} x2={19} y2={18.5} />
    </G>
  </Svg>
);

export const PencilIcon: React.FC<IconProps> = ({ size = 16, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 20 L4 16.5 L15.5 5 L19 8.5 L7.5 20 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Line
      x1={13.5}
      y1={7}
      x2={17}
      y2={10.5}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const PlusCircleIcon: React.FC<IconProps> = ({ size = 16, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
    <Line
      x1={12}
      y1={7.5}
      x2={12}
      y2={16.5}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Line
      x1={7.5}
      y1={12}
      x2={16.5}
      y2={12}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const DotsIcon: React.FC<IconProps> = ({ size = 20, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={5.5} cy={12} r={1.6} fill={color} />
    <Circle cx={12} cy={12} r={1.6} fill={color} />
    <Circle cx={18.5} cy={12} r={1.6} fill={color} />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 18, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 7 V12 L15.5 14"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 18, color = GREEN }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M15 6 L9 12 L15 18"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DIET_V2_GREEN = GREEN;
export const DIET_V2_MINT = semanticColors.diet.mint;
export const DIET_V2_MUTED = semanticColors.diet.secondaryText;
export const DIET_V2_DARK = semanticColors.diet.primaryText;
export const DIET_V2_CARD_BORDER = semanticColors.diet.border;
