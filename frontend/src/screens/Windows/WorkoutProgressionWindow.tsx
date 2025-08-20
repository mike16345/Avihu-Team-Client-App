import GraphsContainer from "@/components/WorkoutProgression/GraphsContainer";
import WorkoutProgressionHeader from "@/components/WorkoutProgression/WorkoutProgressionHeader";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { DropDownContextProvider } from "@/context/useDropdown";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useState } from "react";
import { View } from "react-native";
import ErrorScreen from "../ErrorScreen";
import WorkoutProgressScreenSkeleton from "@/components/ui/loaders/skeletons/WorkoutProgressScreenSkeleton";

const WorkoutProgressionWindow = () => {
  const { layout, spacing } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MUSCLE_GROUPS[0]);

  const { data, isLoading, isError } = useRecordedSetsQuery();

  const exercisesByMuscleGroups = useMemo(() => {
    if (!data) return [];

    return data.reduce((acc, current) => {
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

    return exercisesByMuscleGroups[activeMuscleGroup].map(({ name, recordedSets }) => {
      return { label: name, value: recordedSets };
    });
  }, [exercisesByMuscleGroups, activeMuscleGroup]);

  if (isLoading) return <WorkoutProgressScreenSkeleton />;
  if (isError) return <ErrorScreen />;

  return (
    <View style={[spacing.gapDefault, layout.flex1, spacing.pdMd]}>
      <DropDownContextProvider key={exercises.length} items={exercises} onSelect={() => {}}>
        <View style={{ zIndex: 10 }}>
          <WorkoutProgressionHeader
            activeMuscleGroup={activeMuscleGroup}
            handleMuscleGroupSelect={(val) => setActiveMuscleGroup(val)}
          />
        </View>

        <GraphsContainer />
      </DropDownContextProvider>
    </View>
  );
};

export default WorkoutProgressionWindow;
