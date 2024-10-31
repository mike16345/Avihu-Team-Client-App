import { View, Text } from "react-native";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IRecordedSetResponse } from "@/interfaces/Workout";

interface RecordedSetInfoProps {
  recordedSet?: IRecordedSetResponse;
  actionButton?: JSX.Element;
}

const RecordedSetInfo: FC<RecordedSetInfoProps> = ({ recordedSet, actionButton }) => {
  const { colors, layout, spacing, common, fonts, text } = useStyles();

  return (
    <View style={[spacing.pdDefault, common.rounded, colors.backgroundSecondaryContainer]}>
      <View style={[layout.itemsCenter, layout.flexRowReverse, layout.justifyBetween]}>
        <View>
          <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>
            {recordedSet?.plan}
          </Text>
          <Text style={[[colors.textOnSecondaryContainer]]}>סט {recordedSet?.setNumber}</Text>
        </View>
        {actionButton}
      </View>
      <View style={[layout.center, layout.flexRow, spacing.gapLg]}>
        <Text style={[colors.textOnBackground, fonts.default]}>
          {recordedSet?.repsDone} <Text style={[fonts.sm, spacing.mgHorizontalXs]}>חזרות</Text>
        </Text>
        <Text style={[colors.textOnBackground, fonts.default]}>
          {recordedSet?.weight} <Text style={[fonts.sm]}>ק"ג</Text>
        </Text>
      </View>
      <Text style={text.textSecondary}>{new Date(recordedSet!.date).toLocaleDateString()}</Text>
    </View>
  );
};

export default RecordedSetInfo;
