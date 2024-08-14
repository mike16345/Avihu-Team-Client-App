import { StyleSheet, useWindowDimensions, View } from "react-native";
import { FC, useState } from "react";
import { CustomModal } from "../ui/Modal";
import { Button, Text } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { useThemeContext } from "@/themes/useAppTheme";
import WeightWheelPicker from "./WeightWheelPicker";
import NativeIcon from "../Icon/NativeIcon";
import OpacityButton from "../Button/OpacityButton";

interface WeightInputModalProps {
  currentWeight: number;
  handleSaveWeight: (weight: number) => void;
  handleDeleteWeighIn?: () => void;
  handleDismiss: () => void;
}

const WeightInputModal: FC<WeightInputModalProps> = ({
  currentWeight,
  handleSaveWeight,
  handleDeleteWeighIn,
  handleDismiss,
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useThemeContext();
  const [weight, setWeight] = useState(currentWeight);
  const { text, spacing, fonts, colors, layout } = useStyles();

  const handleUpdateWeight = (value: number) => {
    setWeight(value);
  };

  const handleClickSave = () => {
    handleSaveWeight(weight);
  };

  const canDelete = handleDeleteWeighIn !== undefined;

  return (
    <CustomModal
      dismissable
      dismissableBackButton
      contentContainerStyle={{
        borderRadius: theme.roundness,
        marginHorizontal: "auto",
        width: width - 10,
        height: height / 1.4,
        ...colors.backgroundSurface,
      }}
      visible={true}
      onDismiss={handleDismiss}
    >
      <View style={[layout.container]}>
        <View style={[layout.itemsEnd, layout.widthFull, spacing.gapSm]}>
          <View
            style={[
              layout.widthFull,
              canDelete ? layout.justifyBetween : layout.justifyEnd,
              layout.flexRow,
              layout.itemsCenter,
            ]}
          >
            {canDelete && (
              <OpacityButton
                onPress={handleDeleteWeighIn}
                style={[styles.deleteButton, layout.center]}
              >
                <NativeIcon
                  color={colors.textDanger.color}
                  library="MaterialCommunityIcons"
                  name="trash-can-outline"
                  size={28}
                />
              </OpacityButton>
            )}
            <Text style={[text.textRight, fonts.xl, text.textBold, colors.textOnSurfaceVariant]}>
              הוסף משקל
            </Text>
          </View>
          <Text style={[text.textCenter, text.textBold, fonts.xl, colors.textPrimary]}>
            {weight}
          </Text>
        </View>
        <View style={[layout.center, { maxHeight: height / 2 }]}>
          <WeightWheelPicker
            onValueChange={handleUpdateWeight}
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            minWeight={40}
            maxWeight={currentWeight + 100}
            stepSize={1}
            height={height / 2.2}
            itemHeight={40}
            selectedWeight={weight}
          />
        </View>
        <View style={[layout.flex1, layout.flexRow, layout.itemsEnd]}>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Button mode="contained" onPress={handleClickSave}>
              <Text style={[text.textBold, fonts.lg]}>שמור</Text>
            </Button>
            <Button mode="outlined" onPress={() => handleDismiss()}>
              <Text style={[text.textBold, fonts.lg]}>בטל</Text>
            </Button>
          </View>
        </View>
      </View>
    </CustomModal>
  );
};

export default WeightInputModal;

const styles = StyleSheet.create({
  deleteButton: {
    width: 50,
    height: 50,
  },
});
