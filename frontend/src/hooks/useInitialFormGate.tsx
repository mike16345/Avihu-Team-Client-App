import { useUserStore } from "@/store/userStore";
import { useFormStore } from "@/store/formStore";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FORM_PRESETS_KEY,
  ONBOARDING_FORM_PRESET_KEY,
  TODAYS_GENERAL_FORM_PRESET_KEY,
} from "@/constants/reactQuery";
import { useFormResponseApi } from "./api/useFormResponseApi";
import { useFormPresetsApi } from "./api/useFormPresetsApi";
import { FormPreset } from "@/interfaces/FormPreset";
import { getOccurrenceKeyForForm } from "@/utils/formPresets";
import { useNotificationStore } from "@/store/notificationStore";

const useInitialFormGate = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const { isFormCompleted } = useFormStore();
  const queryClient = useQueryClient();
  const didRunRef = useRef(false);
  const { getFormPresets, getGeneralFormForToday } = useFormPresetsApi();
  const { getFormResponses } = useFormResponseApi();
  const { addGeneralFormNotification, addMonthlyFormNotification } = useNotificationStore();

  useEffect(() => {
    const performChecks = async () => {
      if (!currentUser || didRunRef.current) return;
      didRunRef.current = true;

      // 2. Monthly
      const monthlySubmissions = await getFormResponses({
        userId: currentUser._id,
        formType: "monthly",
      });

      const currentMonth = new Date().getMonth();
      const hasSubmittedThisMonth = (monthlySubmissions || []).some(
        (sub) => new Date(sub.submittedAt).getMonth() === currentMonth
      );

      if (!hasSubmittedThisMonth) {
        const presets = await queryClient.fetchQuery<FormPreset[]>({
          queryKey: [FORM_PRESETS_KEY, "monthly"],
          queryFn: () => getFormPresets({ type: "monthly" }),
        });

        const latestMonthlyPreset = (presets || []).sort(
          (a: FormPreset, b: FormPreset) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )[0];

        if (latestMonthlyPreset) {
          const monthlyOccurrenceKey = getOccurrenceKeyForForm(latestMonthlyPreset);
          if (!monthlyOccurrenceKey) return;

          if (
            !isFormCompleted(
              "monthly",
              currentUser._id,
              latestMonthlyPreset._id,
              monthlyOccurrenceKey
            )
          ) {
            addMonthlyFormNotification(latestMonthlyPreset._id);
          }
        }
      }

      // 3. Daily
      try {
        const dailyForm = await queryClient.fetchQuery<FormPreset>({
          queryKey: [TODAYS_GENERAL_FORM_PRESET_KEY],
          queryFn: getGeneralFormForToday,
          staleTime: 1000,
        });

        console.warn("dailyForm", dailyForm);
        if (dailyForm) {
          const occurrenceKey = getOccurrenceKeyForForm(dailyForm);
          if (!occurrenceKey) return;

          if (!isFormCompleted("general", currentUser._id, dailyForm._id, occurrenceKey)) {
            addGeneralFormNotification(dailyForm._id);
          }
        }
      } catch (error) {
        console.error("Error fetching daily form:", error);
      }
    };

    performChecks();
  }, [currentUser]);

  // Effect to invalidate onboarding form query once completed
  useEffect(() => {
    if (currentUser?.completedOnboarding) {
      queryClient.invalidateQueries({ queryKey: [ONBOARDING_FORM_PRESET_KEY] });
    }
  }, [currentUser?.completedOnboarding, queryClient]);
};

export default useInitialFormGate;
