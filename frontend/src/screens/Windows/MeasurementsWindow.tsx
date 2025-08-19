import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

const MeasurementsWindow = () => {
  const { layout } = useStyles();

  return (
    <View style={[layout.center]}>
      <Text>MeasurementsWindow</Text>
    </View>
  );
};

export default MeasurementsWindow;
