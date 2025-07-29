import { View, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import { generateWheelPickerData } from "@/utils/utils";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";
import RepWheelPicker from "@/components/ui/RepWheelPicker";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { width } = useWindowDimensions();

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
        layout.flexRow,
        layout.center,
      ]}
    >
      <View>
        <WeightWheelPicker
          style={{ width: width * 0.4 }}
          onValueChange={(val) => {
            setWeightVal(val);
          }}
          activeItemColor={colors.textPrimary.color}
          inactiveItemColor={colors.textPrimary.color}
          minWeight={0}
          decimalStepSize={25}
          showZeroDecimal={true}
          decimalRange={100}
          maxWeight={500}
          stepSize={1}
          height={50}
          itemHeight={35}
          selectedWeight={weightVal}
        />
      </View>

      <View>
        <RepWheelPicker
          style={{ width: width * 0.4 }}
          data={generateWheelPickerData(0, 100)}
          onValueChange={(val) => setWheelVal(val)}
          selectedValue={wheelVal}
        />
      </View>
    </View>
  );
};

export default Sandbox;
