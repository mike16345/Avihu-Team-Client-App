import React from "react";
import { useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "../Icon/NativeIcon";
import useGraphTheme from "@/themes/useGraphTheme";
import Divider from "../ui/Divider";

interface WorkoutGraphProps {
  label: string;
  values: number[];
  dates: string[];
}

const WorkoutGraph: React.FC<WorkoutGraphProps> = ({ label, values, dates }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const graphTheme = useGraphTheme([values.length]);
  const { width, height } = useWindowDimensions();

  const percentage = (((values[values.length - 1] - values[0]) / values[0]) * 100).toFixed(2);
  const isDeclining = !!(Number(percentage) < 0);

  console.log(isDeclining);

  return (
    <View
      style={[
        layout.widthFull,
        colors.backgroundSecondaryContainer,
        common.rounded,
        spacing.pdDefault,
        spacing.gapDefault,
      ]}
    >
      <View style={[layout.flexDirectionByPlatform, layout.justifyBetween, layout.itemsCenter]}>
        <View style={[layout.flexRow, layout.center, spacing.pdDefault]}>
          <Text
            style={[
              fonts.lg,
              text.textBold,
              text.textCenter,
              isDeclining ? colors.textDanger : colors.textSuccess,
            ]}
          >
            {percentage}%
          </Text>
          <NativeIcon
            library="MaterialIcons"
            name={isDeclining ? `arrow-drop-down` : "arrow-drop-up"}
            style={[fonts.xl, isDeclining ? colors.textDanger : colors.textSuccess]}
          />
        </View>
        <Text style={[text.textRight, colors.textOnBackground, text.textBold, spacing.pdDefault]}>
          {label}
        </Text>
      </View>
      <Divider thickness={1} color={colors.textOnBackground.color} style={{ opacity: 0.5 }} />
      <LineChart
        data={{
          labels: dates,
          datasets: [
            {
              data: values,
              color: (_: number) => colors.textPrimary.color,
            },
          ],
        }}
        /* 
        width={width - 20}
        height={220}
        onDataPointClick={({ value }) => {
          setSelectedWeight(value);
        }}
        chartConfig={graphTheme} */
        verticalLabelRotation={30}
        chartConfig={graphTheme}
        width={width - 48}
        height={280}
        withInnerLines={false}
        withOuterLines={false}
        style={{
          borderRadius: 12,
          padding: 4,
        }}
      />
    </View>
  );
};

export default WorkoutGraph;
