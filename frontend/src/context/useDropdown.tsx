import { selectionHaptic } from "@/utils/haptics";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { ItemType } from "react-native-dropdown-picker";

type DropdownContextType = {
  items: ItemType<any>[];
  selectedValue: any;
  setSelectedValue: (value: any) => void;
  shouldCollapse: boolean;
  setShouldCollapse: Dispatch<SetStateAction<boolean>>;
  handleSelect: (value: any) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const DropDownContextProvider = ({
  children,
  items,
  initialValue = null,
  onSelect,
}: {
  children: ReactNode;
  items: ItemType<any>[];
  initialValue?: any;
  onSelect: (value: any) => void;
}) => {
  const [selectedValue, setSelectedValue] = useState<any>(
    initialValue ?? (items.length > 0 ? items[0].value : null)
  );

  const [shouldCollapse, setShouldCollapse] = useState(true);

  const handleSelect = (value: any) => {
    selectionHaptic();
    setSelectedValue(value);
    setShouldCollapse(true);
    onSelect(value);
  };

  return (
    <DropdownContext.Provider
      value={{
        items,
        selectedValue,
        setSelectedValue,
        shouldCollapse,
        setShouldCollapse,
        handleSelect,
      }}
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
