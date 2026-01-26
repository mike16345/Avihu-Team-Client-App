import { useUserStore } from "@/store/userStore";
import { useFormStore } from "@/store/formStore";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FORM_PRESETS_KEY, TODAYS_GENERAL_FORM_PRESET_KEY } from "@/constants/reactQuery";
import { useFormResponseApi } from "./api/useFormResponseApi";
import { useFormPresetsApi } from "./api/useFormPresetsApi";
import { FormPreset } from "@/interfaces/FormPreset";
import { getOccurrenceKeyForForm } from "@/utils/formPresets";
import { useNotificationStore } from "@/store/notificationStore";

const useInitFormNotifications = () => {
  const queryClient = useQueryClient();

  const { getFormResponses } = useFormResponseApi();
  const { getFormPresets, getGeneralFormForToday } = useFormPresetsApi();

  const currentUser = useUserStore((state) => state.currentUser);

  const isFormCompleted = useFormStore((state) => state.isFormCompleted);
  const addGeneralFormNotification = useNotificationStore(
    (state) => state.addGeneralFormNotification
  );
  const addMonthlyFormNotification = useNotificationStore(
    (state) => state.addMonthlyFormNotification
  );

  const ranForUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const performChecks = async () => {
      if (!currentUser?._id) return;

      if (ranForUserIdRef.current === currentUser._id) return;
      ranForUserIdRef.current = currentUser._id;

      try {
        const monthlySubmissions = await getFormResponses({
          userId: currentUser._id,
          formType: "monthly",
        });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const hasSubmittedThisMonth = (monthlySubmissions || []).some((sub) => {
          const d = new Date(sub.submittedAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

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

            if (monthlyOccurrenceKey) {
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
        }
      } catch (error) {
        console.error("Error fetching monthly form notifications:", error);
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
  }, [currentUser?._id]);
};

export default useInitFormNotifications;
