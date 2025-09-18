import { View, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RepWheelPicker from "@/components/ui/RepWheelPicker";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";
import Icon from "@/components/Icon/Icon";
import { generateWheelPickerData } from "@/utils/utils";
import { FC, useMemo, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { LinearTransition, FadeInDown, FadeOutUp } from "react-native-reanimated";
import { IRecordedSet } from "@/interfaces/Workout";

const horizontalPadding = 24;
const verticalPadding = 16;

const set: Omit<SetInput, "setNumber"> = {
  repsDone: 0,
  weight: 0,
};

const MIN_REPS = 0;
const MAX_REPS = 125;
const STEP_SIZE = 1;

function isSetValid(set: SetInput) {
  return set.repsDone > 0 && set.weight > 0;
}

interface SetInputContainerProps {
  setNumber: number;
  maxSets: number;
}

type SetInput = Omit<IRecordedSet, "plan">;

const SetInputContainer: FC<SetInputContainerProps> = ({ maxSets, setNumber }) => {
  const { width } = useWindowDimensions();
  const { layout, colors, spacing, common } = useStyles();

  const activeColor = colors.textPrimary.color;
  const inactiveColor = colors.textPrimary.color;
  const containerWidth = width * 0.9;
  const wheelPickerWidth = containerWidth / 2;

  const [isExpanded, setIsExpanded] = useState(false);
  const [recordedSets, setRecordedSets] = useState<SetInput[]>([
    {
      ...set,
      setNumber: setNumber,
    },
  ]);

  const handleAppendSet = () => {
    setRecordedSets((prev) => {
      const prevSetNumber = prev[prev.length - 1].setNumber;
      const newSet = { ...set, setNumber: prevSetNumber + 1 };

      return [...prev, newSet];
    });
  };

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K],
    index: number
  ) => {
    setRecordedSets((prev) => {
      const sets = [...prev];
      sets[index] = { ...sets[index], [key]: value };

      return sets;
    });
  };

  const data = useMemo(() => generateWheelPickerData(MIN_REPS, MAX_REPS, STEP_SIZE, false), []);

  const Sets = useMemo(() => {
    return recordedSets.map((recordedSet, i) => {
      const isFirstItem = i == 0;

      const isDisabled = i !== 0 || (!isFirstItem && isSetValid(recordedSets[i - 1]));

      return (
        <View key={i} style={[layout.flexRow, layout.center, spacing.gapXl]}>
          <WeightWheelPicker
            activeItemColor={activeColor}
            inactiveItemColor={inactiveColor}
            selectedWeight={recordedSet.weight}
            onValueChange={(val) => handleUpdateRecordedSet("weight", val, i)}
            minWeight={0}
            decimalStepSize={25}
            showZeroDecimal={true}
            decimalRange={100}
            maxWeight={500}
            height={50}
            stepSize={1}
            disabled={isDisabled}
            label={isFirstItem && "משקל"}
            style={{ width: wheelPickerWidth - horizontalPadding }}
          />
          <RepWheelPicker
            disabled={isDisabled}
            label={!isFirstItem ? "" : undefined}
            data={data}
            onValueChange={(val) => handleUpdateRecordedSet("repsDone", val, i)}
            selectedValue={recordedSet.repsDone}
            style={{ width: wheelPickerWidth - (horizontalPadding + horizontalPadding / 2) }}
          />
        </View>
      );
    });
  }, [recordedSets]);

  const SetsToShow = Sets.slice(0, isExpanded ? Sets.length : 1);

  return (
    <BottomSheetModal
      onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
      visible={isExpanded}
      onClose={() => setIsExpanded(false)}
    >
      <View
        style={[
          layout.flex1,
          isExpanded ? layout.justifyBetween : spacing.gapLg,
          common.roundedMd,
          colors.backgroundSurface,
          styles.inputContainer,
        ]}
      >
        <View style={[spacing.gapLg]}>
          <View style={[layout.center]}>
            <Pressable onPress={() => setIsExpanded((expanded) => !expanded)}>
              <Icon name={isExpanded ? "arrowRoundDown" : "arrowRoundUp"} />
            </Pressable>
          </View>
          {SetsToShow}
          {isExpanded && recordedSets[recordedSets.length - 1].setNumber < maxSets && (
            <Animated.View
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              entering={FadeInDown.duration(160)}
              exiting={FadeOutUp.duration(140)}
            >
              <PrimaryButton onPress={handleAppendSet} block mode="light">
                הוספת משקל
              </PrimaryButton>
            </Animated.View>
          )}
        </View>
        <Animated.View layout={LinearTransition.springify().damping(18).stiffness(180)}>
          <PrimaryButton block>עדכון</PrimaryButton>
        </Animated.View>
      </View>
    </BottomSheetModal>
  );
};

export default SetInputContainer;

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: verticalPadding,
    paddingHorizontal: horizontalPadding,
  },
});
