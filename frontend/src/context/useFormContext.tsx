import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { FormPreset, FormQuestion } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import { getOccurrenceKeyForForm, isOptionQuestionType } from "@/utils/formPresets";
import useAddFormResponse from "@/hooks/mutations/forms/useAddFormResponse";
import { INVALID_OPTIONS_MESSAGE, REQUIRED_MESSAGE } from "@/constants/Constants";
import { useImageApi } from "@/hooks/api/useImageApi";
import { useToast } from "@/hooks/useToast";
import { errorNotificationHaptic } from "@/utils/haptics";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNotificationStore } from "@/store/notificationStore";
import { useQueryClient } from "@tanstack/react-query";
import { USER_KEY } from "@/constants/reactQuery";

export type QuestionErrors = Record<string, string>;

interface FormContextType {
  formType: FormPreset["type"];
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

export const useFormContext = () => {
  const ctx = React.useContext(FormContext);
  if (!ctx) {
    throw new Error("useFormContext must be used inside FormProvider");
  }
  return ctx;
};

interface FormProviderProps {
  form: FormPreset;
  onComplete?: () => void;
  children: React.ReactNode;
}

/* -------------------------------- helpers -------------------------------- */

const shallowEqualErrors = (a: QuestionErrors, b: QuestionErrors) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

/* -------------------------------------------------------------------------- */

export const FormProvider: React.FC<FormProviderProps> = ({ form, onComplete, children }) => {
  const { currentUser, setCurrentUser } = useUserStore();

  const {
    progressByFormId,
    updateFormProgress,
    clearFormProgress,
    markOnboardingCompleted,
    markGeneralCompletion,
    markMonthlyCompletion,
  } = useFormStore();
  const progress = progressByFormId[form._id];
  const { handleUploadImageToS3 } = useImageApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const navigation = useNavigation<RootStackParamListNavigationProp>();
  const { removeNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<QuestionErrors>({});
  const [isPending, setIsPending] = useState(false);

  const { mutateAsync } = useAddFormResponse();

  const didInitStackRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const sections = form.sections || [];
  const lastSectionIndex = Math.max(sections.length - 1, 0);
  const formType = form.type;
  const userId = currentUser?._id;

  /* ---------------- invalid options ---------------- */

  const invalidOptionsByQuestionId = useMemo(() => {
    const result: Record<string, boolean> = {};
    sections.forEach((section) => {
      section.questions.forEach((q) => {
        if (isOptionQuestionType(q.type)) {
          result[q._id] = !q.options || q.options.length === 0;
        }
      });
    });
    return result;
  }, [sections]);

  /* ---------------- initial section ---------------- */

  const initialSectionIndex = useMemo(() => {
    if (progress?.currentSectionId) {
      const idx = sections.findIndex((s) => s._id === progress.currentSectionId);
      return idx >= 0 ? idx : 0;
    }

    if (progress?.currentSectionIndex !== undefined) {
      return progress.currentSectionIndex <= lastSectionIndex ? progress.currentSectionIndex : 0;
    }

    return 0;
  }, [progress, sections, lastSectionIndex]);

  /* ---------------- init answers ---------------- */

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialAnswers: Record<string, unknown> = {};
    sections.forEach((section) => {
      section.questions.forEach((q) => {
        if (progress?.answers?.[q._id] !== undefined) {
          initialAnswers[q._id] = progress.answers[q._id];
        }
      });
    });

    setAnswers(initialAnswers);
    updateFormProgress(form._id, {
      currentSectionIndex: initialSectionIndex,
      currentSectionId: sections[initialSectionIndex]?._id,
    });
  }, []);

  /* ---------------- updates ---------------- */

  const updateAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      updateFormProgress(form._id, { answers: next });
      return next;
    });

    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  /* ---------------- validation ---------------- */

  const buildQuestionSchema = (q: FormQuestion) => {
    if (!q.required) return z.any().optional();

    switch (q.type) {
      case "range":
        return z.coerce
          .number({ invalid_type_error: REQUIRED_MESSAGE })
          .min(1, { message: REQUIRED_MESSAGE });
      case "file-upload":
        return z
          .array(z.any(), { required_error: REQUIRED_MESSAGE })
          .min(1, { message: REQUIRED_MESSAGE });
      case "checkboxes":
        return z
          .array(z.string(), { required_error: REQUIRED_MESSAGE })
          .min(1, { message: REQUIRED_MESSAGE });
      default:
        return z.string({ required_error: REQUIRED_MESSAGE }).min(1, { message: REQUIRED_MESSAGE });
    }
  };

  /**
   * Build ALL section schemas once.
   * Rebuilt only if the form structure changes.
   */
  const sectionSchemas = useMemo(() => {
    const map = new Map<string, z.ZodObject<any>>();

    sections.forEach((section) => {
      const shape: Record<string, z.ZodTypeAny> = {};
      section.questions.forEach((q) => {
        shape[q._id] = buildQuestionSchema(q);
      });
      map.set(section._id, z.object(shape));
    });

    return map;
  }, [sections]);

  const hasInvalidOptionsInSection = (index: number) =>
    sections[index]?.questions.some((q) => invalidOptionsByQuestionId[q._id]) ?? false;

  const validateSection = (index: number) => {
    const section = sections[index];
    if (!section) return false;

    const schema = sectionSchemas.get(section._id);
    if (!schema) return true;

    const values: Record<string, unknown> = {};
    section.questions.forEach((q) => {
      values[q._id] = answers[q._id];
    });

    const result = schema.safeParse(values);
    if (result.success) return true;

    const nextErrors: QuestionErrors = {};
    result.error.issues.forEach((issue) => {
      const id = issue.path[0];
      if (typeof id === "string") {
        nextErrors[id] = issue.message;
      }
    });

    errorNotificationHaptic();
    setErrors((prev) => (shallowEqualErrors(prev, nextErrors) ? prev : { ...prev, ...nextErrors }));

    return false;
  };

  /* ---------------- submit ---------------- */

  const isLocalFileUri = (value: string) => /^(file|content):\/\//.test(value);

  const getFileExtension = (uri: string) => {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match?.[1]?.toLowerCase() || "jpg";
  };

  const uploadFileAnswers = async () => {
    const nextAnswers = { ...answers };

    for (const section of sections) {
      for (const question of section.questions) {
        if (question.type !== "file-upload") continue;

        const currentValue = answers[question._id];
        const uris = Array.isArray(currentValue) ? (currentValue as string[]) : [];
        if (!uris.length) continue;

        const uploaded: string[] = [];

        for (let index = 0; index < uris.length; index += 1) {
          const uri = uris[index];
          if (!uri || !isLocalFileUri(uri)) {
            if (uri) uploaded.push(uri);
            continue;
          }

          const extension = getFileExtension(uri);
          const imageName = `${form._id}/${question._id}/${userId}-${index}.${extension}`;
          const { urlToStore } = await handleUploadImageToS3(uri, userId!, imageName);
          uploaded.push(urlToStore);
        }

        nextAnswers[question._id] = uploaded;
      }
    }

    return nextAnswers;
  };

  const markFormCompleted = () => {
    const occurrenceKey = getOccurrenceKeyForForm(form);
    if (!occurrenceKey) return;

    switch (form.type) {
      case "onboarding":
        markOnboardingCompleted(userId!);
        break;
      case "monthly":
        markMonthlyCompletion(userId!, form._id, occurrenceKey);
        break;
      case "general":
        markGeneralCompletion(userId!, form._id, occurrenceKey);
        break;
    }
  };

  const handleSubmit = async () => {
    setIsPending(true);
    if (sections.some((_, i) => hasInvalidOptionsInSection(i))) {
      const invalid: QuestionErrors = {};
      sections.forEach((s) =>
        s.questions.forEach((q) => {
          if (invalidOptionsByQuestionId[q._id]) {
            invalid[q._id] = INVALID_OPTIONS_MESSAGE;
          }
        })
      );
      setErrors(invalid);
      errorNotificationHaptic();
      return;
    }

    if (!userId) return;

    let finalAnswers = answers;

    try {
      finalAnswers = await uploadFileAnswers();
      setAnswers(finalAnswers);
      updateFormProgress(form._id, { answers: finalAnswers });
      markFormCompleted();
      removeNotification(form._id);
    } catch (error) {
      triggerErrorToast({ message: "Failed to upload files." });
    }

    const payload = {
      formId: form._id,
      userId,
      submittedAt: new Date().toISOString(),
      sections: sections.map((s) => ({
        _id: s._id,
        title: s.title,
        questions: s.questions.map((q) => ({
          _id: q._id,
          type: q.type,
          question: q.question,
          answer: finalAnswers[q._id],
        })),
      })),
    };

    await mutateAsync(payload);

    const occurrenceKey = getOccurrenceKeyForForm(form);
    const store = useFormStore.getState();
    let navigationPath = "BottomTabs";

    if (form.type === "onboarding") {
      store.markOnboardingCompleted(userId);
      queryClient.invalidateQueries({ queryKey: [USER_KEY, userId] });

      setCurrentUser({
        ...currentUser,
        completedOnboarding: true,
      });

      navigationPath = "agreements";

      triggerSuccessToast({ title: "הטופס נשלח בהצלחה" });
    } else if (occurrenceKey) {
      store.markGeneralCompletion(userId, form._id, occurrenceKey);
    }

    navigation.replace(navigationPath as any);
    clearFormProgress(form._id);
    onComplete?.();
    setIsPending(false);
  };

  return (
    <FormContext.Provider
      value={{
        formType,
        sections,
        answers,
        errors,
        updateAnswer,
        handleSubmit,
        isPending,
        validateSection,
        hasInvalidOptionsInSection,
        invalidOptionsByQuestionId,
        formId: form._id,
        initialSectionIndex,
        progress,
        updateFormProgress,
        didInitStackRef,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
