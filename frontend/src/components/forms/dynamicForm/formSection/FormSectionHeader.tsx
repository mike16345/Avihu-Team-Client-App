import { semanticColors } from "@/themes/semanticColors";
import { StyleSheet, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useFormContext } from "@/context/useFormContext";
import AppIcon from "@/components/Icon/AppIcon";

interface FormSectionHeaderProps {
  currentSection: number;
  totalSections: number;
  sectionTitle: string;
  sectionDescription?: string;
}

const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  currentSection,
  totalSections,
  sectionTitle,
  sectionDescription,
}) => {
  const { colors, spacing, layout } = useStyles();
  const { formType } = useFormContext();

  return (
    <View
      style={[
        spacing.gap20,
        spacing.pdVerticalXl,
        spacing.pdHorizontalLg,
        { borderBottomWidth: 1, borderColor: semanticColors.app.formBorder },
      ]}
    >
      <View style={layout.center}>
        <AppIcon />
      </View>

      <View
        style={[
          layout.flexRow,
          layout.itemsCenter,
          formType === "onboarding" ? layout.justifyEnd : layout.justifyStart,
        ]}
      >
        <View style={[styles.stepPill, colors.backgroundSurface]}>
          <Text fontVariant="bold" style={styles.stepPillText}>
            {`שלב ${currentSection} מתוך ${totalSections}`}
          </Text>
        </View>
      </View>

      <View style={[spacing.gapSm]}>
        <Text fontVariant="extrabold" fontSize={28} style={[colors.textPrimary, styles.right]}>
          {sectionTitle}
        </Text>
        {sectionDescription ? (
          <Text fontVariant="regular" fontSize={16} style={[styles.subtitle, styles.right]}>
            {sectionDescription}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  right: {
    textAlign: "left",
  },
  subtitle: {
    color: semanticColors.app.textForm,
    marginTop: 4,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: semanticColors.scrim,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: "flex-start",
  },
  stepPillText: {
    color: semanticColors.steps.ringGradientStart,
  },
});

export default FormSectionHeader;
