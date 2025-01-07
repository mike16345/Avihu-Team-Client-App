import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import MyWeightProgressScreen from "./MyWeightProgressScreen";
import MyWorkoutProgressionScreen from "./MyWorkoutProgressionScreen";

const MyProgressScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const [selectedScreen, setSelectedScreen] = useState<string>(`weight`);

  return (
    <View style={[layout.sizeFull, layout.itemsCenter, spacing.pdVerticalMd, spacing.gapDefault]}>
      <SegmentedButtons
        style={[{ width: `40%` }]}
        value={selectedScreen}
        onValueChange={(val) => setSelectedScreen(val)}
        buttons={[
          {
            value: "weight",
            label: "משקל",
          },
          {
            value: "workout",
            label: "אימונים",
          },
        ]}
      />
      {selectedScreen == `weight` && <MyWeightProgressScreen />}
      {selectedScreen == `workout` && <MyWorkoutProgressionScreen />}
    </View>
  );
};

export default MyProgressScreen;
