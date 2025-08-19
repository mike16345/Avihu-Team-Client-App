import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

const WeightProgressionWindow = () => {
  const { layout } = useStyles();

  return (
    <View style={[layout.center]}>
      <Text>WeightProgressionWindow</Text>
    </View>
  );
};

export default WeightProgressionWindow;
