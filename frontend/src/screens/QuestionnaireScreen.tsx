import BackButton from "@/components/ui/BackButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Input from "@/components/ui/inputs/Input";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { FC } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuestionnaireStackParamList = {
  QuestionSection: { stepIndex: number };
};

type Section = {
  title: string;
  subtitle: string;
  fields: { label: string; value: string }[];
};

const sections: Section[] = [
  {
    title: "ברוכים הבאים",
    subtitle: "בואו נכיר בקצרה.",
    fields: [
      { label: "שם פרטי", value: "אביהו" },
      { label: "שם משפחה", value: "כהן" },
      { label: "אימייל", value: "avi@example.com" },
    ],
  },
  {
    title: "יצירת קשר",
    subtitle: "איך ליצור איתך קשר?",
    fields: [
      { label: "נייד", value: "+972 54 610 7337" },
      { label: "עיר", value: "תל אביב" },
      { label: "כתובת", value: "דיזינגוף 36" },
    ],
  },
  {
    title: "מדדים",
    subtitle: "עוד כמה פרטים קצרים.",
    fields: [
      { label: "משקל", value: '85 ק"ג' },
      { label: "גובה", value: '178 ס"מ' },
      { label: "מטרה", value: "חיטוב והידוק" },
    ],
  },
];

const Stack = createNativeStackNavigator<QuestionnaireStackParamList>();

type SectionScreenProps = {
  route: RouteProp<QuestionnaireStackParamList, "QuestionSection">;
  navigation: NativeStackNavigationProp<QuestionnaireStackParamList, "QuestionSection">;
};

const SectionScreen: FC<SectionScreenProps> = ({ route, navigation }) => {
  const { spacing, layout, colors } = useStyles();
  const { stepIndex } = route.params;
  const section = sections[stepIndex];
  const isLast = stepIndex === sections.length - 1;

  const goNext = () => {
    if (!isLast) {
      navigation.push("QuestionSection", { stepIndex: stepIndex + 1 });
    } else {
      navigation.popToTop();
    }
  };

  return (
    <SafeAreaView style={[layout.flex1, colors.background, styles.rtl]}>
      {/* <BackButton backIcon="chevronRightBig" /> */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          spacing.pdHorizontalLg,
          spacing.pdVerticalXl,
          spacing.gapXl,
        ]}
      >
        <View style={[styles.topBar, styles.rtl]}>
          <View style={[spacing.gapSm]}>
            <View style={styles.stepPill}>
              <Text fontVariant="bold" style={styles.stepPillText}>
                {`שלב ${stepIndex + 1} מתוך ${sections.length}`}
              </Text>
            </View>
            <Text fontVariant="extrabold" fontSize={28} style={[colors.textPrimary, styles.right]}>
              {section.title}
            </Text>
            <Text fontVariant="regular" fontSize={16} style={[styles.subtitle, styles.right]}>
              {section.subtitle}
            </Text>
          </View>
        </View>

        <View style={[spacing.gapMd, styles.rtl]}>
          {section.fields.map((field, index) => (
            <Input
              key={`${field.label}-${index}`}
              label={field.label}
              defaultValue={field.value}
              style={colors.backgroundSurface}
            />
          ))}
        </View>

        <PrimaryButton block onPress={goNext} style={styles.ctaButton}>
          {isLast ? "סיום" : "הבא"}
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
};

const QuestionnaireScreen: FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="QuestionSection"
        component={SectionScreen}
        initialParams={{ stepIndex: 0 }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  rtl: {
    direction: "rtl",
  },
  right: {
    textAlign: "left",
  },
  subtitle: {
    color: "#4A5568",
    marginTop: 4,
  },
  ctaButton: {
    marginTop: 8,
  },
  stepPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  stepPillText: {
    color: "#072723",
  },
  topBar: {
    alignItems: "center",
    // justifyContent: "space-between",
    flexDirection: "row",
  },
});

export default QuestionnaireScreen;
