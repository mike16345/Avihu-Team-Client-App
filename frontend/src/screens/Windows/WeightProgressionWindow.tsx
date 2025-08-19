import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Switch from "@/components/ui/Switch";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon/Icon";
import Graph from "@/components/ui/graph/Graph";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { Card } from "@/components/ui/Card";

const WeightProgressionWindow = () => {
  const { isLoading, data } = useWeighInsQuery();
  const { layout, spacing } = useStyles();
  const [first, setfirst] = useState(false);

  const weighIns = useMemo(() => {
    if (!data) return [];

    return data?.map((item) => item.weight);
  }, [data]);

  return (
    <View style={[layout.center, layout.center, spacing.gap20]}>
      <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
        <Icon height={24} width={24} name="graph" />
        <Switch onToggleSwitch={(mode) => setfirst(mode)} />
        <Icon height={24} width={24} name="calendar" />
      </View>
      <ConditionalRender condition={isLoading}>
        <View style={[layout.center]}>
          <SpinningIcon mode="light" />
        </View>
      </ConditionalRender>
      <Card style={[layout.widthFull]}>
        <Card.Content>
          <Graph data={weighIns} labels={["Jan", "Feb", "Mar", "Apr"]} />
        </Card.Content>
      </Card>
    </View>
  );
};

export default WeightProgressionWindow;
