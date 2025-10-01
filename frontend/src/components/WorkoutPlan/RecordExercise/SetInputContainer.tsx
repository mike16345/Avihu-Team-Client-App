import { View, Pressable, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import { FC, useCallback, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { IRecordedSet } from "@/interfaces/Workout";
import SetInputList from "./SetInputList";
import { DEFAULT_SET } from "@/constants/Constants";

const HORIZONTAL_PADDING = 24;
const VERTICAL_PADDING = 16;

interface SetInputContainerProps {
  sheetHeight: number;
  setNumber: number;
  maxSets: number;
  handleRecordSets: (sets: SetInput[]) => void;
}

export type SetInput = Omit<IRecordedSet, "plan">;

const SetInputContainer: FC<SetInputContainerProps> = ({
  handleRecordSets,
  maxSets,
  setNumber,
  sheetHeight,
}) => {
  const { layout, colors, spacing, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [recordedSets, setRecordedSets] = useState<SetInput[]>([
    {
      ...DEFAULT_SET,
      setNumber,
    },
  ]);

  const handleSubmitSets = async () => {
    setIsPending(true);
    setIsExpanded(false);
    await handleConfirmRecordSets();
    setIsPending(false);
  };

  const handleConfirmRecordSets = useCallback(async () => {
    await handleRecordSets(recordedSets);
  }, [recordedSets, handleRecordSets]);

  const handleCloseModal = () => {
    setIsExpanded(false);
    setRecordedSets((prev) => prev.slice(0, 1));
  };

  return (
    <>
      <BottomSheetModal
        peek={sheetHeight}
        onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
        visible={isExpanded}
        renderHandle={({ toggle, isOpen }) => (
          <Pressable onPress={toggle}>
            <Icon name={isOpen ? "arrowRoundDown" : "arrowRoundUp"} />
          </Pressable>
        )}
        onClose={handleCloseModal}
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
          <Animated.View layout={LinearTransition.duration(250).easing(Easing.inOut(Easing.ease))}>
            <PrimaryButton loading={isPending} onPress={() => handleSubmitSets()} block>
              עדכון
            </PrimaryButton>
          </Animated.View>
        </View>
      </BottomSheetModal>
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
