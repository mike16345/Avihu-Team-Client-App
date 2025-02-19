import { View, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import WheelPicker from "../ui/WheelPicker";
import WeightWheelPicker from "../WeightGraph/WeightWheelPicker";
import { Text } from "../ui/Text";
import React, { useMemo, useState } from "react";
import { Button } from "react-native-paper";
import { generateWheelPickerData } from "@/utils/utils";
import { IRecordedSet } from "@/interfaces/Workout";
import Loader from "../ui/loaders/Loader";

interface RecordExerciseInputsProps {
  handleClose: () => void;
  saveSet: (recordedSet: Omit<IRecordedSet, "plan">) => void;
  lastRecordedSet: Omit<IRecordedSet, "plan"> | null;
  isLoading: boolean;
}

const RecordExerciseInputs: React.FC<RecordExerciseInputsProps> = ({
  handleClose,
  lastRecordedSet,
  saveSet,
  isLoading,
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { height, width } = useWindowDimensions();

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>(
    lastRecordedSet || {
      weight: 0,
      repsDone: 0,
      note: "",
    }
  );

  const repsOptions = useMemo(() => generateWheelPickerData(1, 100), []);

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet((prev) => {
      return { ...prev, [key]: value };
    });
  };

  if (isLoading) return <Loader />;

  return (
    <View style={[spacing.gapXxl, spacing.pdVerticalXl]}>
      <Text
        style={[
          colors.textPrimary,
          fonts.xl,
          text.textBold,
          text.textRight,
          spacing.pdHorizontalDefault,
        ]}
      >
        הקלטת סט
      </Text>

      <View
        style={[
          layout.flexRow,
          layout.justifyEvenly,
          spacing.pdVerticalXl,
          colors.backdrop,
          common.rounded,
        ]}
      >
        <View style={[layout.center, spacing.gapDefault]}>
          <Text style={[colors.textOnSecondaryContainer, fonts.default]}>חזרות</Text>

          <View
            style={[
              { borderTopWidth: 2, borderBottomWidth: 2 },
              colors.borderSecondary,
              spacing.pdHorizontalDefault,
              spacing.pdVerticalMd,
              common.rounded,
              colors.backdrop,
              { width: width * 0.3 },
            ]}
          >
            <WheelPicker
              activeItemColor={colors.textOnSurface.color}
              inactiveItemColor={colors.textOnSurfaceDisabled.color}
              data={repsOptions}
              onValueChange={(val) => handleUpdateRecordedSet("repsDone", val)}
              selectedValue={recordedSet.repsDone || lastRecordedSet?.repsDone || 0}
              height={height * 0.08}
              itemHeight={35}
            />
          </View>
        </View>
        <View style={[layout.center, spacing.gapDefault]}>
          <Text style={[colors.textOnSecondaryContainer, fonts.default]}>משקל</Text>

          <View
            style={[
              { borderTopWidth: 2, borderBottomWidth: 2 },
              colors.borderSecondary,
              spacing.pdHorizontalDefault,
              spacing.pdVerticalMd,
              common.rounded,
              colors.backdrop,
              { width: width * 0.45 },
            ]}
          >
            <WeightWheelPicker
              onValueChange={(val) => {
                handleUpdateRecordedSet("weight", val);
              }}
              activeItemColor={colors.textOnSurface.color}
              inactiveItemColor={colors.textOnSurfaceDisabled.color}
              minWeight={1}
              decimalStepSize={25}
              showZeroDecimal={true}
              decimalRange={100}
              maxWeight={200}
              stepSize={1}
              label=""
              height={height * 0.08}
              itemHeight={35}
              selectedWeight={recordedSet.weight || lastRecordedSet?.weight || 0}
            />
          </View>
        </View>
      </View>
      <View
        style={[
          layout.center,
          colors.backdrop,
          common.rounded,
          spacing.pdDefault,
          layout.flexRow,
          spacing.gapLg,
        ]}
      >
        <Text style={[colors.textOnBackground, fonts.lg, text.textBold]}>
          {recordedSet.repsDone} <Text style={[fonts.md, spacing.pdHorizontalLg]}>חז'</Text>
        </Text>
        <Text style={[colors.textOnBackground, fonts.lg, text.textBold]}>
          {recordedSet.weight} <Text style={[fonts.md, spacing.pdHorizontalLg]}>קג'</Text>
        </Text>
      </View>
      <View
        style={[
          layout.flexDirectionByPlatform,
          layout.center,
          layout.widthFull,
          spacing.gapLg,
          spacing.pdHorizontalDefault,
        ]}
      >
        <Button
          mode="contained"
          onPress={() => saveSet(recordedSet)}
          style={[common.rounded, { width: `48%` }]}
        >
          <Text style={[text.textBold, colors.textOnBackground]}>שמור</Text>
        </Button>
        <Button
          mode="contained-tonal"
          onPress={handleClose}
          style={[common.rounded, { width: `48%` }]}
        >
          בטל
        </Button>
      </View>
    </View>
  );
};

export default RecordExerciseInputs;
