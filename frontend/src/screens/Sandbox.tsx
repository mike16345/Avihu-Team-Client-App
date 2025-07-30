import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "@/components/Icon/Icon";
import Graph from "@/components/ui/Graph";
import DateUtils from "@/utils/dateUtils";
import Collapsible from "@/components/ui/Collapsible";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

const Sandbox = () => {
  const { colors, spacing, layout, common, fonts } = useStyles();

  const [collaps, setCollapse] = useState(false);

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

      <Card variant="gray" style={[common.roundedMd]}>
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
      </Card>

      <Collapsible isCollapsed={collaps} onCollapseChange={(v) => setCollapse(v)} trigger="hello">
        <Graph
          mounted={collaps}
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
      </Collapsible>
    </View>
  );
};

export default Sandbox;
