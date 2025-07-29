import { View, Text, ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "@/components/Icon/Icon";
import Graph from "@/components/ui/Graph";
import DateUtils from "@/utils/dateUtils";

const Sandbox = () => {
  const { colors, spacing, layout, common, fonts } = useStyles();

  const data = [
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100,
  ];

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <Graph
        header={
          <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
            <Icon name="clock" />
            <Text style={[fonts.lg]}>משקלים</Text>
          </View>
        }
        labels={DateUtils.extractLabels({
          range: "weeks",
          items: [
            { date: "2025-07-28T10:00:00Z" },
            { date: "2025-07-29T10:00:00Z" },
            { date: "2025-07-30T10:00:00Z" },
            { date: "2025-07-31T10:00:00Z" },
            { date: "2025-08-01T10:00:00Z" },
            { date: "2025-08-02T10:00:00Z" },
            { date: "2025-08-03T10:00:00Z" },
          ],
          dateKey: "date",
          n: 1,
        })}
        data={data}
      />
      <Graph
        header={
          <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
            <Icon name="clock" />
            <Text style={[fonts.lg]}>משקלים</Text>
          </View>
        }
        labels={DateUtils.extractLabels({
          range: "days",
          items: [
            { date: "2025-07-28T10:00:00Z" },
            { date: "2025-07-29T10:00:00Z" },
            { date: "2025-07-30T10:00:00Z" },
            { date: "2025-07-31T10:00:00Z" },
            { date: "2025-08-01T10:00:00Z" },
            { date: "2025-08-02T10:00:00Z" },
          ],
          dateKey: "date",
          n: 1,
        })}
        data={data}
      />
    </View>
  );
};

export default Sandbox;
