import { View } from "react-native";
import { useState } from "react";
import Icon from "../Icon/Icon";
import WeighInsGraph from "../WeightGraph/WeighInsGraph";
import Switch from "../ui/Switch";
import useStyles from "@/styles/useGlobalStyles";
import WeightInput from "../WeightGraph/WeightInput";
import WeighInsCalendar from "../Calendar/WeighInsCalendar";

const Progression = () => {
  const { layout, spacing } = useStyles();
  const [showCalendar, setShowCalendar] = useState(true);

  return (
    <View style={[spacing.gapMd]}>
      <View style={[layout.flexRow, spacing.gapDefault, layout.center]}>
        <Icon name="graph" />
        <Switch isOn={showCalendar} setIsOn={setShowCalendar} />
        <Icon name="calendar" />
      </View>
      <View style={{ display: showCalendar ? "flex" : "none" }}>
        <WeighInsCalendar />
      </View>
      <View style={[spacing.gapMd, { display: showCalendar ? "none" : "flex" }]}>
        <WeighInsGraph />
        <WeightInput />
      </View>
    </View>
  );
};

export default Progression;
