import React, { useEffect, useMemo, useRef } from "react";
import { FormPreset } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FormSectionScreen from "./formSection/FormSectionScreen";
import { FormProvider } from "@/context/useFormContext";

interface DynamicFormProps {
  form: FormPreset;
  onComplete?: () => void;
}

export type SectionStackParamList = {
  FormSection: { sectionIndex: number };
};

type QuestionErrors = Record<string, string>;

interface FormContextType {
  sections: FormPreset["sections"];
  answers: Record<string, unknown>;
  errors: QuestionErrors;
  updateAnswer: (questionId: string, value: unknown) => void;
  handleSubmit: () => void;
  isPending: boolean;
  validateSection: (index: number) => boolean;
  hasInvalidOptionsInSection: (index: number) => boolean;
  invalidOptionsByQuestionId: Record<string, boolean>;
  formId: string;
  initialSectionIndex: number;
  progress: any;
  updateFormProgress: any;
  didInitStackRef: React.MutableRefObject<boolean>;
}

export const FormContext = React.createContext<FormContextType | null>(null);
const Stack = createNativeStackNavigator<SectionStackParamList>();

const DynamicForm: React.FC<DynamicFormProps> = ({ form, onComplete }) => {
  const { progressByFormId, updateFormProgress } = useFormStore();
  const progress = progressByFormId[form._id];
  const hasInitializedRef = useRef(false);

  const sections = form.sections || [];
  const lastSectionIndex = Math.max(sections.length - 1, 0);

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
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialAnswers: Record<string, unknown> = {};
    sections.forEach((section) => {
      section.questions.forEach((question) => {
        const savedAnswer = progress?.answers?.[question._id];
        if (savedAnswer !== undefined) {
          initialAnswers[question._id] = savedAnswer;
        }
      });
    });

    updateFormProgress(form._id, {
      currentSectionIndex: initialSectionIndex,
      currentSectionId: sections[initialSectionIndex]?._id,
    });
  }, []);

  return (
    <FormProvider form={form} onComplete={onComplete}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="FormSection"
          component={FormSectionScreen}
          initialParams={{ sectionIndex: initialSectionIndex }}
        />
      </Stack.Navigator>
    </FormProvider>
  );
};

export default DynamicForm;
