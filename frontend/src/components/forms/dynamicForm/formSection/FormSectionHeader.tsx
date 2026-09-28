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
    <View style={[spacing.gap20, spacing.pdVerticalXl, spacing.pdHorizontalLg]}>
      <View style={layout.center}>
        <AppIcon />
      </View>

      <View style={[layout.flexRow, layout.itemsCenter, layout.justifyCenter]}>
        <View style={styles.stepPill}>
          <Text fontVariant="light" style={styles.stepPillText}>
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

      <View style={styles.divider} />
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
    alignSelf: "center",
  },
  stepPillText: {
    color: semanticColors.steps.ringGradientStart,
  },
  divider: {
    height: 0.5,
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: semanticColors.app.formBorder,
    borderRadius: 999,
    opacity: 0.5,
  },
});

export default FormSectionHeader;
