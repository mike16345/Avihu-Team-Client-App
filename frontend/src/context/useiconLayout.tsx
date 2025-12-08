import { createContext, useContext } from "react";

type IconLayoutContextType = {
  setIconLayout: (name: string, x: number) => void;
  getIconLayout: (name: string) => number | undefined;
};

export const IconLayoutContext = createContext<IconLayoutContextType | null>(null);

export const useIconLayout = () => {
  const ctx = useContext(IconLayoutContext);
  if (!ctx) throw new Error("useIconLayout must be used inside IconLayoutProvider");
  return ctx;
};
