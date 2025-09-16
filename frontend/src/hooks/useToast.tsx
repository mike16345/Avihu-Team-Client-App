import { IToast } from "@/interfaces/toast";
import { useToastStore } from "@/store/toastStore";
import { errorNotificationHaptic, successNotificationHaptic } from "@/utils/haptics";

export type ToastInput = Omit<IToast, "type">;

export const useToast = () => {
  const { showToast, showModalToast } = useToastStore();

  const triggerSuccessToast = ({
    title = "הצלחה",
    message = "פעולה בוצעה בהצלחה",
    duration,
    isModalToast,
  }: ToastInput) => {
    successNotificationHaptic();
    if (isModalToast) {
      showModalToast({
        title,
        message,
        duration,
        type: "success",
      });
    } else {
      showToast({
        title,
        message,
        duration,
        type: "success",
      });
    }
  };

  const triggerErrorToast = ({
    title = "שגיאה",
    message = "פעולה נכשלה",
    duration,
    isModalToast = false,
  }: ToastInput) => {
    errorNotificationHaptic();
    if (isModalToast) {
      showModalToast({
        title,
        message,
        duration,
        type: "error",
      });
    } else {
      showToast({
        title,
        message,
        duration,
        type: "error",
      });
    }
  };

  return { triggerErrorToast, triggerSuccessToast };
};
