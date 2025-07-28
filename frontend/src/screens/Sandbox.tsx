import { View, Text, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Collapsible from "@/components/ui/Collapsible";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";
import WheelPicker from "@/components/ui/WheelPicker";
import { generateWheelPickerData } from "@/utils/utils";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();
  const { height, width } = useWindowDimensions();

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
        layout.flexRow,
        layout.center,
      ]}
    >
      <View>
        <View
          style={[
            common.borderXsm,
            spacing.pdHorizontalDefault,
            spacing.pdVerticalXs,
            common.rounded,
            { width: width * 0.45 },
          ]}
        >
          <WeightWheelPicker
            onValueChange={(val) => {
              setWeightVal(val);
            }}
            activeItemColor={colors.textPrimary.color}
            inactiveItemColor={colors.textPrimary.color}
            minWeight={1}
            decimalStepSize={25}
            showZeroDecimal={true}
            decimalRange={100}
            maxWeight={500}
            stepSize={1}
            label=""
            height={50}
            itemHeight={35}
            selectedWeight={weightVal}
          />
        </View>
      </View>

      <View>
        <View
          style={[
            common.borderXsm,
            spacing.pdHorizontalDefault,
            spacing.pdVerticalXs,
            common.rounded,
            { width: width * 0.4 },
          ]}
        >
          <WheelPicker
            activeItemColor={colors.textPrimary.color}
            inactiveItemColor={colors.textPrimary.color}
            data={generateWheelPickerData(1, 100)}
            onValueChange={(val) => setWheelVal(val)}
            selectedValue={wheelVal}
            height={50}
            itemHeight={35}
          />
        </View>
      </View>
    </View>
  );
};

export default Sandbox;
