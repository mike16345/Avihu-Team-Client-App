import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Toast from "@/components/ui/Toast";

type ToastType = "success" | "info" | "warning" | "error";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: ToastType }>({
    message: "",
    visible: false,
    type: "info",
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    showToast("Warning", "warning");
    // Show success toast after 1 second
    setTimeout(() => {
      showToast("Success", "success");
    }, 1000);
    // Show error toast after 2 seconds
    setTimeout(() => {
      showToast("Error", "error");
    }, 2000);
    // Show info toast after 3 seconds
    setTimeout(() => {
      showToast("Info", "info");
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
