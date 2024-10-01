import { FC, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import OpacityButton from "@/components/Button/OpacityButton";
import Divider from "../ui/Divider";
import { IRecordedSet } from "@/interfaces/Workout";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import useStyles from "@/styles/useGlobalStyles";
import { Button, TextInput } from "react-native-paper";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import { extractVideoId } from "@/utils/utils";

interface RecordExerciseProps extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordSet"> {}

const RecordExerciseNew: FC<RecordExerciseProps> = ({ route, navigation }) => {
  const { handleRecordSet, exercise, setNumber } = route!.params;
  const customStyles = useStyles();
  const { colors, fonts, layout, spacing } = customStyles;

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>({
    weight: 0,
    repsDone: 0,
    note: "",
  });

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet({ ...recordedSet, [key]: value });
  };

  const handleSave = () => {
    handleRecordSet(recordedSet);
  };

  return (
    <ScrollView contentContainerStyle={[spacing.pdDefault, layout.justifyEvenly, layout.sizeFull]}>
      <Text
        style={[
          colors.textOnSecondaryContainer,
          spacing.pdDefault,
          customStyles.fonts.default,
          customStyles.text.textBold,
        ]}
      >{`${exercise.name} סט ${setNumber}`}</Text>
      <Divider thickness={0.5} style={{ marginBottom: 20 }} />
      <View style={[layout.widthFull, layout.center]}>
        <WorkoutVideoPopup
          title={exercise.name}
          videoId={extractVideoId(exercise.linkToVideo || "")}
        />
      </View>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={[spacing.gapXl]}>
          <View style={[layout.flexRow, layout.justifyAround]}>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                משקל
              </Text>
              <Button style={[{ borderRadius: 4 }]} mode="outlined">
                10
              </Button>
            </View>

            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                חזרות
              </Text>
              <Button mode="outlined" style={[{ borderRadius: 4 }]}>
                20
              </Button>
            </View>
          </View>

          <Text style={[colors.textOnSecondaryContainer, fonts.default]}>פתק:</Text>
          <TextInput
            mode="outlined"
            style={[layout.ltr, { height: 60 }, colors.background, customStyles.text.textRight]}
            multiline
            placeholderTextColor={"white"}
            placeholder="איך עבר לך?"
            textAlign="right"
            textAlignVertical="top"
            onChangeText={(text) => handleUpdateRecordedSet("note", text)}
          />
        </View>
        <View style={[layout.flexRow, layout.widthFull, spacing.gapLg]}>
          <Button mode="contained" onPress={handleSave}>
            שמור
          </Button>
          <Button mode="contained-tonal" onPress={() => navigation?.goBack()}>
            בטל
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default RecordExerciseNew;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  inputLabel: {},
  inputContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
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
  errorText: {
    color: "red",
    fontSize: 12,
    textAlign: "right",
  },
  textInput: {
    textAlign: "right",
  },
});
