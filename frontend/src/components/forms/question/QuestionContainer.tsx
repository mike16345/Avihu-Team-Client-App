import { semanticColors } from "@/themes/semanticColors";
import { useWindowDimensions, View } from "react-native";
import { FormQuestion } from "@/interfaces/FormPreset";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { StyleSheet } from "react-native";
import QuestionInput from "./QuestionInput";
import { useFormContext } from "@/context/useFormContext";
import { ConditionalRender } from "@/components/ui/ConditionalRender";

interface QuestionContainerProps {
  question: FormQuestion;
  isLast: boolean;
}

const QuestionContainer = ({ question, isLast }: QuestionContainerProps) => {
  const { spacing, layout, colors, text } = useStyles();
  const { errors, invalidOptionsByQuestionId } = useFormContext();
  const { width } = useWindowDimensions();

  return (
    <View key={question._id} style={spacing.gapMd}>
      <View>
        <View style={[layout.flexRow, layout.itemsStart, spacing.gapSm, { width: width * 0.9 }]}>
          <Text
            fontVariant="semibold"
            fontSize={18}
            style={[colors.textPrimary, styles.paddingStart, text.textLeft]}
          >
            {question.question}
          </Text>
          {question.required ? (
            <Text fontVariant="bold" fontSize={16} style={colors.textDanger}>
              *
            </Text>
          ) : null}
        </View>
        <ConditionalRender condition={question.description?.trim()}>
          <Text
            fontVariant="regular"
            fontSize={14}
            style={[styles.subtitle, styles.right, styles.paddingStart, { width: width * 0.9 }]}
          >
            {question.description}
          </Text>
        </ConditionalRender>
      </View>

      <View style={question.type !== "range" && spacing.pdHorizontalLg}>
        <QuestionInput
          question={question}
          error={errors[question._id]}
          inValidOptions={invalidOptionsByQuestionId[question._id]}
        />
      </View>

      {!isLast ? <View style={styles.divider} /> : null}
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
  paddingStart: { paddingStart: 24 },
  divider: {
    height: 0.5,
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: semanticColors.app.formBorder,
    borderRadius: 999,
    opacity: 0.5,
  },
});

export default QuestionContainer;
