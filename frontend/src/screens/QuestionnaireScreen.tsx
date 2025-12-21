import Icon from "@/components/Icon/Icon";
import IconButton from "@/components/ui/buttons/IconButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import Input from "@/components/ui/inputs/Input";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { FC } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fields = [
  { label: "שם פרטי", value: "אביהו" },
  { label: "שם משפחה", value: "בושרי" },
  { label: "מספר טךפון", value: "0546107337" },
  { label: "כתובת", value: "נחל ירקון 36" },
  { label: "משקל", value: "85 קג" },
  { label: "גובה", value: "1.78 ס'מ" },
];

const QuestionnaireScreen: FC = () => {
  const { spacing, layout, colors, common } = useStyles();

  return (
    <SafeAreaView style={[layout.flex1, colors.background, spacing.gap30, spacing.pdHorizontalLg]}>
      <View style={spacing.gapSm}>
        <View
          style={[
            layout.flexRow,
            layout.itemsCenter,
            spacing.gap14,
            colors.backgroundSurface,
            { width: 100 },
            common.rounded,
            spacing.pdXs,
          ]}
        >
          <TouchableOpacity>
            <Icon name="chevronRightBig" />
          </TouchableOpacity>
          <Text fontVariant="bold">1 מתוך 3</Text>
        </View>
        <Text
          fontVariant="extrabold"
          fontSize={28}
          style={[colors.textPrimary, { textAlign: "left" }]}
        >
          פרטים אישיים
        </Text>
        <Text
          fontVariant="regular"
          fontSize={16}
          style={[styles.subtitle, , { textAlign: "left" }]}
        >
          נא למלא פרטים אישיים
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, spacing.gapXl]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[spacing.gapLg, common.roundedMd]}>
          {fields.map((field, index) => (
            <Input
              key={`${field.label}-${index}`}
              label={field.label}
              defaultValue={field.value}
              style={[colors.backgroundSurface]}
            />
          ))}
        </View>
      </ScrollView>
      <View style={[layout.flexRow, spacing.gapDefault]}>
        <PrimaryButton mode="light" block style={styles.ctaButton}>
          חזור
        </PrimaryButton>
        <PrimaryButton block style={styles.ctaButton}>
          הבא
        </PrimaryButton>
      </View>
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
    width: "49%",
  },
});

export default QuestionnaireScreen;
