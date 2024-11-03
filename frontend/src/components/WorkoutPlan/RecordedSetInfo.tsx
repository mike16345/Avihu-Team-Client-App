import { View, Text } from "react-native";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IRecordedSetResponse } from "@/interfaces/Workout";
import NativeIcon from "../Icon/NativeIcon";

interface RecordedSetInfoProps {
  recordedSet?: IRecordedSetResponse;
  actionButton?: JSX.Element;
}

const RecordedSetInfo: FC<RecordedSetInfoProps> = ({ recordedSet, actionButton }) => {
  const { colors, layout, spacing, common, fonts, text } = useStyles();

  return (
    <View
      style={[
        spacing.pdHorizontalSm,
        spacing.pdVerticalDefault,
        common.rounded,
        colors.backgroundSecondaryContainer,
      ]}
    >
      <View style={[layout.itemsCenter, layout.flexRowReverse, layout.justifyBetween]}>
        <Text style={[colors.textOnSecondaryContainer, fonts.lg]}>{recordedSet?.plan}</Text>
        <Text style={[fonts.md, colors.textOnSecondaryContainer]}>
          {new Date(recordedSet!.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[colors.textOnSecondaryContainer, fonts.md]}>סט {recordedSet?.setNumber}</Text>
      <View style={[layout.center, layout.flexRow, spacing.gapLg]}>
        <Text style={[colors.textOnBackground, fonts.default]}>
          {recordedSet?.repsDone}
          {"x "}
          <NativeIcon size={16} library="MaterialCommunityIcons" name="clock-plus" />
        </Text>
        <Text style={[colors.textOnBackground, fonts.default]}>
          {recordedSet?.weight}
          {"x "}
          <NativeIcon size={12} library="FontAwesome5" name="dumbbell" />
        </Text>
      </View>
      {actionButton}
    </View>
  );
};

export default RecordedSetInfo;
