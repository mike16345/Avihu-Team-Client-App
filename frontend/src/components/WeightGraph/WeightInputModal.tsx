import { useWindowDimensions, View } from "react-native";
import { FC, useState } from "react";
import { CustomModal } from "../ui/Modal";
import { Button, Text } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { useThemeContext } from "@/themes/useAppTheme";
import WeightWheelPicker from "./WeightWheelPicker";

interface WeightInputModalProps {
  currentWeight: number;
  handleSaveWeight: (weight: number) => void;
  handleDismiss: () => void;
}

const WeightInputModal: FC<WeightInputModalProps> = ({
  currentWeight,
  handleSaveWeight,
  handleDismiss,
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useThemeContext();
  const [weight, setWeight] = useState(currentWeight);
  const { text, spacing, fonts, colors, layout, common } = useStyles();

  const handleUpdateWeight = (value: number) => {
    setWeight(value);
  };

  const handleClickSave = () => {
    handleSaveWeight(weight);
  };

  return (
    <CustomModal
      dismissable
      dismissableBackButton
      contentContainerStyle={{
        borderRadius: theme.roundness,
        marginHorizontal: "auto",
        width: width - 40,
        height: height / 1.5,
        ...colors.backgroundSurface,
      }}
      visible={true}
      onDismiss={handleDismiss}
    >
      <View style={[layout.container, spacing.gapXxl]}>
        <View style={[layout.flexRow, layout.justifyBetween]}>
          <Text
            style={[
              text.textBold,
              fonts.xl,
              spacing.pdHorizontalDefault,
              common.rounded,
              spacing.pdVerticalSm,
              { borderWidth: 2 },
            ]}
          >
            {weight}
          </Text>
          <Text style={[text.textRight, fonts.xl, text.textBold, colors.textOnSurfaceVariant]}>
            הוסף משקל
          </Text>
        </View>
        <View style={[layout.center, { maxHeight: height / 2.5 }]}>
          <WeightWheelPicker
            onValueChange={(weight) => handleUpdateWeight(weight)}
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            minWeight={40}
            maxWeight={currentWeight + 100}
            stepSize={1}
            height={height / 2.5}
            itemHeight={40}
            selectedWeight={weight}
          />
          <Button mode="contained" onPress={handleClickSave}>
            <Text style={[text.textBold, fonts.lg]}>שמור</Text>
          </Button>
        </View>
      </View>
    </CustomModal>
  );
};

export default WeightInputModal;
