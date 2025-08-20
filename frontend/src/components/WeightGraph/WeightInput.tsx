import useStyles from "@/styles/useGlobalStyles";
import { useWindowDimensions, View } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Input from "../ui/inputs/Input";

const WeightInput = () => {
  const { layout, spacing } = useStyles();
  const { width } = useWindowDimensions();

  return (
    <View style={[layout.center, spacing.gapMd]}>
      <View style={[spacing.pdHorizontalLg]}>
        <Input
          keyboardType="number-pad"
          style={[{ width: width * 0.75 }]}
          placeholder="רשמו כאן את המשקל היומי"
        />
      </View>
      <View style={[layout.center]}>
        <PrimaryButton style={[{ width: width * 0.5 }]}>שליחה</PrimaryButton>
      </View>
    </View>
  );
};

export default WeightInput;
