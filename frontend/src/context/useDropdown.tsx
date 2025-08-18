import { createContext, ReactNode, useContext, useState } from "react";
import { ItemType } from "react-native-dropdown-picker";

type DropdownContextType = {
  items: ItemType<any>[];
  selectedValue: any;
  setSelectedValue: (value: any) => void;
  shouldCollapse: boolean;
  setShouldCollapse: (value: boolean) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const DropDownContextProvider = <T,>({
  children,
  items,
  initialValue = null,
}: {
  children: ReactNode;
  items: ItemType<any>[];
  initialValue?: any;
}) => {
  const [selectedValue, setSelectedValue] = useState<any>(
    initialValue ?? (items.length > 0 ? items[0].value : null)
  );

  const [shouldCollapse, setShouldCollapse] = useState(true);

  return (
    <DropdownContext.Provider
      value={{ items, selectedValue, setSelectedValue, shouldCollapse, setShouldCollapse }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropwDownContext = () => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("useDropwDownContext must be used within a DropDownContextProvider");
  }

  return context as DropdownContextType;
};
