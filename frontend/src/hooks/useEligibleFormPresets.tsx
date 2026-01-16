import { useMemo } from "react";
import useFormPresets from "@/hooks/queries/useFormPresets";
import { useFormStore } from "@/store/formStore";
import { useUserStore } from "@/store/userStore";
import { getOccurrenceKeyForForm } from "@/utils/formPresets";
import { FormPreset } from "@/interfaces/FormPreset";

const useEligibleFormPresets = () => {
  const { data } = useFormPresets();
  const userId = useUserStore((state) => state.currentUser?._id);
  const { isFormCompleted } = useFormStore();

  return useMemo(() => {
    if (!data || !userId) return [] as FormPreset[];

    return data.filter((form) => {
      if (form.type === "monthly" && !form.repeatMonthly) return false;
      if (form.type === "general" && !form.showOn) return false;

      const occurrenceKey = getOccurrenceKeyForForm(form);
      if (form.type === "onboarding") {
        return !isFormCompleted("onboarding", userId, form._id, occurrenceKey || undefined);
      }

      if (!occurrenceKey) return false;
      return !isFormCompleted(form.type, userId, form._id, occurrenceKey);
    });
  }, [data, userId, isFormCompleted]);
};

export default useEligibleFormPresets;
