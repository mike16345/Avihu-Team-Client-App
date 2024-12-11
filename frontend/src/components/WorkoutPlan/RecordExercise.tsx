import { FC, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Pressable,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import { createRetryFunction, extractVideoId, generateWheelPickerData } from "@/utils/utils";
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
import { Text } from "../ui/Text";
import Toast from "react-native-toast-message";

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

const RecordExercise: FC<RecordExerciseProps> = ({ route, navigation }) => {
  const repsOptions = useMemo(() => generateWheelPickerData(1, 100), []);
  const { handleRecordSet, exercise, muscleGroup, setNumber } = route!.params;

  const { height, width } = useWindowDimensions();
  const customStyles = useStyles();
  const { colors, fonts, layout, spacing, text, common } = customStyles;
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

  const [openTrainerTips, setOpenTrainerTips] = useState(false);
  const [isSetUploading, setIsSetUploading] = useState(false);

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet({ ...recordedSet, [key]: value });
  };

  const handleSave = async () => {
    try {
      setIsSetUploading(true);
      await handleRecordSet(recordedSet);
    } catch (err: any) {
      Toast.show({
        text1: "אופס, נתקלנו בבעיה",
        text2: err.message,
        autoHide: true,
        type: "error",
        swipeable: true,
        text1Style: { textAlign: `center` },
        text2Style: { textAlign: `center` },
      });
    } finally {
      setIsSetUploading(false);
    }
  };

  const handlePressBack = () => {
    navigation?.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handlePressBack);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handlePressBack);
    };
  }, []);

  if (isLoading) return <Loader variant="Standard" />;

  return (
    <>
      {isSetUploading && <Loader variant="Screen" />}
      <View style={[layout.sizeFull, layout.flex1, spacing.pdBottomBar]}>
        <WorkoutVideoPopup width={width} videoId={extractVideoId(exercise.linkToVideo || "")} />
        <View
          style={[layout.flexGrow, !lastRecordedSet && layout.justifyEvenly, spacing.pdDefault]}
        >
          <View style={[layout.itemsEnd, spacing.gapSm]}>
            <Text style={[styles.setInfo, fonts.lg]}>{exercise.name}</Text>
            <Text style={styles.setInfo}>סט: {setNumber}</Text>
            {exercise.sets[setNumber - 1] && (
              <Text style={styles.setInfo}>
                חזרות: {exercise.sets[setNumber - 1].minReps}
                {exercise.sets[setNumber - 1].maxReps && `-${exercise.sets[setNumber - 1].maxReps}`}
              </Text>
            )}
            {strippedTips && strippedTips.length && (
              <Pressable onPress={() => setOpenTrainerTips(true)}>
                <Text style={[fonts.lg, colors.textPrimary, text.textUnderline, text.textBold]}>
                  דגשים
                </Text>
              </Pressable>
            )}
            <WorkoutTips
              tips={[exercise.tipFromTrainer!]}
              openTips={openTrainerTips}
              setOpenTips={setOpenTrainerTips}
            />
          </View>

          <View style={[layout.flexRow, layout.justifyEvenly]}>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                חזרות
              </Text>

              <View
                style={[
                  { borderTopWidth: 2, borderBottomWidth: 2 },
                  colors.borderSecondary,
                  spacing.pdHorizontalDefault,
                  spacing.pdVerticalMd,
                  common.rounded,
                ]}
              >
                <WheelPicker
                  activeItemColor={colors.textOnSurface.color}
                  inactiveItemColor={colors.textOnSurfaceDisabled.color}
                  data={repsOptions}
                  onValueChange={(val) => handleUpdateRecordedSet("repsDone", val)}
                  selectedValue={recordedSet.repsDone}
                  height={height * 0.08}
                  itemHeight={35}
                />
              </View>
            </View>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default, styles.inputLabel]}>
                משקל
              </Text>

              <View
                style={[
                  { borderTopWidth: 2, borderBottomWidth: 2 },
                  colors.borderSecondary,
                  spacing.pdHorizontalDefault,
                  spacing.pdVerticalMd,
                  common.rounded,
                ]}
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
                  height={height * 0.08}
                  itemHeight={35}
                  selectedWeight={recordedSet.weight}
                />
              </View>
            </View>
          </View>
          {lastRecordedSet && (
            <TouchableOpacity
              onPress={() => {
                navigation?.navigate("RecordedSets", {
                  recordedSets: data || [],
                });
              }}
              style={[spacing.mgVerticalDefault, spacing.gapSm]}
            >
              <Text style={[text.textRight, text.textBold, colors.textOnSecondaryContainer]}>
                אימון קודם - {new Date(lastRecordedSet.date).toLocaleDateString()}
              </Text>
              <RecordedSetInfo
                actionButton={
                  <NativeIcon
                    color={colors.textOnSecondaryContainer.color}
                    library="MaterialCommunityIcons"
                    name="chevron-left"
                    size={28}
                  />
                }
                recordedSet={lastRecordedSet}
              />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            layout.flexDirectionByPlatform,
            layout.center,
            layout.widthFull,
            spacing.gapLg,
            spacing.pdHorizontalDefault,
          ]}
        >
          <Button
            mode="contained-tonal"
            onPress={() => navigation?.goBack()}
            style={[common.rounded, { width: `48%` }]}
          >
            בטל
          </Button>
          <Button mode="contained" onPress={handleSave} style={[common.rounded, { width: `48%` }]}>
            <Text style={[customStyles.text.textBold, colors.textOnBackground]}>שמור</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default RecordExercise;

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
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
});
