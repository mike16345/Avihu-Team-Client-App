import { View } from "react-native";
import { useToastStore } from "@/store/toastStore";
import Toast from "./Toast";
import useStyles from "@/styles/useGlobalStyles";
import { IToast } from "@/interfaces/toast";
import { FC } from "react";

interface ToastContainerProps {
  modalToasts?: IToast[];
}

const ToastContainer: FC<ToastContainerProps> = ({ modalToasts }) => {
  const { layout, spacing } = useStyles();

  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const toastsToUse = modalToasts || toasts;
  if (!toastsToUse || toastsToUse.length == 0) return;

  return (
    <View
      style={[
        layout.widthFull,
        layout.flexColumn,
        layout.justifyEnd,
        layout.itemsCenter,
        spacing.gapDefault,
        { position: "absolute", bottom: 100, left: modalToasts ? 15 : 0 },
      ]}
    >
      {toastsToUse.slice(-3).map((toast) => (
        <Toast key={toast.id} toast={toast} onDismissToast={() => removeToast(toast.id || "")} />
      ))}
    </View>
  );
};

export default ToastContainer;
