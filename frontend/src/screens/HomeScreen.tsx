import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Windows from "./Windows/Windows";
import WorkoutProgressionWindow from "./Windows/WorkoutProgressionWindow";
import WeightProgressionWindow from "./Windows/WeightProgressionWindow";
import MeasurementsWindow from "./Windows/MeasurementsWindow";
import TopBar from "@/navigators/TopBar";
import { RouteProp, useRoute } from "@react-navigation/native";
import { BottomStackParamList } from "@/types/navigatorTypes";
import { useEffect, useState } from "react";

const windows = [
  <WorkoutProgressionWindow key={"workout-window"} />,
  <WeightProgressionWindow key={"weight-progression-window"} />,
  <MeasurementsWindow key={"measurement-window"} />,
];

const HomeScreen = () => {
  const { layout } = useStyles();
  const route = useRoute<RouteProp<BottomStackParamList, "Home">>();
  const { window, paramId } = route.params || {};

  const [activeIndex, setActiveIndex] = useState(window || 1);

  useEffect(() => {
    if (!window || window == activeIndex) return;

    setActiveIndex(window);
  }, [paramId]);

  return (
    <View style={[layout.flex1]}>
      <TopBar />

      <Windows
        currentIndex={activeIndex}
        onIndexChange={(idx) => setActiveIndex(idx)}
        windowItems={windows}
      />
    </View>
  );
};

export default HomeScreen;
