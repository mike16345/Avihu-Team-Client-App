import GraphsContainer from "@/components/WorkoutProgression/GraphsContainer";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { DropDownContextProvider } from "@/context/useDropdown";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import ErrorScreen from "../ErrorScreen";
import WorkoutProgressScreenSkeleton from "@/components/ui/loaders/skeletons/WorkoutProgressScreenSkeleton";
import { mapToDropDownItems } from "@/utils/utils";
import ExerciseSelector from "@/components/WorkoutProgression/ExerciseSelector";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";

const WorkoutProgressionWindow = () => {
  const { layout, spacing } = useStyles();
  const { data, isLoading, isError, error, isRefetching, refetch } = useRecordedSetsQuery();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MUSCLE_GROUPS[0]);

  const exercisesByMuscleGroups: Record<string, any> = useMemo(() => {
    if (!data) return [];

    return data.reduce<Record<string, any>>((acc, current) => {
      const { muscleGroup, recordedSets } = current;

      const mappedExercises = mapToDropDownItems(
        Object.entries(recordedSets).map(([name, recordedSets]) => ({
          name,
          recordedSets,
        })),
        { labelKey: "name", valueKey: "recordedSets" }
      );

      acc[muscleGroup] = mappedExercises;

      return acc;
    }, {});
  }, [data]);

  const activeExercises = exercisesByMuscleGroups[activeMuscleGroup] || [];

  if (isLoading) return <WorkoutProgressScreenSkeleton />;
  if (isError && error.status !== 404) return <ErrorScreen />;

  return (
    <View style={[layout.flex1]}>
      <View style={{ paddingStart: 16 }}>
        <HorizontalSelector
          items={MUSCLE_GROUPS}
          onSelect={(selected) => setActiveMuscleGroup(selected)}
          selected={activeMuscleGroup}
        />
      </View>

      <DropDownContextProvider
        key={activeExercises.length}
        items={activeExercises}
        onSelect={() => {}}
      >
        <CustomScrollView
          nestedScrollEnabled
          style={[layout.flex1]}
          contentContainerStyle={[spacing.gap14, { paddingTop: 16 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          showsVerticalScrollIndicator={false}
        >
          <ExerciseSelector muscleGroup={activeMuscleGroup} />
          <GraphsContainer />
        </CustomScrollView>
      </DropDownContextProvider>
    </View>
  );
};

export default WorkoutProgressionWindow;
