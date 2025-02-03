import { FC, SetStateAction, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";

DropDownPicker.addTranslation("HE", {
  PLACEHOLDER: "בחר אימון",
  SEARCH_PLACEHOLDER: "חפש אימון",
  SELECTED_ITEMS_COUNT_TEXT: "{count} éléments ont été sélectionnés",
  NOTHING_TO_SHOW: "אין נתונים להצגה",
});

DropDownPicker.setLanguage("HE");

interface IOption {
  label: string;
  value: string;
}

interface WorkoutDropdownSelectorProps {
  onSelect: (value: string) => void;
  items: IOption[];
  value: string;
  setValue: React.Dispatch<SetStateAction<any>>;
}

const WorkoutDropdownSelector: FC<WorkoutDropdownSelectorProps> = ({
  onSelect,
  value,
  setValue,
  items,
}) => {
  const { colors, text } = useStyles();
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <>
      <DropDownPicker
        rtl
        open={openDropdown}
        value={value}
        setValue={setValue}
        itemSeparator
        dropDownContainerStyle={{ maxHeight: "auto" }}
        closeAfterSelecting
        items={items}
        style={[colors.backgroundSecondaryContainer]}
        listItemContainerStyle={[colors.backgroundSecondaryContainer]}
        theme="DARK"
        setOpen={setOpenDropdown}
        labelStyle={text.textRight}
        listItemLabelStyle={text.textRight}
        onSelectItem={(val) => onSelect(val.value as string)}
      />
    </>
  );
};

export default WorkoutDropdownSelector;
