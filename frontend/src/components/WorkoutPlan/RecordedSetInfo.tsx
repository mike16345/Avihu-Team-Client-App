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
        <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>
          {recordedSet?.plan}
        </Text>
        {actionButton}
      </View>
      <Text style={colors.textOnBackground}>
        סט {recordedSet?.setNumber}: {recordedSet?.weight} ק"ג x {recordedSet?.repsDone} חזרות
      </Text>
      <Text style={text.textSecondary}>{new Date(recordedSet.date).toLocaleDateString()}</Text>
    </View>
  );
};

export default RecordedSetInfo;
