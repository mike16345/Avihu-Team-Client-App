import { StyleSheet, Text, View } from "react-native";
import { FC } from "react";
import { ISet } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";

interface SetContainerProps {
  currentSetNumber: number;
  currentSet: ISet;
}

const SetContainer: FC<SetContainerProps> = ({ currentSet, currentSetNumber }) => {
  const { layout, colors, spacing, text, fonts } = useStyles();
  const maxReps = currentSet.maxReps && currentSet.maxReps !== 0 ? currentSet.maxReps : "";

  return (
    <View style={[spacing.gapSm]}>
      <Text style={[text.textBold, colors.textOnSecondaryContainer]}>סט: {currentSetNumber}</Text>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapXs]}>
        <Text style={[colors.textOnSecondaryContainer]}>
          {currentSet.minReps}
          {maxReps && ` - ${maxReps}`}
        </Text>
        <Text style={[text.textBold, colors.textOnSecondaryContainer]}>חזרות:</Text>
      </View>
    </View>
  );
};

export default SetContainer;

const styles = StyleSheet.create({
  setsContainer: {
    alignItems: `flex-end`,
    gap: 5,
  },
  set: {
    fontSize: 14,
    fontWeight: "600",
  },
});
