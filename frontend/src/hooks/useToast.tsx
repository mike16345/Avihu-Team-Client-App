import { IToast } from "@/interfaces/toast";
import { useToastStore } from "@/store/toastStore";

export type ToastInput = Omit<IToast, "type">;

export const useToast = () => {
  const { showToast } = useToastStore();

  const triggerSuccessToast = ({
    title = "הצלחה",
    message = "פעולה בוצעה בהצלחה",
    duration,
  }: ToastInput) => {
    showToast({
      title,
      message,
      duration,
      type: "success",
    });
  };

  const triggerErrorToast = ({
    title = "שגיאה",
    message = "פעולה נכשלה",
    duration,
  }: ToastInput) => {
    showToast({
      title,
      message,
      duration,
      type: "error",
    });
  };

  return { triggerErrorToast, triggerSuccessToast };
};
