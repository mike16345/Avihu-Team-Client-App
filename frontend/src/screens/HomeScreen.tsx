import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Windows from "./Windows/Windows";
import WorkoutProgressionWindow from "./Windows/WorkoutProgressionWindow";
import WeightProgressionWindow from "./Windows/WeightProgressionWindow";
import MeasurementsWindow from "./Windows/MeasurementsWindow";

const windows = [
  <WorkoutProgressionWindow key={"workout-window"} />,
  <WeightProgressionWindow key={"weight-progression-window"} />,
  <MeasurementsWindow key={"measurement-window"} />,
];

const HomeScreen = () => {
  const { layout } = useStyles();

  return (
    <View style={[layout.flex1]}>
      <Windows windowItems={windows} />
    </View>
  );
};

export default HomeScreen;
