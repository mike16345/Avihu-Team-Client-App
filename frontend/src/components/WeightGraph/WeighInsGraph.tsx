import { View } from "react-native";
import { useState } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import Graph from "../ui/graph/Graph";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Card } from "../ui/Card";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { GraphTab, useGraphWeighIns } from "@/hooks/useGraphWeighIns";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs";

const tabs: GraphTab[] = ["יומי", "שבועי", "חודשי"];

const WeighInsGraph = () => {
  const { isLoading, data } = useWeighInsQuery();
  const { layout, spacing } = useStyles();
  const [selectedTab, setSelectedTab] = useState<GraphTab>("יומי");

  const { getWeighInsByTab } = useGraphWeighIns(data);

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  const { weighIns, labels } = getWeighInsByTab(selectedTab);

  return (
    <View style={[spacing.gapLg]}>
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as GraphTab)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} label={tab} />
          ))}
        </TabsList>
      </Tabs>

      <Card style={[layout.widthFull]} variant="gray">
        <Card.Header style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Icon name="clock" />
          <Text fontSize={16}>מעקב שקילה</Text>
        </Card.Header>

        <Card.Content>
          <Graph data={weighIns} labels={labels} />
        </Card.Content>
      </Card>
    </View>
  );
};

export default WeighInsGraph;
