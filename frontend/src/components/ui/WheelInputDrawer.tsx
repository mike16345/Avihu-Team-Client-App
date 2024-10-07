import { StyleSheet, useWindowDimensions, View } from "react-native";
import { FC, useState } from "react";
import { Button, Text } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "../Icon/NativeIcon";
import OpacityButton from "../Button/OpacityButton";
import BottomDrawer from "../ui/BottomDrawer";
import WeightWheelPicker from "../WeightGraph/WeightWheelPicker";

interface WeightInputModalProps {
  currentValue: number;
  onSave: (weight: number) => void;
  onDelete?: () => void;
  onDismiss: () => void;
}

const WheelInputDrawer: FC<WeightInputModalProps> = ({
  currentValue,
  onSave,
  onDelete,
  onDismiss,
}) => {
  const { height } = useWindowDimensions();
  const [weight, setWeight] = useState(currentValue);
  const { text, spacing, fonts, colors, layout } = useStyles();

  const onChange = (value: number) => {
    setWeight(value);
  };

  const handleClickSave = () => {
    onSave(weight);
  };

  const canDelete = onDelete !== undefined;

  return (
    <BottomDrawer open={true} onClose={onDismiss}>
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
              <OpacityButton onPress={onDelete} style={[styles.deleteButton, layout.center]}>
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
        <View style={[layout.center]}>
          <WeightWheelPicker
            onValueChange={onChange}
            activeItemColor={colors.textOnSurface.color}
            inactiveItemColor={colors.textOnSurfaceDisabled.color}
            minWeight={1}
            decimalStepSize={2.5}
            showZeroDecimal={false}
            decimalRange={10}
            maxWeight={200}
            stepSize={1}
            height={height / 4.8}
            itemHeight={40}
            selectedWeight={weight}
          />
        </View>
        <View style={[layout.flex1, layout.flexRow, layout.itemsEnd]}>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Button mode="contained" onPress={handleClickSave}>
              <Text style={[text.textBold, fonts.lg]}>שמור</Text>
            </Button>
            <Button mode="outlined" onPress={onDismiss}>
              <Text style={[text.textBold, fonts.lg]}>בטל</Text>
            </Button>
          </View>
        </View>
      </View>
    </BottomDrawer>
  );
};

export default WheelInputDrawer;

const styles = StyleSheet.create({
  deleteButton: {
    width: 50,
    height: 50,
  },
});
