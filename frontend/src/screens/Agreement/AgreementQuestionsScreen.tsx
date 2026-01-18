import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFormContext } from "@/context/useFormContext";
import useStyles from "@/styles/useGlobalStyles";
import { AgreementStackParamList } from "@/navigators/AgreementStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import QuestionContainer from "@/components/forms/question/QuestionContainer";

type AgreementQuestionsScreenNavigationProp = NativeStackNavigationProp<
  AgreementStackParamList,
  "AgreementQuestions"
>;

const AgreementQuestionsScreen = () => {
  const { validateSection, sections } = useFormContext();
  const navigation = useNavigation<AgreementQuestionsScreenNavigationProp>();
  const { spacing, layout } = useStyles();

  const handleContinue = () => {
    // Assuming all questions are in the first section for simplicity
    if (validateSection(0)) {
      navigation.navigate("AgreementSignature");
    }
  };

  const section = sections[0];

  return (
    <View style={[layout.flex1, spacing.pdBottomBar]}>
      <ScrollView contentContainerStyle={[spacing.pdStatusBar, spacing.pdBottomBar, spacing.gap20]}>
        {section.questions.map((question, i) => (
          <QuestionContainer
            key={question._id}
            question={question}
            isLast={i === section.questions.length - 1}
          />
        ))}
      </ScrollView>

      <PrimaryButton onPress={handleContinue} block style={styles.button}>
        המשך לחתימה
      </PrimaryButton>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    marginBottom: 8,
  },
  questionDescription: {
    marginBottom: 8,
    color: "#666",
  },
  button: {
    margin: "auto",
    width: "90%",
  },
});

export default AgreementQuestionsScreen;
