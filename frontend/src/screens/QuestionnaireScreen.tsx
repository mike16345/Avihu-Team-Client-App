import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Input from "@/components/ui/inputs/Input";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { FC } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fields = [
  { label: "שם פרטי", value: "אביהו" },
  { label: "שם משפחה", value: "בושרי" },
  { label: "קוד אמינות", value: "596HG" },
  { label: "קוד אמינות", value: "596HG" },
  { label: "קוד אמינות", value: "596HG" },
  { label: "קוד אמינות", value: "596HG" },
];

const QuestionnaireScreen: FC = () => {
  const { spacing, layout, colors, common } = useStyles();

  return (
    <SafeAreaView style={[layout.flex1, colors.background]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          spacing.pdHorizontalLg,
          spacing.pdVerticalXl,
          spacing.gapXl,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={spacing.gapSm}>
          <Text fontVariant="extrabold" fontSize={28} style={colors.textPrimary}>
            כותרת
          </Text>
          <Text fontVariant="regular" fontSize={16} style={styles.subtitle}>
            היי! יש לך עדיין חשבון?
          </Text>
        </View>

        <View
          style={[
            spacing.gapMd,
            spacing.pdLg,
            common.roundedMd,
            colors.backgroundSurface,
            styles.formPanel,
          ]}
        >
          {fields.map((field, index) => (
            <Input key={`${field.label}-${index}`} label={field.label} defaultValue={field.value} />
          ))}
        </View>

        <PrimaryButton block style={styles.ctaButton}>
          הבא
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  subtitle: {
    color: "#4A5568",
    marginTop: 4,
  },
  formPanel: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButton: {
    marginTop: 8,
  },
});

export default QuestionnaireScreen;
