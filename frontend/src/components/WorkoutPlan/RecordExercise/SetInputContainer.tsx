import { View, Pressable, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import { FC, useCallback, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { LinearTransition } from "react-native-reanimated";
import { IRecordedSet } from "@/interfaces/Workout";
import SetInputList from "./SetInputList";
import ConfirmSetsModal from "./ConfirmSetsModal";
import { DEFAULT_SET } from "@/constants/Constants";

const HORIZONTAL_PADDING = 24;
const VERTICAL_PADDING = 16;

interface SetInputContainerProps {
  setNumber: number;
  maxSets: number;
  handleRecordSets: (sets: SetInput[]) => void;
}

export type SetInput = Omit<IRecordedSet, "plan">;

const SetInputContainer: FC<SetInputContainerProps> = ({
  handleRecordSets,
  maxSets,
  setNumber,
}) => {
  const { layout, colors, spacing, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [recordedSets, setRecordedSets] = useState<SetInput[]>([
    {
      ...DEFAULT_SET,
      setNumber,
    },
  ]);

  const handleSubmitSets = async () => {
    if (!isExpanded) {
      setIsModalVisible(true);
    } else {
      setIsPending(true);
      setIsExpanded(false);
      await handleConfirmRecordSets();
    }
    setIsPending(false);
  };

  const handleConfirmRecordSets = useCallback(async () => {
    await handleRecordSets(recordedSets);
  }, [recordedSets, handleRecordSets]);

  return (
    <>
      <BottomSheetModal
        onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
        visible={isExpanded}
        renderHandle={({ toggle, isOpen }) => (
          <Pressable onPress={toggle}>
            <Icon name={isOpen ? "arrowRoundDown" : "arrowRoundUp"} />
          </Pressable>
        )}
        onClose={() => setIsExpanded(false)}
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
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
          <SetInputList
            recordedSets={recordedSets}
            setRecordedSets={setRecordedSets}
            maxSets={maxSets}
            containerHeight={containerHeight}
            isExpanded={isExpanded}
          />
          <Animated.View layout={LinearTransition.springify().damping(18).stiffness(180)}>
            <PrimaryButton loading={isPending} onPress={() => handleSubmitSets()} block>
              עדכון
            </PrimaryButton>
          </Animated.View>
        </View>
      </BottomSheetModal>

      <ConfirmSetsModal
        sets={recordedSets}
        onClose={() => setIsModalVisible(false)}
        onConfirm={() => handleConfirmRecordSets()}
        visible={isModalVisible}
        title="סטים"
      />
    </>
  );
};

export default SetInputContainer;

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: VERTICAL_PADDING,
  },
});
