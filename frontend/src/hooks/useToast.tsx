import { IToast } from "@/interfaces/toast";
import { useToastStore } from "@/store/toastStore";

type ToastInput = Partial<Omit<IToast, "type">> & { message: string };

export const useToast = () => {
  const { showToast } = useToastStore();

  const triggerSuccessToast = ({ title, message, duration }: ToastInput) => {
    showToast({
      title: title || "הצלחה",
      message,
      duration,
      type: "success",
    });
  };

  const triggerErrorToast = ({ title, message, duration }: ToastInput) => {
    showToast({
      title: title || "שגיאה",
      message,
      duration,
      type: "error",
    });
  };

  return { triggerErrorToast, triggerSuccessToast };
};
