import Icon from "@/components/Icon/Icon";
import Collapsible from "@/components/ui/Collapsible";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import Graph from "@/components/ui/graph/Graph";
import { Text } from "@/components/ui/Text";
import WorkoutProgressionHeader from "@/components/WorkoutProgression/WorkoutProgressionHeader";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { DropDownContextProvider } from "@/context/useDropdown";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";

const WorkoutProgressionWindow = () => {
  const { layout, colors, common, fonts, spacing, text } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>(MUSCLE_GROUPS[0]);
  const [showRepsGraph, setShowRepsGraph] = useState(true);
  const [showWeightGraph, setShowWeightGraph] = useState(true);

  const { data, isLoading, error, isError } = useRecordedSetsQuery();

  const exercisesByMuscleGroups = useMemo(() => {
    if (!data) return [];

    return data.reduce((acc, current) => {
      const { muscleGroup, recordedSets } = current;
      const currentMuscleGroupExerciseNames = Object.keys(recordedSets);

      acc[muscleGroup] = currentMuscleGroupExerciseNames;

      return acc;
    }, {});
  }, [data]);

  const exercises = useMemo(() => {
    if (!exercisesByMuscleGroups[activeMuscleGroup]) return [];

    return exercisesByMuscleGroups[activeMuscleGroup].map((exercise) => {
      return { label: exercise, value: exercise };
    });
  }, [exercisesByMuscleGroups, activeMuscleGroup]);

  const handleCollapseChange = (open: boolean) => {
    setShowRepsGraph(!open);
    setShowWeightGraph(open);
  };

  return (
    <View style={[spacing.gapDefault, layout.flex1, spacing.pdMd]}>
      <DropDownContextProvider key={exercises.length} items={exercises} onSelect={() => {}}>
        <View style={{ zIndex: 10 }}>
          <WorkoutProgressionHeader
            activeMuscleGroup={activeMuscleGroup}
            handleMuscleGroupSelect={(val) => setActiveMuscleGroup(val)}
          />
        </View>
      </DropDownContextProvider>

      <ConditionalRender condition={exercises.length === 0}>
        <View style={[layout.center]}>
          <Text>לא הוקלטו סטים</Text>
        </View>
      </ConditionalRender>

      <ConditionalRender condition={exercises.length !== 0}>
        <ScrollView contentContainerStyle={spacing.gapDefault} nestedScrollEnabled>
          <Collapsible
            isCollapsed={showRepsGraph}
            onCollapseChange={() => handleCollapseChange(showRepsGraph)}
            trigger={
              <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Icon name="clock" />
                  <Text>חזרות</Text>
                </View>

                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Text>60.00%</Text>
                  <Icon name="growthIndicator" />
                </View>
              </View>
            }
          >
            <Graph
              data={[12, 320, 3, 67, 3, 456, 4]}
              labels={[
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ]}
            />
          </Collapsible>
          <Collapsible
            isCollapsed={showWeightGraph}
            onCollapseChange={(val) => handleCollapseChange(val)}
            trigger={
              <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Icon name="upload" />
                  <Text>משקל</Text>
                </View>

                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Text>60.00%</Text>
                  <Icon name="growthIndicator" />
                </View>
              </View>
            }
          >
            <Graph
              data={[12, 320, 3, 67, 3, 456, 4]}
              labels={[
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ]}
            />
          </Collapsible>
        </ScrollView>
      </ConditionalRender>
    </View>
  );
};

export default WorkoutProgressionWindow;
