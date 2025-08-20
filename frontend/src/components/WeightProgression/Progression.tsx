import { View } from "react-native";
import { useState } from "react";
import Icon from "../Icon/Icon";
import WeighInsGraph from "../WeightGraph/WeighInsGraph";
import { Text } from "../ui/Text";
import Switch from "../ui/Switch";
import useStyles from "@/styles/useGlobalStyles";

const Progression = () => {
  const { layout, spacing } = useStyles();
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <View style={[spacing.gapMd]}>
      <View style={[layout.flexRow, spacing.gapDefault, layout.center]}>
        <Icon name="graph" />
        <Switch isOn={showCalendar} setIsOn={setShowCalendar} />
        <Icon name="calendar" />
      </View>
      <View style={{ display: showCalendar ? "flex" : "none" }}>
        <Text>Calendar</Text>
      </View>
      <View style={{ display: showCalendar ? "none" : "flex" }}>
        <WeighInsGraph />
      </View>
    </View>
  );
};

export default Progression;
