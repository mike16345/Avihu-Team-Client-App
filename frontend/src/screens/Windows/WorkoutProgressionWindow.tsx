import GraphsContainer from "@/components/WorkoutProgression/GraphsContainer";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { DropDownContextProvider } from "@/context/useDropdown";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import ErrorScreen from "../ErrorScreen";
import WorkoutProgressScreenSkeleton from "@/components/ui/loaders/skeletons/WorkoutProgressScreenSkeleton";
import { mapToDropDownItems } from "@/utils/utils";
import MuscleGroupSelector from "@/components/WorkoutProgression/MuscleGroupSelector";
import ExerciseSelector from "@/components/WorkoutProgression/ExerciseSelector";

const WorkoutProgressionWindow = () => {
  const { layout, spacing } = useStyles();
  const { data, isLoading, isError, isRefetching, refetch } = useRecordedSetsQuery();

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
  if (isError) return <ErrorScreen />;

  return (
    <View style={[layout.flex1, spacing.gapSm, spacing.pdMd]}>
      <MuscleGroupSelector
        selectedMuscleGroup={activeMuscleGroup}
        onMuscleGroupSelect={(val) => setActiveMuscleGroup(val)}
      />

      <DropDownContextProvider
        key={activeExercises.length}
        items={activeExercises}
        onSelect={() => {}}
      >
        <ScrollView
          nestedScrollEnabled
          style={[layout.flex1]}
          contentContainerStyle={[spacing.gapSm]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <ExerciseSelector muscleGroup={activeMuscleGroup} />
          <GraphsContainer />
        </ScrollView>
      </DropDownContextProvider>
    </View>
  );
};

export default WorkoutProgressionWindow;
