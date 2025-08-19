import { ScrollView } from "react-native";
import { useDropwDownContext } from "@/context/useDropdown";
import DropDownItem from "./DropDownItem";
import { ConditionalRender } from "../ConditionalRender";
import { Text } from "../Text";
import useTextStyles from "@/styles/useTextStyles";

interface DropDownListProps {
  handleSelect: (val: any) => void;
}

const DropDownList: React.FC<DropDownListProps> = ({ handleSelect }) => {
  const { textCenter } = useTextStyles();

  const { selectedValue, items } = useDropwDownContext();

  const itemsAreEmpty = items.length === 0;

  return (
    <ScrollView style={{ maxHeight: 200 }}>
      <ConditionalRender condition={itemsAreEmpty}>
        <Text style={textCenter}>אין פריטים</Text>
      </ConditionalRender>

      <ConditionalRender condition={!itemsAreEmpty}>
        {items.map(({ label, value }, i) => {
          const isSelected = selectedValue === value || selectedValue === label;

          return (
            <DropDownItem
              key={i}
              item={{ label, value }}
              isSelected={isSelected}
              handlePress={handleSelect}
            />
          );
        })}
      </ConditionalRender>
    </ScrollView>
  );
};

export default DropDownList;
