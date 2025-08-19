import useStyles from "@/styles/useGlobalStyles";
import { View, Text } from "react-native";

const WorkoutProgressionWindow = () => {
  const { layout } = useStyles();

  return (
    <View style={[layout.center]}>
      <Text>WorkoutProgressionWindow</Text>
    </View>
  );
};

export default WorkoutProgressionWindow;
