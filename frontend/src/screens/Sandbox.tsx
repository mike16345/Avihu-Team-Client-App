import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Collapsible from "@/components/ui/Collapsible";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";
import WheelPicker from "@/components/ui/WheelPicker";
import { generateWheelPickerData } from "@/utils/utils";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [wheelVal, setWheelVal] = useState(12);
  const [weightVal, setWeightVal] = useState(12);

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

      <WheelPicker
        activeItemColor="green"
        inactiveItemColor="grey"
        selectedValue={wheelVal}
        onValueChange={(v) => setWheelVal(v)}
        data={generateWheelPickerData(1, 100)}
      />

      <WeightWheelPicker
        activeItemColor="green"
        inactiveItemColor="grey"
        onValueChange={(v) => setWeightVal(v)}
        minWeight={1}
        decimalStepSize={25}
        showZeroDecimal={true}
        decimalRange={100}
        maxWeight={500}
        stepSize={1}
        label=""
        selectedWeight={weightVal}
        itemHeight={35}
      />
    </View>
  );
};

export default Sandbox;
