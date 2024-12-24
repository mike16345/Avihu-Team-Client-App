import { StyleSheet, useWindowDimensions, View } from "react-native";
import { FC, useState } from "react";
import { Button } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import WeightWheelPicker from "./WeightWheelPicker";
import NativeIcon from "../Icon/NativeIcon";
import OpacityButton from "../Button/OpacityButton";
import BottomDrawer from "../ui/BottomDrawer";
import { Text } from "../ui/Text";

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
  const { height } = useWindowDimensions();
  const [weight, setWeight] = useState(currentWeight);
  const { text, spacing, fonts, colors, layout, common } = useStyles();

  const handleUpdateWeight = (value: number) => {
    setWeight(value);
  };

  const handleClickSave = () => {
    handleSaveWeight(weight);
  };

  const canDelete = handleDeleteWeighIn !== undefined;

  return (
    <BottomDrawer open={true} onClose={handleDismiss}>
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
            <Text style={[text.textRight, fonts.lg, text.textBold, colors.textOnSurfaceVariant]}>
              הוסף משקל
            </Text>
          </View>
          <Text style={[text.textCenter, text.textBold, fonts.lg, colors.textPrimary]}>
            {weight.toFixed(2)}
          </Text>
        </View>
        <View style={[layout.center]}>
          <WeightWheelPicker
            onValueChange={handleUpdateWeight}
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            minWeight={30}
            maxWeight={currentWeight + 150}
            stepSize={1}
            height={height / 3.8}
            label='ק"ג'
            itemHeight={40}
            selectedWeight={weight}
          />
        </View>
        <View
          style={[
            layout.flex1,
            layout.flexDirectionByPlatform,
            layout.itemsEnd,
            layout.justifyCenter,
          ]}
        >
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Button
              mode="contained-tonal"
              onPress={handleDismiss}
              style={[common.rounded, { width: `50%` }]}
            >
              <Text style={[text.textBold, fonts.default]}>בטל</Text>
            </Button>
            <Button
              mode="contained"
              onPress={handleClickSave}
              style={[common.rounded, { width: `50%` }]}
            >
              <Text style={[text.textBold, fonts.default, colors.textOnBackground]}>שמור</Text>
            </Button>
          </View>
        </View>
      </View>
    </BottomDrawer>
  );
};

export default WeightInputModal;

const styles = StyleSheet.create({
  deleteButton: {
    width: 50,
    height: 50,
  },
});
