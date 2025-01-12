import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import MyWeightProgressScreen from "./MyWeightProgressScreen";
import MyWorkoutProgressionScreen from "./MyWorkoutProgressionScreen";

const MyProgressScreen = () => {
  const { colors, common, layout, spacing } = useStyles();
  const [selectedScreen, setSelectedScreen] = useState<string>(`weight`);

  return (
    <View style={[layout.sizeFull, layout.itemsCenter, spacing.pdVerticalMd, spacing.gapDefault]}>
      <SegmentedButtons
        style={[spacing.pdHorizontalXxl]}
        value={selectedScreen}
        onValueChange={(val) => setSelectedScreen(val)}
        buttons={[
          {
            value: "weight",
            label: "משקל",
            style: [
              common.rounded,
              selectedScreen == `weight` ? colors.backgroundPrimary : colors.background,
            ],
          },
          {
            value: "workout",
            label: "אימונים",
            style: [
              common.rounded,
              selectedScreen == `workout` ? colors.backgroundPrimary : colors.background,
            ],
          },
        ]}
      />
      {selectedScreen == `weight` && <MyWeightProgressScreen />}
      {selectedScreen == `workout` && <MyWorkoutProgressionScreen />}
    </View>
  );
};

export default MyProgressScreen;
