import { View } from "react-native";
import { useToastStore } from "@/store/toastStore";
import Toast from "./Toast";
import useStyles from "@/styles/useGlobalStyles";

const ToastContainer = () => {
  const { toasts } = useToastStore();
  const { layout, spacing } = useStyles();

  if (toasts.length == 0) return;

  return (
    <View
      style={[
        layout.widthFull,
        layout.flexColumn,
        layout.justifyEnd,
        spacing.gapDefault,
        { position: "absolute", bottom: 150, left: 0 },
      ]}
    >
      {toasts.slice(-3).map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
      <Toast toast={{ type: "error", duration: 100000, message: "hello", title: "kdjdnd" }} />
    </View>
  );
};

export default ToastContainer;
