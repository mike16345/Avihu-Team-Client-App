import { ScrollView, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { FormSection } from "@/interfaces/FormPreset";
import QuestionContainer from "../../question/QuestionContainer";

interface FormSectionContentProps {
  currentSection: FormSection;
}

const FormSectionContent: React.FC<FormSectionContentProps> = ({ currentSection }) => {
  const { spacing } = useStyles();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[spacing.pdVerticalMd, spacing.gapXl]}
      nestedScrollEnabled
    >
      <View style={[spacing.gapLg]}>
        {currentSection.questions.map((question, index) => (
          <QuestionContainer
            key={question._id}
            question={question}
            isLast={index === currentSection.questions.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default FormSectionContent;
