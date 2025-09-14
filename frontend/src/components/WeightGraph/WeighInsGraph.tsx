import { View } from "react-native";
import { useState } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import Graph from "../ui/graph/Graph";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Card } from "../ui/Card";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { GraphTab } from "@/hooks/graph/useGraphWeighIns";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs";
import {
  GraphData,
  useVictoryNativeGraphWeighIns,
} from "@/hooks/graph/useVictoryNativeGraphWeighIns";

const tabs: GraphTab[] = ["יומי", "שבועי", "חודשי"];
const initialTab: GraphTab = "יומי";

const WeighInsGraph = () => {
  const { isLoading, data } = useWeighInsQuery();
  const { layout, spacing } = useStyles();

  const { dailyWeighIns, weeklyWeighIns, monthlyWeighIns } = useVictoryNativeGraphWeighIns(data);

  const [selectedTab, setSelectedTab] = useState<GraphTab>(initialTab);
  const weighIns: Record<GraphTab, GraphData[]> = {
    יומי: dailyWeighIns,
    שבועי: weeklyWeighIns,
    חודשי: monthlyWeighIns,
  };

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <View style={[spacing.gapLg, layout.flex1]}>
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as GraphTab)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} label={tab} />
          ))}
        </TabsList>
      </Tabs>
      <Card variant="gray" style={{ flex: 1 }}>
        <Card.Header style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Icon name="clock" />
          <Text fontSize={16}>מעקב שקילה</Text>
        </Card.Header>

        <Graph data={weighIns[selectedTab]} />
      </Card>
    </View>
  );
};

export default WeighInsGraph;
