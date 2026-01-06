import { View } from "react-native";
import { FormQuestion } from "@/interfaces/FormPreset";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { StyleSheet } from "react-native";
import QuestionInput from "./QuestionInput";
import { useFormContext } from "@/context/useFormContext";

interface QuestionContainerProps {
  question: FormQuestion;
}

const QuestionContainer = ({ question }: QuestionContainerProps) => {
  const { spacing, layout, colors } = useStyles();
  const { errors, invalidOptionsByQuestionId } = useFormContext();

  return (
    <View key={question._id} style={[spacing.gapSm]}>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
        <Text fontVariant="semibold" fontSize={16} style={[colors.textPrimary]}>
          {question.question}
        </Text>
        {question.required ? (
          <Text fontVariant="bold" fontSize={14} style={colors.textDanger}>
            *
          </Text>
        ) : null}
      </View>
      {question.description ? (
        <Text fontVariant="regular" fontSize={14} style={[styles.subtitle, styles.right]}>
          {question.description}
        </Text>
      ) : null}
      <QuestionInput
        question={question}
        error={errors[question._id]}
        inValidOptions={invalidOptionsByQuestionId[question._id]}
      />
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
});

export default QuestionContainer;
