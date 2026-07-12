import React, { useEffect, useMemo, useRef } from "react";
import { FormPreset } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FormSectionScreen from "./formSection/FormSectionScreen";
import { FormProvider } from "@/context/useFormContext";
import { Platform } from "react-native";

interface DynamicFormProps {
  form: FormPreset;
  onComplete?: () => void;
}

export type SectionTransitionDirection = "forward" | "backward";

export type SectionStackParamList = {
  FormSection: { sectionIndex: number; direction?: SectionTransitionDirection };
};

const Stack = createNativeStackNavigator<SectionStackParamList>();

const DynamicForm: React.FC<DynamicFormProps> = ({ form, onComplete }) => {
  const { progressByFormId, updateFormProgress } = useFormStore();

  const progress = progressByFormId[form._id];
  const hasInitializedRef = useRef(false);
  const sections = form.sections || [];
  const lastSectionIndex = Math.max(sections.length - 1, 0);
  const isIos = Platform.OS === "ios";

  const backwardsAnimation = isIos ? "ios_from_left" : "slide_from_right";
  const forwardsAnimation = isIos ? "ios_from_right" : "slide_from_left";

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
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen
          name="FormSection"
          component={FormSectionScreen}
          initialParams={{ sectionIndex: initialSectionIndex, direction: "forward" }}
          options={({ route }) => ({
            animation:
              route.params.direction === "backward" ? backwardsAnimation : forwardsAnimation,
          })}
        />
      </Stack.Navigator>
    </FormProvider>
  );
};

export default DynamicForm;
