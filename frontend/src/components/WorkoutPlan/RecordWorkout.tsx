import React, { FC, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Dialog, Divider } from "react-native-elements";
import { Colors } from "@/constants/Colors";
import OpacityButton from "@/components/Button/OpacityButton";

interface RecordWorkoutProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  workoutName: string;
  setNumber: number;
}

const RecordWorkout: FC<RecordWorkoutProps> = ({ isOpen, setIsOpen, workoutName, setNumber }) => {
  const { width, height } = useWindowDimensions();
  // TODO: Make RecordedSet object instead
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<{ weight: string; reps: string }>({ weight: "", reps: "" });

  const validateInput = (value: string, type: "weight" | "reps") => {
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
    const weightError = validateInput(weight, "weight");
    const repsError = validateInput(reps, "reps");

    if (weightError || repsError) {
      setErrors({ weight: weightError, reps: repsError });
      return;
    }

    console.log("Workout saved", { weight, reps, notes });

    setIsOpen(false);
  };

  return (
    <Dialog
      animationType="slide"
      overlayStyle={{
        backgroundColor: Colors.bgSecondary,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        width: width - 40,
        height: height / 1.3,
        padding: 20,
        alignItems: "center",
      }}
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      onRequestClose={() => setIsOpen(false)}
    >
      <Dialog.Title titleStyle={styles.title} title={`${workoutName} סט ${setNumber}`} />
      <Divider width={1.5} style={{ marginBottom: 20 }} />
      <View style={styles.container}>
        <KeyboardAvoidingView className="gap-8">
          <View className=" gap-2 h-16 px-2   justify-center">
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>משקל:</Text>
              <TextInput
                className="inpt w-24 h-10"
                keyboardType="number-pad"
                value={weight}
                onChangeText={(text) => setWeight(text)}
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
                value={reps}
                onChangeText={(text) => setReps(text)}
              />
            </View>
            {errors.reps ? <Text style={styles.errorText}>{errors.reps}</Text> : null}
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.inputLabel}>פטק:</Text>
            <TextInput
              className="inpt "
              style={[styles.multilineInput, { width: width - 80 }]}
              keyboardType="ascii-capable"
              multiline
              placeholder="איך עבר לך?"
              textAlignVertical="top"
              value={notes}
              onChangeText={(text) => setNotes(text)}
            />
          </View>
        </KeyboardAvoidingView>
        <OpacityButton
          onPress={handleSave}
          textProps={{ style: styles.saveText }}
          style={styles.saveBtn}
        >
          שמור
        </OpacityButton>
      </View>
    </Dialog>
  );
};

export default RecordWorkout;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 16,
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
    fontSize: 20,
    padding: 8,
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
