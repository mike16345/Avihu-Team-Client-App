import { View } from "react-native";
import MuscleGroupSelector from "./MuscleGroupSelector";
import ExerciseSelector from "./ExerciseSelector";

interface WorkoutProgressionHeaderProps {
  handleMuscleGroupSelect: (muscle: string) => void;
  activeMuscleGroup: string;
}

const WorkoutProgressionHeader: React.FC<WorkoutProgressionHeaderProps> = ({
  handleMuscleGroupSelect,
  activeMuscleGroup,
}) => {
  return (
    <View>
      <MuscleGroupSelector
        selectedMuscleGroup={activeMuscleGroup}
        onMuscleGroupSelect={handleMuscleGroupSelect}
      />

      <ExerciseSelector muscleGroup={activeMuscleGroup} />
    </View>
  );
};

export default WorkoutProgressionHeader;
