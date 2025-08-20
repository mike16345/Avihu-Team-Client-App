import useStyles from "@/styles/useGlobalStyles";
import { ScrollView } from "react-native-gesture-handler";
import Progression from "@/components/WeightProgression/Progression";
import WeightInput from "@/components/WeightGraph/WeightInput";
import WeightCardsContainer from "@/components/WeightGraph/WeightCardsContainer";

const WeightProgressionWindow = () => {
  const { spacing } = useStyles();

  return (
    <ScrollView
      contentContainerStyle={[spacing.gapMd, { paddingHorizontal: 16, paddingVertical: 20 }]}
    >
      <WeightCardsContainer />
      <Progression />
      <WeightInput />
    </ScrollView>
  );
};

export default WeightProgressionWindow;
