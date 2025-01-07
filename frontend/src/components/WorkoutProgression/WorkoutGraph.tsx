import React from "react";
import { useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "../Icon/NativeIcon";
import useGraphTheme from "@/themes/useGraphTheme";
import Divider from "../ui/Divider";
import DateUtils from "@/utils/dateUtils";

interface IGraphValues {
  value: number;
  date: string;
}

interface WorkoutGraphProps {
  label: string;
  graphValues: IGraphValues[];
}

const WorkoutGraph: React.FC<WorkoutGraphProps> = ({ label, graphValues }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const graphTheme = useGraphTheme([graphValues.length]);
  const { width } = useWindowDimensions();
  const data = graphValues.map((item) => item.value);

  const percentage = (
    ((graphValues[graphValues.length - 1].value - graphValues[0].value) / graphValues[0].value) *
    100
  ).toFixed(2);
  const isDeclining = !!(Number(percentage) < 0);

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
          labels: DateUtils.extractLabels({
            items: graphValues,
            range: `years`,
            dateKey: "date",
            n: 1,
          }),
          datasets: [
            {
              data: data,
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
        chartConfig={graphTheme}
        width={width - 48}
        height={220}
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
