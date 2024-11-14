import { FC, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, useWindowDimensions, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import { IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import useStyles from "@/styles/useGlobalStyles";
import { Button, Text, TextInput } from "react-native-paper";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import { createRetryFunction, extractVideoId, generateWheelPickerData } from "@/utils/utils";
import WheelInputDrawer from "../ui/WheelInputDrawer";
import WeightWheelPicker from "../WeightGraph/WeightWheelPicker";
import WheelPicker from "../ui/WheelPicker";
import WorkoutTips from "./WorkoutTips";
import NativeIcon from "../Icon/NativeIcon";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import Loader from "../ui/loaders/Loader";
import RecordedSetInfo from "./RecordedSetInfo";
import { ONE_DAY } from "@/constants/reactQuery";

type InputTypes = "reps" | "weight";
interface RecordExerciseProps extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordSet"> {}

const findLatestRecordedSetByNumber = (
  recordedSets: IRecordedSetResponse[],
  setNumber: number
): IRecordedSetResponse | null => {
  if (!recordedSets.length) return null;

  const matchingSets = recordedSets.filter((set) => set.setNumber === setNumber);

  if (!matchingSets.length) return null;

  const latestSet = matchingSets.reduce((latest, current) =>
    new Date(latest.date) > new Date(current.date) ? latest : current
  );

  return latestSet;
};

const RecordExerciseNew: FC<RecordExerciseProps> = ({ route, navigation }) => {
  const repsOptions = useMemo(() => generateWheelPickerData(1, 100), []);
  const { handleRecordSet, exercise, muscleGroup, setNumber } = route!.params;

  const { height, width } = useWindowDimensions();
  const customStyles = useStyles();
  const { colors, fonts, layout, spacing, text } = customStyles;

  const currentUser = useUserStore((state) => state.currentUser);
  const { getUserRecordedSetsByExercise } = useRecordedSetsApi();

  const { data, isLoading } = useQuery(
    ["recordedSets", exercise],
    () =>
      getUserRecordedSetsByExercise(exercise.name, muscleGroup, currentUser?._id || "").then(
        (res) => res.data
      ),

    { enabled: !!exercise, retry: createRetryFunction(404), staleTime: ONE_DAY }
  );

  const lastRecordedSet = findLatestRecordedSetByNumber(data || [], setNumber);
  const strippedTips = exercise.tipFromTrainer?.replace(" ", "");

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>({
    weight: 0,
    repsDone: 0,
    note: "",
  });

  const [showWeightInputModal, setShowWeightInputModal] = useState(false);
  const [showRepsInputDrawer, setShowRepsInputDrawer] = useState(false);
  const [openTrainerTips, setOpenTrainerTips] = useState(false);

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet({ ...recordedSet, [key]: value });
  };

  const handleSave = () => {
    handleRecordSet(recordedSet);
  };

  const handleOpenInputModal = (input: InputTypes) => {
    if (input === "reps") {
      setShowRepsInputDrawer(true);
    } else {
      setShowWeightInputModal(true);
    }
  };

  useEffect(() => {
    navigation?.setOptions({ title: exercise.name });
  }, [navigation]);

  if (isLoading) return <Loader variant="Standard" />;

  return (
    <View style={[layout.sizeFull]}>
      <WorkoutVideoPopup width={width} videoId={extractVideoId(exercise.linkToVideo || "")} />
      <ScrollView
        contentContainerStyle={[
          layout.flexGrow,
          !lastRecordedSet && spacing.gapXxl,
          spacing.pdDefault,
        ]}
      >
        <View style={[layout.itemsEnd, spacing.gapSm]}>
          {strippedTips && strippedTips.length && (
            <Pressable onPress={() => setOpenTrainerTips(true)}>
              <Text style={[fonts.lg, colors.textPrimary, text.textUnderline, text.textBold]}>
                דגשים
              </Text>
            </Pressable>
          )}
          <Text style={styles.setInfo}>סט: {setNumber}</Text>
          {exercise.sets[setNumber - 1] && (
            <Text style={styles.setInfo}>
              חזרות: {exercise.sets[setNumber - 1].minReps}-{exercise.sets[setNumber - 1].maxReps}
            </Text>
          )}
          <WorkoutTips
            tips={[exercise.tipFromTrainer!]}
            openTips={openTrainerTips}
            setOpenTips={setOpenTrainerTips}
          />
        </View>
        <View style={[spacing.gapXxl]}>
          <View style={[layout.flexRow, layout.justifyAround]}>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                משקל
              </Text>
              <Button
                onPress={() => handleOpenInputModal("weight")}
                style={[{ borderRadius: 6 }]}
                mode="outlined"
              >
                {recordedSet.weight}
              </Button>
            </View>

            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                חזרות
              </Text>
              <Button
                mode="outlined"
                onPress={() => handleOpenInputModal("reps")}
                style={[{ borderRadius: 6 }]}
              >
                {recordedSet.repsDone}
              </Button>
            </View>
          </View>

          <TextInput
            mode="outlined"
            style={[layout.ltr, { height: 85 }, colors.background, customStyles.text.textRight]}
            multiline
            placeholderTextColor={"white"}
            placeholder="איך עבר לך?"
            textAlign="right"
            textAlignVertical="top"
            onChangeText={(text) => handleUpdateRecordedSet("note", text)}
          />
        </View>

        {lastRecordedSet && (
          <View style={[spacing.mgVerticalDefault, spacing.gapSm]}>
            <Text style={[text.textRight, text.textBold]}>
              אימון הקודם - {new Date(lastRecordedSet.date).toLocaleDateString()}
            </Text>
            <RecordedSetInfo
              actionButton={
                <NativeIcon
                  onPress={() => {
                    navigation?.navigate("RecordedSets", {
                      recordedSets: data || [],
                    });
                  }}
                  color={colors.textOnSecondaryContainer.color}
                  library="MaterialCommunityIcons"
                  name="chevron-left"
                  size={28}
                />
              }
              recordedSet={lastRecordedSet}
            />
          </View>
        )}

        <View style={[layout.flexRow, layout.widthFull, spacing.gapLg]}>
          <Button mode="contained" onPress={handleSave}>
            <Text style={[customStyles.text.textBold]}>שמור</Text>
          </Button>
          <Button mode="contained-tonal" onPress={() => navigation?.goBack()}>
            בטל
          </Button>
        </View>
      </ScrollView>
      {showWeightInputModal && (
        <WheelInputDrawer
          title="משקל"
          currentValue={recordedSet.weight}
          onDismiss={() => setShowWeightInputModal(false)}
          onSave={(val) => {
            handleUpdateRecordedSet("weight", val);
            setShowWeightInputModal(false);
          }}
        >
          <WeightWheelPicker
            onValueChange={(val) => {
              handleUpdateRecordedSet("weight", val);
            }}
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            minWeight={1}
            decimalStepSize={2.5}
            showZeroDecimal={false}
            decimalRange={10}
            maxWeight={200}
            stepSize={1}
            height={height / 3.8}
            itemHeight={40}
            selectedWeight={recordedSet.weight}
          />
        </WheelInputDrawer>
      )}
      {showRepsInputDrawer && (
        <WheelInputDrawer
          title="חזרות"
          currentValue={recordedSet.repsDone}
          onDismiss={() => setShowRepsInputDrawer(false)}
          onSave={(val) => {
            handleUpdateRecordedSet("repsDone", val);
            setShowRepsInputDrawer(false);
          }}
        >
          <WheelPicker
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            data={repsOptions}
            onValueChange={(val) => handleUpdateRecordedSet("repsDone", val)}
            selectedValue={recordedSet.repsDone}
            height={height / 3.8}
            itemHeight={40}
          />
        </WheelInputDrawer>
      )}
    </View>
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
  setInfo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
