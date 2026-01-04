import { useEffect } from "react";
import useFormPresets from "@/hooks/queries/useFormPresets";
import useNotification from "@/hooks/useNotification";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import { getOccurrenceKeyForForm } from "@/utils/formPresets";
import { FormPreset } from "@/interfaces/FormPreset";

const buildNotificationBody = (form: FormPreset) => {
  if (form.type === "monthly") {
    return `יש לך שאלון חודשי חדש: ${form.name}`;
  }

  if (form.type === "general") {
    return `טופס חדש מוכן עבורך: ${form.name}`;
  }

  return `טופס חדש: ${form.name}`;
};

const useFormPresetNotifications = () => {
  const { data } = useFormPresets();
  const { showNotification } = useNotification();
  const userId = useUserStore((state) => state.currentUser?._id);
  const {
    markNotificationShown,
    hasShownNotification,
    isFormCompleted,
  } = useFormStore();

  useEffect(() => {
    if (!data || !userId) return;

    const notify = async () => {
      for (const form of data) {
        if (form.type === "monthly" && !form.repeatMonthly) continue;
        if (form.type === "general" && !form.showOn) continue;
        if (form.type === "onboarding") continue;

        const occurrenceKey = getOccurrenceKeyForForm(form);
        if (!occurrenceKey) continue;

        if (isFormCompleted(form.type, userId, form._id, occurrenceKey)) continue;
        if (hasShownNotification(userId, form._id, occurrenceKey)) continue;

        const notificationId = await showNotification(buildNotificationBody(form), null, {
          formId: form._id,
          type: "formPreset",
        });

        markNotificationShown(userId, form._id, occurrenceKey, notificationId);
      }
    };

    notify().catch((error) => console.log(error));
  }, [data, userId, showNotification, hasShownNotification, isFormCompleted, markNotificationShown]);
};

export default useFormPresetNotifications;
