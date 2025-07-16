import { IToast } from "@/interfaces/toast";
import { useToastStore } from "@/store/toastStore";

export const useToast = () => {
  const { showToast } = useToastStore();

  const triggerSuccessToast = ({ title, message, duration }: Omit<IToast, "type">) => {
    showToast({
      title: title || "הצלחה",
      message,
      duration,
      type: "success",
    });
  };

  const triggerErrorToast = ({ title, message, duration }: Omit<IToast, "type">) => {
    showToast({
      title: title || "שגיאה",
      message,
      duration,
      type: "error",
    });
  };

  return { triggerErrorToast, triggerSuccessToast };
};
