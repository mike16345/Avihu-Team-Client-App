import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { z } from "zod";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import Input from "@/components/ui/inputs/Input";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import CheckboxGroup from "./inputs/CheckboxGroup";
import RadioGroup from "./inputs/RadioGroup";
import RangeSelector from "./inputs/RangeSelector";
import FileUploadInput from "./inputs/FileUploadInput";
import DropdownMenu from "@/components/ui/dropwdown/DropdownMenu";
import { ItemType } from "react-native-dropdown-picker";
import { FormPreset, FormQuestion } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import { getOccurrenceKeyForForm, isOptionQuestionType } from "@/utils/formPresets";
import useAddFormResponse from "@/hooks/mutations/forms/useAddFormResponse";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

interface DynamicFormProps {
  form: FormPreset;
  onComplete?: () => void;
}

type SectionStackParamList = {
  FormSection: { sectionIndex: number };
};

type QuestionErrors = Record<string, string>;

const REQUIRED_MESSAGE = "אנא מלא/י את השאלה.";
const INVALID_OPTIONS_MESSAGE = "שגיאת נתונים בטופס.";

const DynamicForm: React.FC<DynamicFormProps> = ({ form, onComplete }) => {
  const { spacing, layout, colors } = useStyles();
  const userId = useUserStore((state) => state.currentUser?._id);
  const { progressByFormId, updateFormProgress, clearFormProgress } = useFormStore();
  const progress = progressByFormId[form._id];
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<QuestionErrors>({});
  const { mutateAsync, isPending } = useAddFormResponse();
  const didInitStackRef = useRef(false);

  const sections = form.sections || [];
  const lastSectionIndex = Math.max(sections.length - 1, 0);

  const invalidOptionsByQuestionId = useMemo(() => {
    const result: Record<string, boolean> = {};
    sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (isOptionQuestionType(question.type)) {
          result[question._id] = !question.options || question.options.length === 0;
        }
      });
    });
    return result;
  }, [sections]);

  const initialSectionIndex = useMemo(() => {
    if (progress?.currentSectionId) {
      const index = sections.findIndex((section) => section._id === progress.currentSectionId);
      return index >= 0 ? index : 0;
    }

    if (progress?.currentSectionIndex !== undefined) {
      return progress.currentSectionIndex <= lastSectionIndex ? progress.currentSectionIndex : 0;
    }

    return 0;
  }, [progress?.currentSectionId, progress?.currentSectionIndex, sections, lastSectionIndex]);

  useEffect(() => {
    const initialAnswers: Record<string, unknown> = {};
    sections.forEach((section) => {
      section.questions.forEach((question) => {
        const savedAnswer = progress?.answers?.[question._id];
        if (savedAnswer !== undefined) {
          initialAnswers[question._id] = savedAnswer;
        }
      });
    });

    setAnswers(initialAnswers);
    updateFormProgress(form._id, {
      currentSectionIndex: initialSectionIndex,
      currentSectionId: sections[initialSectionIndex]?._id,
    });
  }, [form._id, sections, progress?.answers, initialSectionIndex, updateFormProgress]);

  const updateAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      updateFormProgress(form._id, {
        answers: next,
      });
      return next;
    });

    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const buildQuestionSchema = (question: FormQuestion) => {
    if (!question.required) {
      return z.any().optional();
    }

    switch (question.type) {
      case "checkboxes":
        return z.array(z.any()).min(1, REQUIRED_MESSAGE);
      case "file-upload":
        return z.array(z.any()).min(1, REQUIRED_MESSAGE);
      case "text":
      case "textarea":
      case "radio":
      case "drop-down":
      case "range":
        return z.string().min(1, REQUIRED_MESSAGE);
      default:
        return z.any().optional();
    }
  };

  const buildSectionSchema = (sectionId: string) => {
    const section = sections.find((item) => item._id === sectionId);
    if (!section) return z.object({});
    const shape: Record<string, z.ZodTypeAny> = {};
    section.questions.forEach((question) => {
      shape[question._id] = buildQuestionSchema(question);
    });
    return z.object(shape);
  };

  const hasInvalidOptionsInSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section) return false;
    return section.questions.some((question) => invalidOptionsByQuestionId[question._id]);
  };

  const validateSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section) return false;

    const sectionSchema = buildSectionSchema(section._id);
    const sectionValues = section.questions.reduce<Record<string, unknown>>((acc, question) => {
      acc[question._id] = answers[question._id];
      return acc;
    }, {});

    const result = sectionSchema.safeParse(sectionValues);
    if (result.success) {
      return true;
    }

    const sectionErrors: QuestionErrors = {};
    result.error.issues.forEach((issue) => {
      const questionId = issue.path[0];
      if (typeof questionId === "string") {
        sectionErrors[questionId] = issue.message;
      }
    });

    setErrors((prev) => ({ ...prev, ...sectionErrors }));
    return false;
  };

  const validateAllSections = () => {
    const allErrors: QuestionErrors = {};
    let isValid = true;

    sections.forEach((section) => {
      const sectionSchema = buildSectionSchema(section._id);
      const sectionValues = section.questions.reduce<Record<string, unknown>>((acc, question) => {
        acc[question._id] = answers[question._id];
        return acc;
      }, {});

      const result = sectionSchema.safeParse(sectionValues);
      if (!result.success) {
        isValid = false;
        result.error.issues.forEach((issue) => {
          const questionId = issue.path[0];
          if (typeof questionId === "string") {
            allErrors[questionId] = issue.message;
          }
        });
      }
    });

    setErrors(allErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    const hasInvalidOptions = sections.some((_, index) => hasInvalidOptionsInSection(index));
    if (hasInvalidOptions) {
      const invalidErrors: QuestionErrors = {};
      sections.forEach((section) => {
        section.questions.forEach((question) => {
          if (invalidOptionsByQuestionId[question._id]) {
            invalidErrors[question._id] = INVALID_OPTIONS_MESSAGE;
          }
        });
      });
      setErrors(invalidErrors);
      return;
    }

    if (!validateAllSections()) return;
    if (!userId) return;

    const payload = {
      formId: form._id,
      userId,
      submittedAt: new Date().toISOString(),
      sections: sections.map((section) => ({
        _id: section._id,
        title: section.title,
        questions: section.questions.map((question) => ({
          _id: question._id,
          type: question.type,
          question: question.question,
          answer: answers[question._id],
        })),
      })),
    };

    await mutateAsync(payload);

    const occurrenceKey = getOccurrenceKeyForForm(form);
    const store = useFormStore.getState();

    if (form.type === "onboarding") {
      store.markOnboardingCompleted(userId);
    } else if (form.type === "monthly" && occurrenceKey) {
      store.markMonthlyCompletion(userId, form._id, occurrenceKey);
    } else if (form.type === "general" && occurrenceKey) {
      store.markGeneralCompletion(userId, form._id, occurrenceKey);
    }

    clearFormProgress(form._id);
    onComplete?.();
  };

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
            value={(questionValue as string) || ""}
            onChangeText={(value) => updateAnswer(question._id, value)}
            error={!!errorMessage}
            style={colors.backgroundSurface}
          />
        );
      case "textarea":
        return (
          <Input
            value={(questionValue as string) || ""}
            onChangeText={(value) => updateAnswer(question._id, value)}
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
            onChange={(value) => updateAnswer(question._id, value)}
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
          <DropdownMenu
            items={items}
            selectedValue={questionValue as string}
            onSelect={(value) => updateAnswer(question._id, value)}
          />
        );
      }
      case "range":
        return (
          <RangeSelector
            options={question.options || []}
            value={questionValue as string}
            onChange={(value) => updateAnswer(question._id, value)}
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

  if (!sections.length || !sections[0]) {
    return (
      <View style={[layout.flex1, layout.center]}>
        <Text fontVariant="bold" fontSize={18} style={colors.textPrimary}>
          אין טופס להצגה
        </Text>
      </View>
    );
  }

  const Stack = createNativeStackNavigator<SectionStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="FormSection"
        component={FormSectionScreen}
        initialParams={{ sectionIndex: initialSectionIndex }}
      />
    </Stack.Navigator>
  );

  function FormSectionScreen({
    route,
    navigation,
  }: {
    route: RouteProp<SectionStackParamList, "FormSection">;
    navigation: any;
  }) {
    const { sectionIndex } = route.params;
    const section = sections[sectionIndex];
    const isLast = sectionIndex === lastSectionIndex;

    useEffect(() => {
      if (!didInitStackRef.current && initialSectionIndex > 0 && !navigation.canGoBack()) {
        const routes = Array.from({ length: initialSectionIndex + 1 }, (_, index) => ({
          name: "FormSection",
          params: { sectionIndex: index },
        }));

        navigation.reset({
          index: initialSectionIndex,
          routes,
        });

        didInitStackRef.current = true;
        return;
      }

      didInitStackRef.current = true;
      updateFormProgress(form._id, {
        currentSectionIndex: sectionIndex,
        currentSectionId: section?._id,
      });
    }, [form._id, sectionIndex, section?._id, updateFormProgress, navigation, initialSectionIndex]);

    const goNext = () => {
      if (hasInvalidOptionsInSection(sectionIndex)) {
        const invalidErrors: QuestionErrors = {};
        section.questions.forEach((question) => {
          if (invalidOptionsByQuestionId[question._id]) {
            invalidErrors[question._id] = INVALID_OPTIONS_MESSAGE;
          }
        });
        setErrors((prev) => ({ ...prev, ...invalidErrors }));
        return;
      }

      if (!validateSection(sectionIndex)) return;

      if (!isLast) {
        navigation.push("FormSection", { sectionIndex: sectionIndex + 1 });
      }
    };

    return (
      <View style={[layout.flex1, spacing.pdHorizontalLg]}>
        <View style={[styles.stepPill, colors.backgroundSurface]}>
          <Text fontVariant="bold" style={styles.stepPillText}>
            {`שלב ${sectionIndex + 1} מתוך ${sections.length}`}
          </Text>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[spacing.pdVerticalXl, spacing.gapXl]}
        >
          <View style={[spacing.gapSm]}>
            <Text fontVariant="extrabold" fontSize={28} style={[colors.textPrimary, styles.right]}>
              {section.title}
            </Text>
            {section.description ? (
              <Text fontVariant="regular" fontSize={16} style={[styles.subtitle, styles.right]}>
                {section.description}
              </Text>
            ) : null}
          </View>

          <View style={[spacing.gapLg]}>
            {section.questions.map((question) => (
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
                  <Text fontVariant="regular" fontSize={14} style={styles.subtitle}>
                    {question.description}
                  </Text>
                ) : null}
                {renderQuestionInput(question)}
                {errors[question._id] && !invalidOptionsByQuestionId[question._id] ? (
                  <Text fontSize={14} style={colors.textDanger}>
                    {errors[question._id]}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[layout.flexRow, layout.justifyBetween, spacing.gapSm]}>
          <SecondaryButton onPress={() => navigation.goBack()} disabled={sectionIndex === 0}>
            הקודם
          </SecondaryButton>
          {isLast ? (
            <PrimaryButton onPress={handleSubmit} loading={isPending}>
              שלח
            </PrimaryButton>
          ) : (
            <PrimaryButton onPress={goNext}>הבא</PrimaryButton>
          )}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  right: {
    textAlign: "left",
  },
  subtitle: {
    color: "#4A5568",
    marginTop: 4,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    width: 100,
  },
  stepPillText: {
    color: "#072723",
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});

export default DynamicForm;
