import WorkoutGraph from "@/components/WorkoutProgression/WorkoutGraph";
import { ONE_DAY, RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { extractExercises } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Animated, RefreshControl, ScrollView, View } from "react-native";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import ErrorScreen from "./ErrorScreen";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import WorkoutProgressScreenSkeleton from "@/components/ui/loaders/skeletons/WorkoutProgressScreenSkeleton";
import NoDataScreen from "./NoDataScreen";

const MyWorkoutProgressionScreen = () => {
  const { colors, layout, spacing, text } = useStyles();
  const { getRecordedSetsByUserId } = useRecordedSetsApi();
  const currentUserId = useUserStore((state) => state.currentUser?._id);
  const { isRefreshing, refresh } = usePullDownToRefresh();
  const { slideInRightDelay0, slideInLeftDelay100, slideInRightDelay200, slideInLeftDelay200 } =
    useSlideInAnimations();

  const dropdownAnimations = [slideInRightDelay0, slideInLeftDelay100];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryFn: () => getRecordedSetsByUserId(currentUserId || ``),
    enabled: !!currentUserId,
    queryKey: [RECORDED_SETS_BY_USER_KEY + currentUserId],
    staleTime: ONE_DAY,
    retry: 2,
    onSuccess: (data) => {
      setSelectedMuscleGroup(data[0]?.muscleGroup);
      setSelectedExercise(extractExercises(data[0].recordedSets)[0]);
    },
  });

  const [openMuscleGroupDropdown, setOpenMuscleGroupDropdown] = useState(false);
  const [openExerciseDropdown, setOpenExerciseDropdown] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<ValueType | null>(
    data ? data[0]?.muscleGroup : null
  );
  const [selectedExercise, setSelectedExercise] = useState<ValueType | null>(
    data ? extractExercises(data[0].recordedSets)[0] : null
  );

  const muscleGroupOptions = data?.map(({ muscleGroup }) => ({
    label: muscleGroup,
    value: muscleGroup,
  }));

  const muscleGroupContainsExercise = useMemo(() => {
    return data?.some(
      (item) =>
        item.muscleGroup === selectedMuscleGroup &&
        Object.keys(item.recordedSets).includes(selectedExercise)
    );
  }, [selectedMuscleGroup, data, selectedExercise]);

  const exerciseOptions = useMemo(() => {
    return data
      ?.filter((item) => item.muscleGroup === selectedMuscleGroup) // Filter by muscleGroup
      .flatMap((item) => extractExercises(item.recordedSets))
      .map((item) => ({ label: item, value: item }));
  }, [selectedMuscleGroup, data]);

  const repValues = useMemo(() => {
    return data
      ?.filter((item) => item.muscleGroup === selectedMuscleGroup)
      .flatMap(
        (item) =>
          item.recordedSets[
            muscleGroupContainsExercise ? selectedExercise : Object.keys(item.recordedSets)[0]
          ]
      )
      .flatMap((item) => ({ value: item.repsDone, date: new Date(item.date).toDateString() }));
  }, [data, muscleGroupContainsExercise, selectedExercise]);

  const weightValues = useMemo(() => {
    return data
      ?.filter((item) => item.muscleGroup === selectedMuscleGroup)
      .flatMap(
        (item) =>
          item.recordedSets[
            muscleGroupContainsExercise ? selectedExercise : Object.keys(item.recordedSets)[0]
          ]
      )
      .flatMap((item) => ({ value: item.weight, date: new Date(item.date).toDateString() }));
  }, [data, muscleGroupContainsExercise, selectedExercise]);

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

  if (isLoading) return <WorkoutProgressScreenSkeleton />;

  if (error?.status == 400)
    return (
      <NoDataScreen refreshing={isRefreshing} refreshFunc={refetch} message="לא נמצא תוכן להצגה" />
    );
  if (isError) return <ErrorScreen refetchFunc={refetch} />;

  return (
    <View style={[layout.sizeFull, colors.background, spacing.gapDefault, spacing.pdDefault]}>
      {data && (
        <>
          {dropDownsArr.map(({ placeholder, setOpen, setValue, open, value, items }, i) => (
            <Animated.View style={[dropdownAnimations[i], { zIndex: open ? 1000 : 0 }]}>
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
            </Animated.View>
          ))}
          <ScrollView
            contentContainerStyle={[spacing.gapDefault, spacing.pdBottomBar]}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
            }
          >
            {repValues && repValues[0]?.value && (
              <Animated.View style={slideInRightDelay200}>
                <WorkoutGraph label="חזרות" graphValues={repValues} />
              </Animated.View>
            )}
            {weightValues && weightValues[0]?.value && (
              <Animated.View style={slideInLeftDelay200}>
                <WorkoutGraph label="משקל" graphValues={weightValues} />
              </Animated.View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MyWorkoutProgressionScreen;
