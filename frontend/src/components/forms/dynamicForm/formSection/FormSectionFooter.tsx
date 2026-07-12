import { useWindowDimensions, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";

interface FormSectionFooterProps {
  sectionIndex: number;
  isLast: boolean;
  handleSubmit: () => void;
  goNext: () => void;
  goBack: () => void;
  isLoading?: boolean;
  onExit: () => void;
  isExiting?: boolean;
}

const FormSectionFooter: React.FC<FormSectionFooterProps> = ({
  sectionIndex,
  isLast,
  handleSubmit,
  goNext,
  goBack,
  isLoading,
  onExit,
  isExiting = false,
}) => {
  const { colors, spacing, layout, common } = useStyles();
  const containerWidth = useWindowDimensions().width;
  const showExitButton = sectionIndex === 0;

  return (
    <View
      style={[
        layout.flexRow,
        layout.justifyCenter,
        layout.itemsCenter,
        spacing.pdHorizontalLg,
        spacing.gapLg,
        spacing.pdVerticalSm,
        spacing.pdBottomBar,
        { width: containerWidth, zIndex: 100, backgroundColor: "#F2F2F2" },
      ]}
    >
      {showExitButton ? (
        <PrimaryButton
          mode="light"
          block
          style={[layout.flex1, common.borderXsm, colors.borderError]}
          onPress={onExit}
          disabled={isExiting}
        >
          <View
            style={[layout.flexRow, layout.itemsCenter, layout.justifyCenter, spacing.gapDefault]}
          >
            <Text fontVariant="bold" fontSize={16} style={colors.textDanger}>
              יציאה
            </Text>
          </View>
        </PrimaryButton>
      ) : (
        <PrimaryButton mode="light" block style={layout.flex1} onPress={goBack}>
          הקודם
        </PrimaryButton>
      )}

      {isLast ? (
        <PrimaryButton
          style={layout.flex1}
          block
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
        >
          שלח
        </PrimaryButton>
      ) : (
        <PrimaryButton style={layout.flex1} block onPress={goNext}>
          הבא
        </PrimaryButton>
      )}
    </View>
  );
};

export default FormSectionFooter;
