import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { FormProvider, useFormContext } from "@/context/useFormContext";
import { mockAgreement } from "@/mock/agreement";
import Button from "@/components/Button/Button";
import useStyles from "@/styles/useGlobalStyles";
import { AgreementStackParamList } from "@/navigators/AgreementStack";
import QuestionInput from "@/components/forms/question/QuestionInput";
import { Text } from "@/components/ui/Text";
import { FormPreset } from "@/interfaces/FormPreset";

type AgreementQuestionsScreenNavigationProp = StackNavigationProp<
  AgreementStackParamList,
  "AgreementQuestions"
>;

const AgreementQuestionsScreen = () => {
  const { validateSection, sections, errors } = useFormContext();
  const navigation = useNavigation<AgreementQuestionsScreenNavigationProp>();
  const { spacing } = useStyles();

  const handleContinue = () => {
    // Assuming all questions are in the first section for simplicity
    if (validateSection(0)) {
      navigation.navigate("AgreementSignature");
    }
  };

  const section = sections[0];

  return (
    <ScrollView contentContainerStyle={[spacing.pHorizontalMd, spacing.pVl]}>
      {section.questions.map((question) => (
        <View key={question._id} style={styles.questionContainer}>
          <Text fontSize={16} fontVariant="semibold" style={styles.questionLabel}>
            {question.question}
          </Text>
          {question.description && (
            <Text fontSize={14} style={styles.questionDescription}>
              {question.description}
            </Text>
          )}
          <QuestionInput
            question={question}
            error={errors[question._id]}
            inValidOptions={false} // Assuming valid options for this mock
          />
        </View>
      ))}
      <Button text="Continue" onPress={handleContinue} style={styles.button} />
    </ScrollView>
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
    marginTop: 24,
  },
});

export default AgreementQuestionsScreen;
