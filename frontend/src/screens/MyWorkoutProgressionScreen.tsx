import Loader from "@/components/ui/loaders/Loader";
import WorkoutGraph from "@/components/WorkoutProgression/WorkoutGraph";
import { ONE_DAY, RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { extractExercises } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import ErrorScreen from "./ErrorScreen";

const MyWorkoutProgressionScreen = () => {
  const { colors, layout, spacing, text } = useStyles();
  const { getRecordedSetsByUserId } = useRecordedSetsApi();
  const currentUserId = useUserStore((state) => state.currentUser?._id);
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryFn: () => getRecordedSetsByUserId(currentUserId || ``),
    enabled: !!currentUserId,
    queryKey: [RECORDED_SETS_BY_USER_KEY + currentUserId],
    staleTime: ONE_DAY,
  });

  const [openMuscleGroupDropdown, setOpenMuscleGroupDropdown] = useState(false);
  const [openExerciseDropdown, setOpenExerciseDropdown] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ValueType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ValueType | null>(null);

  const muscleGroupOptions = data?.map(({ muscleGroup }) => ({
    label: muscleGroup,
    value: muscleGroup,
  }));

  const muscleGroupContainsExercise = data?.some(
    (item) =>
      item.muscleGroup === selectedMuscleGroup &&
      Object.keys(item.recordedSets).includes(selectedExercise)
  );

  const exerciseOptions = data
    ?.filter((item) => item.muscleGroup === selectedMuscleGroup) // Filter by muscleGroup
    .flatMap((item) => extractExercises(item.recordedSets))
    .map((item) => ({ label: item, value: item }));

  const repValues = data
    ?.filter((item) => item.muscleGroup === selectedMuscleGroup)
    .flatMap(
      (item) =>
        item.recordedSets[
          muscleGroupContainsExercise ? selectedExercise : Object.keys(item.recordedSets)[0]
        ]
    )
    .flatMap((item) => ({ value: item.repsDone, date: new Date(item.date).toDateString() }));

  const weightValues = data
    ?.filter((item) => item.muscleGroup === selectedMuscleGroup)
    .flatMap(
      (item) =>
        item.recordedSets[
          muscleGroupContainsExercise ? selectedExercise : Object.keys(item.recordedSets)[0]
        ]
    )
    .flatMap((item) => ({ value: item.weight, date: new Date(item.date).toDateString() }));

  const dropDownsArr = [
    {
      value: selectedMuscleGroup,
      setValue: setSelectedMuscleGroup,
      open: openMuscleGroupDropdown,
      setOpen: setOpenMuscleGroupDropdown,
      placeholder: `בחר קבוצת שריר`,
      items: muscleGroupOptions,
    },
    {
      value: selectedExercise,
      setValue: setSelectedExercise,
      open: openExerciseDropdown,
      setOpen: setOpenExerciseDropdown,
      placeholder: `בחר תרגיל`,
      items: exerciseOptions,
    },
  ];

  useEffect(() => {
    if (!data) return;

    setSelectedMuscleGroup(data[0]?.muscleGroup);
    setSelectedExercise(extractExercises(data[0].recordedSets)[0]);
  }, [data]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorScreen />;

  return (
    <View style={[layout.sizeFull, colors.background, spacing.gapDefault, spacing.pdDefault]}>
      {data && (
        <>
          {dropDownsArr.map(({ placeholder, setOpen, setValue, open, value, items }, i) => (
            <DropDownPicker
              key={i}
              items={items || []}
              value={value || ``}
              setValue={setValue}
              style={[colors.backgroundSecondaryContainer]}
              listItemContainerStyle={[colors.backgroundSecondaryContainer]}
              placeholder={placeholder}
              placeholderStyle={text.textRight}
              theme="DARK"
              rtl
              open={open}
              setOpen={setOpen}
              labelStyle={text.textRight}
              listItemLabelStyle={[text.textRight]}
              containerStyle={{ zIndex: open ? 1000 : 0 }}
            />
          ))}
          <ScrollView
            contentContainerStyle={[spacing.gapDefault, spacing.pdBottomBar]}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
            }
          >
            {repValues && repValues[0]?.value && (
              <WorkoutGraph label="חזרות" graphValues={repValues} />
            )}
            {weightValues && weightValues[0]?.value && (
              <WorkoutGraph label="משקל" graphValues={weightValues} />
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MyWorkoutProgressionScreen;
