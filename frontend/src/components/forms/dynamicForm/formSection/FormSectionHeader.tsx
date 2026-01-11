import { StyleSheet, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";

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
  const { colors, spacing } = useStyles();

  return (
    <View style={[spacing.gap20, spacing.pdVerticalXl, spacing.pdHorizontalLg]}>
      <View style={[styles.stepPill, colors.backgroundSurface]}>
        <Text fontVariant="bold" style={styles.stepPillText}>
          {`שלב ${currentSection} מתוך ${totalSections}`}
        </Text>
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
    color: "#4A5568",
    marginTop: 4,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    width: 100,
  },
  stepPillText: {
    color: "#072723",
  },
});

export default FormSectionHeader;
