import { View } from "react-native";
import { useMemo, useState } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import Graph from "../ui/graph/Graph";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Card } from "../ui/Card";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { Tabs, TabsList } from "../ui/Tabs";

const WeighInsGraph = () => {
  const { isLoading, data } = useWeighInsQuery();
  const { layout, spacing } = useStyles();

  const weighIns = useMemo(() => {
    if (!data) return [];

    return data?.map((item) => item.weight);
  }, [data]);

  

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <View>
      {/* <Tabs>
        <TabsList></TabsList>
        {tabContent}
      </Tabs> */}
      <Card variant="gray" style={[layout.widthFull]}>
        <Card.Header style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Icon name="clock" />
          <Text fontSize={16}>מעקב שקילה</Text>
        </Card.Header>
        <Card.Content>
          <Graph data={weighIns} labels={["Jan", "Feb", "Mar", "Apr"]} />
        </Card.Content>
      </Card>
    </View>
  );
};

export default WeighInsGraph;
