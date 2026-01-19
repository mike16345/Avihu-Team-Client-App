import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormPresetType } from "@/interfaces/FormPreset";

type FormProgress = {
  previousSectionId?: string;
  previousSectionIndex?: number;
  currentSectionId?: string;
  currentSectionIndex?: number;
  answers: Record<string, unknown>;
  lastUpdatedAt: string;
};

type CompletionByUserId = Record<string, boolean>;
type MonthlyCompletionByUserId = Record<string, Record<string, Record<string, boolean>>>;
type GeneralCompletionByUserId = Record<string, Record<string, Record<string, boolean>>>;

type NotificationLedger = Record<
  string,
  Record<string, Record<string, { shownAt: string; notificationId?: string }>>
>;

interface FormStore {
  activeFormId: string | null;
  setActiveFormId: (formId: string | null) => void;
  progressByFormId: Record<string, FormProgress>;
  setFormProgress: (formId: string, progress: FormProgress) => void;
  updateFormProgress: (formId: string, updates: Partial<FormProgress>) => void;
  clearFormProgress: (formId: string) => void;
  onboardingCompletedByUserId: CompletionByUserId;
  markOnboardingCompleted: (userId: string) => void;
  agreementSignedByUserId: CompletionByUserId;
  markAgreementSigned: (userId: string) => void;
  monthlyCompletionByUserId: MonthlyCompletionByUserId;
  generalCompletionByUserId: GeneralCompletionByUserId;
  markMonthlyCompletion: (userId: string, formId: string, monthKey: string) => void;
  markGeneralCompletion: (userId: string, formId: string, dateKey: string) => void;
  shownNotifications: NotificationLedger;
  markNotificationShown: (
    userId: string,
    formId: string,
    occurrenceKey: string,
    notificationId?: string
  ) => void;
  hasShownNotification: (userId: string, formId: string, occurrenceKey: string) => boolean;
  isFormCompleted: (
    formType: FormPresetType,
    userId: string,
    formId: string,
    occurrenceKey?: string
  ) => boolean;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      activeFormId: null,
      setActiveFormId: (formId) => set({ activeFormId: formId }),
      progressByFormId: {},
      setFormProgress: (formId, progress) =>
        set((state) => ({
          progressByFormId: { ...state.progressByFormId, [formId]: progress },
        })),
      updateFormProgress: (formId, updates) =>
        set((state) => ({
          progressByFormId: {
            ...state.progressByFormId,
            [formId]: {
              answers: state.progressByFormId[formId]?.answers || {},
              lastUpdatedAt: new Date().toISOString(),
              ...state.progressByFormId[formId],
              ...updates,
            },
          },
        })),
      clearFormProgress: (formId) =>
        set((state) => {
          const next = { ...state.progressByFormId };
          delete next[formId];
          return { progressByFormId: next };
        }),
      onboardingCompletedByUserId: {},
      markOnboardingCompleted: (userId) =>
        set((state) => ({
          onboardingCompletedByUserId: {
            ...state.onboardingCompletedByUserId,
            [userId]: true,
          },
        })),
      agreementSignedByUserId: {},
      markAgreementSigned: (userId) =>
        set((state) => ({
          agreementSignedByUserId: {
            ...state.agreementSignedByUserId,
            [userId]: true,
          },
        })),
      monthlyCompletionByUserId: {},
      generalCompletionByUserId: {},
      markMonthlyCompletion: (userId, formId, monthKey) =>
        set((state) => ({
          monthlyCompletionByUserId: {
            ...state.monthlyCompletionByUserId,
            [userId]: {
              ...(state.monthlyCompletionByUserId[userId] || {}),
              [formId]: {
                ...(state.monthlyCompletionByUserId[userId]?.[formId] || {}),
                [monthKey]: true,
              },
            },
          },
        })),
      markGeneralCompletion: (userId, formId, dateKey) =>
        set((state) => ({
          generalCompletionByUserId: {
            ...state.generalCompletionByUserId,
            [userId]: {
              ...(state.generalCompletionByUserId[userId] || {}),
              [formId]: {
                ...(state.generalCompletionByUserId[userId]?.[formId] || {}),
                [dateKey]: true,
              },
            },
          },
        })),
      shownNotifications: {},
      markNotificationShown: (userId, formId, occurrenceKey, notificationId) =>
        set((state) => ({
          shownNotifications: {
            ...state.shownNotifications,
            [userId]: {
              ...(state.shownNotifications[userId] || {}),
              [formId]: {
                ...(state.shownNotifications[userId]?.[formId] || {}),
                [occurrenceKey]: {
                  shownAt: new Date().toISOString(),
                  notificationId,
                },
              },
            },
          },
        })),
      hasShownNotification: (userId, formId, occurrenceKey) =>
        !!get().shownNotifications[userId]?.[formId]?.[occurrenceKey],
      isFormCompleted: (formType, userId, formId, occurrenceKey) => {
        if (formType === "onboarding") {
          return !!get().onboardingCompletedByUserId[userId];
        }

        if (formType === "monthly") {
          if (!occurrenceKey) return false;
          return !!get().monthlyCompletionByUserId[userId]?.[formId]?.[occurrenceKey];
        }

        if (!occurrenceKey) return false;
        return !!get().generalCompletionByUserId[userId]?.[formId]?.[occurrenceKey];
      },
    }),
    {
      name: "form-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeFormId: state.activeFormId,
        progressByFormId: state.progressByFormId,
        onboardingCompletedByUserId: state.onboardingCompletedByUserId,
        monthlyCompletionByUserId: state.monthlyCompletionByUserId,
        generalCompletionByUserId: state.generalCompletionByUserId,
        shownNotifications: state.shownNotifications,
      }),
    }
  )
);
