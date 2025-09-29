import RepWheelPicker from "@/components/ui/RepWheelPicker";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";
import { generateWheelPickerData } from "@/utils/utils";
import React, { memo, useCallback, useMemo, useState } from "react";
import { View, StyleProp, ViewStyle, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { SetInput } from "./SetInputContainer";
import useColors from "@/styles/useColors";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

const MIN_REPS = 0;
const MAX_REPS = 125;
const STEP_SIZE = 1;
const MIN_WEIGHT = 0;
const MAX_WEIGHT = 250;
const HORIZONTAL_PADDING = 24;
const ROW_HEIGHT = 50;
const GAP = 16;

function isSetValid(set: SetInput) {
  return set.repsDone > 0 && set.weight > 0;
}

interface SetRowProps {
  index: number;
  item: SetInput;
  disabled: boolean;
  isFirstItem: boolean;
  onUpdate: (field: "weight" | "repsDone", value: number, index: number) => void;
}

const SetRow = memo(
  function SetRow({ index, item, disabled, isFirstItem, onUpdate }: SetRowProps) {
    const { width } = useWindowDimensions();
    const colors = useColors();

    const containerWidth = width * 0.9;
    const wheelPickerWidth = containerWidth / 2;
    const activeColor = colors.textPrimary.color;
    const inactiveColor = colors.textPrimary.color;

    const handleWeight = useCallback(
      (val: number) => onUpdate("weight", val, index),
      [onUpdate, index]
    );

    const handleRepsChange = useCallback(
      (val: number) => onUpdate("repsDone", val, index),
      [onUpdate, index]
    );

    const repData = useMemo(
      () => generateWheelPickerData(MIN_REPS, MAX_REPS, STEP_SIZE, false),
      []
    );

    return (
      <View style={styles.setRow}>
        <WeightWheelPicker
          activeItemColor={activeColor}
          inactiveItemColor={inactiveColor}
          selectedWeight={item.weight}
          onValueChange={handleWeight}
          minWeight={MIN_WEIGHT}
          maxWeight={MAX_WEIGHT}
          decimalStepSize={25}
          showZeroDecimal={true}
          decimalRange={100}
          height={50}
          stepSize={1}
          disabled={disabled}
          label={isFirstItem && "משקל"}
          style={{ width: wheelPickerWidth - HORIZONTAL_PADDING * 1.5 }}
        />
        <RepWheelPicker
          disabled={disabled}
          label={!isFirstItem ? "" : undefined}
          data={repData}
          onValueChange={handleRepsChange}
          selectedValue={item.repsDone}
          style={{ width: wheelPickerWidth - (HORIZONTAL_PADDING + HORIZONTAL_PADDING) }}
        />
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.item.weight === next.item.weight &&
      prev.item.repsDone === next.item.repsDone &&
      prev.disabled === next.disabled &&
      prev.isFirstItem === next.isFirstItem
    );
  }
);

type SetInputListProps = {
  isExpanded: boolean;
  setNumber: number;
  maxSets: number;
  containerHeight: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const set: Omit<SetInput, "setNumber"> = {
  repsDone: 0,
  weight: 0,
};

const SetInputList: React.FC<SetInputListProps> = ({
  isExpanded,
  setNumber,
  contentContainerStyle,
  maxSets,
  containerHeight,
}) => {
  const [recordedSets, setRecordedSets] = useState<SetInput[]>([
    {
      ...set,
      setNumber: setNumber,
    },
  ]);
  const isOneItem = recordedSets.length === 1;
  const LABEL_HEIGHT = 48;
  const maxToFitInContainer = Math.floor(
    containerHeight / (ROW_HEIGHT + (isOneItem ? LABEL_HEIGHT : 0) + GAP)
  );
  const isNotExceedingMaxSets = recordedSets.length < maxSets;
  const isAbleToAddSet = recordedSets.length + 1 <= maxToFitInContainer;
  const isFooterVisible = isExpanded && isNotExceedingMaxSets && isAbleToAddSet;

  const handleUpdateRecordedSets = <K extends keyof SetInput>(
    key: keyof SetInput,
    value: SetInput[K],
    index: number
  ) => {
    setRecordedSets((prev) => {
      const sets = [...prev];
      sets[index] = { ...sets[index], [key]: value };

      return sets;
    });
  };

  const handleAppendSet = useCallback(() => {
    setRecordedSets((prev) => {
      const prevSetNumber = prev[prev.length - 1].setNumber;
      const newSet = { ...set, setNumber: prevSetNumber + 1 };

      return [...prev, newSet];
    });
  }, []);

  const renderItem = useCallback(
    ({ item, disabled, index }: { item: SetInput; disabled: boolean; index: number }) => {
      return (
        <SetRow
          key={item.setNumber}
          index={index}
          item={item}
          disabled={disabled}
          isFirstItem={index == 0}
          onUpdate={handleUpdateRecordedSets}
        />
      );
    },
    [recordedSets]
  );

  const SetInputs = useMemo(() => {
    let disabled = false;

    return recordedSets.map((item, index) => {
      disabled = index !== 0 && !isSetValid(recordedSets[index - 1]);

      return renderItem({ item, disabled, index });
    });
  }, [recordedSets]);

  return (
    <View style={{ gap: GAP }}>
      <Animated.View style={[{ gap: GAP }]}>{isExpanded ? SetInputs : SetInputs[0]}</Animated.View>

      {isFooterVisible && (
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
  );
};

export default memo(SetInputList);

const styles = StyleSheet.create({
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
});
