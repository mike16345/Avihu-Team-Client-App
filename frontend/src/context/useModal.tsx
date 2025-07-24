import { createContext, ReactNode, useContext } from "react";

type ModalContextType = {
  onDismiss: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalContextProvider = ({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) => {
  return <ModalContext.Provider value={{ onDismiss }}>{children}</ModalContext.Provider>;
};

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within a ModalContextProvider");
  }

  return context;
};
