import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Switch from "@/components/ui/Switch";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";
import WeighInsGraph from "@/components/WeightGraph/WeighInsGraph";

const WeightProgressionWindow = () => {
  const { layout, spacing } = useStyles();
  const [first, setfirst] = useState(false);

  return (
    <View style={[layout.center, layout.center, { paddingHorizontal: 16 }, spacing.gap20]}>
      <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
        <Icon name="graph" />
        <Switch onToggleSwitch={(mode) => setfirst(mode)} />
        <Icon name="calendar" />
      </View>
      <WeighInsGraph />
    </View>
  );
};

export default WeightProgressionWindow;
