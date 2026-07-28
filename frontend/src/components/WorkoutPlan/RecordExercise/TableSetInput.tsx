import { StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { FC, useCallback } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { IExercise } from "@/interfaces/Workout";
import SetInputTable from "./SetInputTable";
import type { SetInput } from "./SetInputContainer";

const HORIZONTAL_PADDING = 16;
const VERTICAL_PADDING = 16;

interface TableSetInputProps {
  maxSets: number;
  exercise: IExercise;
  handleRecordSets: (sets: SetInput[]) => Promise<string | undefined>;
  handleUpdateSet: (setId: string, set: SetInput) => Promise<unknown>;
  handleDeleteSet: (setId: string) => Promise<boolean>;
}

const TableSetInput: FC<TableSetInputProps> = ({
  handleRecordSets,
  handleUpdateSet,
  handleDeleteSet,
  maxSets,
  exercise,
}) => {
  const { layout, colors, common } = useStyles();

  const handleSaveSet = useCallback(
    (set: SetInput) => handleRecordSets([set]),
    [handleRecordSets]
  );

  return (
    <KeyboardAwareScrollView
      style={[layout.flex1, common.roundedMd, colors.backgroundSurface]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={VERTICAL_PADDING}
    >
      <SetInputTable
        exercise={exercise}
        maxSets={maxSets}
        onSaveSet={handleSaveSet}
        onUpdateSet={handleUpdateSet}
        onDeleteSet={handleDeleteSet}
      />
    </KeyboardAwareScrollView>
  );
};

export default TableSetInput;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: VERTICAL_PADDING,
    paddingBottom: VERTICAL_PADDING,
  },
});
