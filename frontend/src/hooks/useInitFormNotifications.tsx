import { useUserStore } from "@/store/userStore";
import { useFormStore } from "@/store/formStore";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TODAYS_GENERAL_FORM_PRESET_KEY } from "@/constants/reactQuery";
import { FormPreset } from "@/interfaces/FormPreset";
import { useFormPresetsApi } from "./api/useFormPresetsApi";
import { getOccurrenceKeyForForm } from "@/utils/formPresets";
import { useNotificationStore } from "@/store/notificationStore";

const useInitFormNotifications = () => {
  const queryClient = useQueryClient();

  const { getMonthlyFormStatus, getGeneralFormForToday } = useFormPresetsApi();

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
        const status = await getMonthlyFormStatus();

        if (
          status.shouldShowMonthlyForm &&
          status.presetId &&
          status.occurrenceKey &&
          !isFormCompleted("monthly", currentUser._id, status.presetId, status.occurrenceKey)
        ) {
          addMonthlyFormNotification(status.presetId);
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
