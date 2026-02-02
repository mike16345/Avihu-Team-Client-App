import { useWindowDimensions, View } from "react-native";
import { FormQuestion } from "@/interfaces/FormPreset";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { StyleSheet } from "react-native";
import QuestionInput from "./QuestionInput";
import { useFormContext } from "@/context/useFormContext";

interface QuestionContainerProps {
  question: FormQuestion;
  isLast: boolean;
}

const QuestionContainer = ({ question, isLast }: QuestionContainerProps) => {
  const { spacing, layout, colors, text } = useStyles();
  const { errors, invalidOptionsByQuestionId } = useFormContext();
  const { width } = useWindowDimensions();

  return (
    <View key={question._id} style={[spacing.gapMd, !isLast && styles.borderBottom]}>
      <View>
        <View style={[layout.flexRow, layout.itemsStart, spacing.gapSm, { width: width * 0.9 }]}>
          <Text
            fontVariant="semibold"
            fontSize={16}
            style={[colors.textPrimary, styles.paddingStart, text.textLeft]}
          >
            {question.question}
          </Text>
          {question.required ? (
            <Text fontVariant="bold" fontSize={14} style={colors.textDanger}>
              *
            </Text>
          ) : null}
        </View>
        {question.description ? (
          <Text
            fontVariant="regular"
            fontSize={14}
            style={[styles.subtitle, styles.right, styles.paddingStart, { width: width * 0.9 }]}
          >
            {question.description}
          </Text>
        ) : null}
      </View>

      <View style={question.type !== "range" && spacing.pdHorizontalLg}>
        <QuestionInput
          question={question}
          error={errors[question._id]}
          inValidOptions={invalidOptionsByQuestionId[question._id]}
        />
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
  paddingStart: { paddingStart: 24 },
  borderBottom: { borderBottomWidth: 1, paddingBottom: 20, borderColor: "#cccccc" },
});

export default QuestionContainer;
