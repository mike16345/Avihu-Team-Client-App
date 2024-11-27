import { StyleSheet, View } from "react-native";
import { FC, PropsWithChildren } from "react";
import { Button } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "../Icon/NativeIcon";
import OpacityButton from "../Button/OpacityButton";
import BottomDrawer from "../ui/BottomDrawer";
import { Text } from "./Text";

interface WeightInputModalProps extends PropsWithChildren {
  title: string;
  currentValue: number;
  onSave: (weight: number) => void;
  onDelete?: () => void;
  onDismiss: () => void;
}

const WheelInputDrawer: FC<WeightInputModalProps> = ({
  currentValue,
  title,
  onSave,
  onDelete,
  onDismiss,
  children,
}) => {
  const { text, spacing, fonts, colors, layout } = useStyles();

  const handleClickSave = () => {
    onSave(currentValue);
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
            <Text style={[text.textRight, fonts.lg, text.textBold, colors.textOnSurfaceVariant]}>
              {title}
            </Text>
          </View>
          <Text style={[text.textCenter, text.textBold, fonts.lg, colors.textPrimary]}>
            {currentValue}
          </Text>
        </View>
        <View style={[layout.center]}>{children}</View>
        <View style={[layout.flex1, layout.flexRow, layout.itemsEnd]}>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Button mode="contained" onPress={handleClickSave}>
              <Text style={[text.textBold, fonts.default]}>שמור</Text>
            </Button>
            <Button mode="outlined" onPress={onDismiss}>
              <Text style={[text.textBold, fonts.default]}>בטל</Text>
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
