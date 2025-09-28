import { View, Pressable, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import { FC, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { LinearTransition } from "react-native-reanimated";
import { IRecordedSet } from "@/interfaces/Workout";
import SetInputList from "./SetInputList";

const HORIZONTAL_PADDING = 24;
const VERTICAL_PADDING = 16;

interface SetInputContainerProps {
  setNumber: number;
  maxSets: number;
}

export type SetInput = Omit<IRecordedSet, "plan">;

const SetInputContainer: FC<SetInputContainerProps> = ({ maxSets, setNumber }) => {
  const { layout, colors, spacing, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <BottomSheetModal
      onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
      visible={isExpanded}
      renderHandle={({ toggle, isOpen }) => (
        <Pressable onPress={toggle}>
          <Icon name={isOpen ? "arrowRoundDown" : "arrowRoundUp"} />
        </Pressable>
      )}
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
        <SetInputList maxSets={maxSets + 1} setNumber={setNumber} isExpanded={isExpanded} />
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: VERTICAL_PADDING,
  },
});
