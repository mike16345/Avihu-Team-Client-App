import { View } from "react-native";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IRecordedSetResponse } from "@/interfaces/Workout";
import { Text } from "../ui/Text";

interface RecordedSetInfoProps {
  recordedSet?: IRecordedSetResponse;
  actionButton?: JSX.Element;
}

const RecordedSetInfo: FC<RecordedSetInfoProps> = ({ recordedSet, actionButton }) => {
  const { colors, layout, spacing, common, fonts, text } = useStyles();

  return (
    <View style={[spacing.pdMd, common.rounded, colors.backgroundSecondaryContainer]}>
      <View style={[layout.flexRowReverse]}>
        <Text style={[colors.textOnSecondaryContainer, fonts.default, text.textBold]}>
          סט {recordedSet?.setNumber}
        </Text>
        <View style={[layout.center, layout.flexGrow, layout.flexRow, spacing.gapLg]}>
          <View style={[layout.center]}>
            <Text style={[colors.textOnBackground, fonts.md, text.textBold]}>חזרות</Text>
            <Text style={[colors.textOnBackground, text.textBold, fonts.default]}>
              <Text style={[fonts.sm]}>x</Text>
              {recordedSet?.repsDone}
            </Text>
          </View>
          <View style={[layout.center]}>
            <Text style={[colors.textOnBackground, fonts.md, text.textBold]}>משקל</Text>

            <Text style={[colors.textOnBackground, text.textBold, fonts.default]}>
              {recordedSet?.weight}
              <Text style={[fonts.sm]}>{' ק"ג'}</Text>
            </Text>
          </View>
        </View>
        {actionButton}
      </View>
    </View>
  );
};

export default RecordedSetInfo;
