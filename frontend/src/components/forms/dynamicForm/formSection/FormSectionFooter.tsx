import { useWindowDimensions, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

interface FormSectionFooterProps {
  sectionIndex: number;
  isLast: boolean;
  handleSubmit: () => void;
  goNext: () => void;
  goBack: () => void;
  isLoading?: boolean;
}

const FormSectionFooter: React.FC<FormSectionFooterProps> = ({
  sectionIndex,
  isLast,
  handleSubmit,
  goNext,
  goBack,
  isLoading,
}) => {
  const { spacing, layout } = useStyles();
  const containerWidth = useWindowDimensions().width - spacing.pdHorizontalLg.paddingHorizontal * 2;

  return (
    <View
      style={[
        layout.flexRow,
        layout.justifyCenter,
        layout.itemsCenter,
        spacing.gapLg,
        spacing.pdBottomBar,
        { width: containerWidth },
      ]}
    >
      <PrimaryButton
        mode="light"
        block
        style={layout.flex1}
        onPress={goBack}
        disabled={sectionIndex === 0}
      >
        הקודם
      </PrimaryButton>
      {isLast ? (
        <PrimaryButton style={layout.flex1} block onPress={handleSubmit} loading={isLoading}>
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
