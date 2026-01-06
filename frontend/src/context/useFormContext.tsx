import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { FormPreset, FormQuestion } from "@/interfaces/FormPreset";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import { getOccurrenceKeyForForm, isOptionQuestionType } from "@/utils/formPresets";
import useAddFormResponse from "@/hooks/mutations/forms/useAddFormResponse";
import { INVALID_OPTIONS_MESSAGE, REQUIRED_MESSAGE } from "@/constants/Constants";

export type QuestionErrors = Record<string, string>;

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

export const FormProvider: React.FC<FormProviderProps> = ({ form, onComplete, children }) => {
  const userId = useUserStore((s) => s.currentUser?._id);
  const { progressByFormId, updateFormProgress, clearFormProgress } = useFormStore();
  const progress = progressByFormId[form._id];

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<QuestionErrors>({});

  const { mutateAsync, isPending } = useAddFormResponse();

  const didInitStackRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const sections = form.sections || [];
  const lastSectionIndex = Math.max(sections.length - 1, 0);

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
      case "checkboxes":
      case "file-upload":
        return z.array(z.any()).min(1, REQUIRED_MESSAGE);
      default:
        return z.string().min(1, REQUIRED_MESSAGE);
    }
  };

  const buildSectionSchema = (sectionId: string) => {
    const section = sections.find((s) => s._id === sectionId);
    if (!section) return z.object({});
    const shape: Record<string, z.ZodTypeAny> = {};
    section.questions.forEach((q) => {
      shape[q._id] = buildQuestionSchema(q);
    });
    return z.object(shape);
  };

  const hasInvalidOptionsInSection = (index: number) =>
    sections[index]?.questions.some((q) => invalidOptionsByQuestionId[q._id]) ?? false;

  const validateSection = (index: number) => {
    const section = sections[index];
    if (!section) return false;

    const schema = buildSectionSchema(section._id);
    const values = Object.fromEntries(section.questions.map((q) => [q._id, answers[q._id]]));

    const result = schema.safeParse(values);
    if (result.success) return true;

    const nextErrors: QuestionErrors = {};
    result.error.issues.forEach((issue) => {
      if (typeof issue.path[0] === "string") {
        nextErrors[issue.path[0]] = issue.message;
      }
    });

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return false;
  };

  /* ---------------- submit ---------------- */

  const handleSubmit = async () => {
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
      return;
    }

    if (!userId) return;

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
          answer: answers[q._id],
        })),
      })),
    };

    await mutateAsync(payload);

    const occurrenceKey = getOccurrenceKeyForForm(form);
    const store = useFormStore.getState();

    if (form.type === "onboarding") {
      store.markOnboardingCompleted(userId);
    } else if (occurrenceKey) {
      store.markGeneralCompletion(userId, form._id, occurrenceKey);
    }

    clearFormProgress(form._id);
    onComplete?.();
  };

  return (
    <FormContext.Provider
      value={{
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
