import React, { FC, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import OpacityButton from "@/components/Button/OpacityButton";
import Divider from "../ui/Divider";
import { CustomModal } from "../ui/Modal";
import { IRecordedSet } from "@/interfaces/Workout";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";

interface RecordExerciseProps extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordSet"> {
  handleRecordSet: (recordSet: Omit<IRecordedSet, "plan">) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exerciseName: string;
  setNumber: number;
}

const RecordExercise: FC<RecordExerciseProps> = ({
  isOpen,
  setIsOpen,
  handleRecordSet,
  exerciseName,
  setNumber,
}) => {
  const { width } = useWindowDimensions();

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>({
    weight: 0,
    repsDone: 0,
    note: "",
  });
  const [errors, setErrors] = useState<{ weight: string; reps: string }>({ weight: "", reps: "" });

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet({ ...recordedSet, [key]: value });
  };

  const validateInput = (value: string) => {
    if (!value) {
      return "This field is required";
    }
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue <= 0) {
      return "Value must be greater than 0";
    }
    if (!/^\d+(\.\d{1,1})?$/.test(value)) {
      return "Only one decimal place allowed";
    }
    return "";
  };

  const handleSave = () => {
    const weightError = validateInput(recordedSet.weight.toString());
    const repsError = validateInput(recordedSet.repsDone.toString());

    if (weightError || repsError) {
      setErrors({ weight: weightError, reps: repsError });
      return;
    }

    handleRecordSet(recordedSet);
    setIsOpen(false);
  };

  return (
    <CustomModal
      contentContainerStyle={{
        backgroundColor: Colors.bgSecondary,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        padding: 20,
        alignItems: "center",
      }}
      visible={isOpen}
      dismissableBackButton
      onDismiss={() => setIsOpen(false)}
    >
      <Text style={styles.title}>{`${exerciseName} סט ${setNumber}`}</Text>
      <Divider thickness={0.5} style={{ marginBottom: 20 }} />
      <View style={styles.container}>
        <KeyboardAvoidingView className="gap-8">
          <View className=" gap-2 h-16 px-2   justify-center">
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>משקל:</Text>
              <TextInput
                placeholder="משקל..."
                className="inpt w-24 h-10"
                keyboardType="number-pad"
                inputMode="numeric"
                value={recordedSet.weight.toString()}
                onChangeText={(text) => handleUpdateRecordedSet("weight", text)}
              />
            </View>
            {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
          </View>
          <View className=" gap-2 h-16 px-2   justify-center">
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>חזרות:</Text>
              <TextInput
                className="inpt w-24 h-10"
                keyboardType="number-pad"
                onChangeText={(text) => handleUpdateRecordedSet("repsDone", text)}
              />
            </View>
            {errors.reps ? <Text style={styles.errorText}>{errors.reps}</Text> : null}
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.inputLabel}>פתק:</Text>
            <TextInput
              className="inpt "
              style={[styles.multilineInput, { width: width - 80 }]}
              multiline
              placeholderTextColor={"gray"}
              placeholder="איך עבר לך?"
              textAlignVertical="top"
              onChangeText={(text) => handleUpdateRecordedSet("note", text)}
            />
          </View>
        </KeyboardAvoidingView>
        <View style={[]}>
          <OpacityButton
            onPress={handleSave}
            textProps={{ style: styles.saveText }}
            style={styles.saveBtn}
          >
            שמור
          </OpacityButton>
        </View>
      </View>
    </CustomModal>
  );
};

export default RecordExercise;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 16,
    textAlign: "right",
    color: Colors.primary,
    fontWeight: "bold",
    backgroundColor: Colors.bgSecondary,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.bgSecondary,
  },
  notesContainer: {
    width: "100%",
    gap: 12,
  },
  title: {
    fontSize: 17,
    padding: 8,
    textAlign: "right",
    fontWeight: "bold",
    color: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.bgPrimary,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 4,
  },
  saveText: {
    color: Colors.bgSecondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  multilineInput: {
    width: "100%",
    height: 120,
    textAlign: "right",
    backgroundColor: Colors.light,
    textAlignVertical: "top",
    padding: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "right",
  },
  textInput: {
    textAlign: "right",
  },
});
