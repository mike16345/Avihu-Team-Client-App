import GraphsContainer from "@/components/WorkoutProgression/GraphsContainer";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { DropDownContextProvider } from "@/context/useDropdown";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import ErrorScreen from "../ErrorScreen";
import WorkoutProgressScreenSkeleton from "@/components/ui/loaders/skeletons/WorkoutProgressScreenSkeleton";
import { mapToDropDownItems } from "@/utils/utils";
import MuscleGroupSelector from "@/components/WorkoutProgression/MuscleGroupSelector";
import ExerciseSelector from "@/components/WorkoutProgression/ExerciseSelector";

const WorkoutProgressionWindow = () => {
  const { layout, spacing } = useStyles();
  const { data, isLoading, isError } = useRecordedSetsQuery();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MUSCLE_GROUPS[0]);

  const mappedExerciseCache = useRef<Record<string, any>>({});

  const exercisesByMuscleGroups: Record<string, any> = useMemo(() => {
    if (!data) return [];

    return data.reduce<Record<string, any>>((acc, current) => {
      const { muscleGroup, recordedSets } = current;

      const exercisesByNames = Object.entries(recordedSets).map((entry) => {
        return { name: entry[0], recordedSets: entry[1] };
      });

      acc[muscleGroup] = exercisesByNames;

      return acc;
    }, {});
  }, [data]);

  const exercises = useMemo(() => {
    if (!exercisesByMuscleGroups[activeMuscleGroup]) return [];

    if (mappedExerciseCache.current[activeMuscleGroup])
      return mappedExerciseCache.current[activeMuscleGroup];

    const mappedExercises = mapToDropDownItems(exercisesByMuscleGroups[activeMuscleGroup], {
      labelKey: "name",
      valueKey: "recordedSets",
    });

    mappedExerciseCache.current[activeMuscleGroup] = mappedExercises;

    return mappedExercises;
  }, [exercisesByMuscleGroups, activeMuscleGroup]);

  if (isLoading) return <WorkoutProgressScreenSkeleton />;
  if (isError) return <ErrorScreen />;

  return (
    <View style={[spacing.gapDefault, layout.flex1, spacing.pdMd]}>
      <MuscleGroupSelector
        selectedMuscleGroup={activeMuscleGroup}
        onMuscleGroupSelect={(val) => setActiveMuscleGroup(val)}
      />

      <DropDownContextProvider key={exercises.length} items={exercises} onSelect={() => {}}>
        <ExerciseSelector muscleGroup={activeMuscleGroup} />

        <GraphsContainer />
      </DropDownContextProvider>
    </View>
  );
};

export default WorkoutProgressionWindow;
