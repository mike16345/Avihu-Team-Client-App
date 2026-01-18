import { StyleSheet } from "react-native";
import { FormQuestion } from "@/interfaces/FormPreset";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import Input from "@/components/ui/inputs/Input";
import RadioGroup from "../inputs/RadioGroup";
import CheckboxGroup from "../inputs/CheckboxGroup";
import { ItemType } from "react-native-dropdown-picker";
import RangeSelector from "../inputs/RangeSelector";
import FileUploadInput from "../inputs/FileUploadInput";
import { INVALID_OPTIONS_MESSAGE } from "@/constants/Constants";
import { useFormContext } from "@/context/useFormContext";
import { DropDownContextProvider } from "@/context/useDropdown";
import DropDownTrigger from "@/components/ui/dropwdown/DropDownTrigger";
import DropDownContent from "@/components/ui/dropwdown/DropDownContent";
import YesOrNo from "../inputs/YesOrNo";

interface QuestionInputProps {
  question: FormQuestion;
  error?: string;
  inValidOptions: boolean;
}

const QuestionInput = ({ question, inValidOptions, error }: QuestionInputProps) => {
  const { answers, errors, updateAnswer, invalidOptionsByQuestionId } = useFormContext();
  const { colors } = useStyles();

  const renderQuestionInput = (question: FormQuestion) => {
    const questionValue = answers[question._id];
    const errorMessage = errors[question._id];
    const hasInvalidOptions = invalidOptionsByQuestionId[question._id];

    if (hasInvalidOptions) {
      return (
        <Text fontSize={14} style={colors.textDanger}>
          {INVALID_OPTIONS_MESSAGE}
        </Text>
      );
    }

    switch (question.type) {
      case "text":
        return (
          <Input
            placeholder={question.question}
            value={(questionValue as string) || ""}
            onChangeText={(value) => updateAnswer(question._id, String(value))}
            error={!!errorMessage}
            style={colors.backgroundSurface}
          />
        );
      case "textarea":
        return (
          <Input
            placeholder={question.question}
            value={(questionValue as string) || ""}
            onChangeText={(value) => updateAnswer(question._id, String(value))}
            error={!!errorMessage}
            style={[colors.backgroundSurface, styles.textarea]}
            multiline
            numberOfLines={4}
          />
        );
      case "radio":
        return (
          <RadioGroup
            options={question.options || []}
            value={questionValue as string}
            onChange={(value) => updateAnswer(question._id, String(value))}
          />
        );
      case "yes-no":
        return (
          <YesOrNo
            value={questionValue as string}
            onChange={(value) => updateAnswer(question._id, String(value))}
          />
        );
      case "checkboxes":
        return (
          <CheckboxGroup
            options={question.options || []}
            values={(questionValue as string[]) || []}
            onChange={(value) => updateAnswer(question._id, value)}
          />
        );
      case "drop-down": {
        const items: ItemType<string>[] = (question.options || []).map((option) => ({
          label: option,
          value: option,
        }));
        return (
          <DropDownContextProvider
            onSelect={(value) => updateAnswer(question._id, String(value))}
            items={items}
            initialValue={undefined}
          >
            <DropDownTrigger />
            <DropDownContent />
          </DropDownContextProvider>
        );
      }
      case "range":
        return (
          <RangeSelector
            options={question.options || []}
            value={questionValue as string}
            onChange={(value) => updateAnswer(question._id, String(value))}
          />
        );
      case "file-upload":
        return (
          <FileUploadInput
            value={(questionValue as string[]) || []}
            onChange={(value) => updateAnswer(question._id, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderQuestionInput(question)}
      {error && !inValidOptions ? (
        <Text
          fontSize={14}
          style={[
            colors.textDanger,
            { marginEnd: "auto" },
            question.type == "range" && { paddingStart: 24 },
          ]}
        >
          {errors[question._id]}
        </Text>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default QuestionInput;
