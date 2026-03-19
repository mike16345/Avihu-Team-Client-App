import React from "react";
import { View } from "react-native";
import Checkbox from "@/components/ui/Checkbox";
import useStyles from "@/styles/useGlobalStyles";

interface CheckboxGroupProps {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, values, onChange }) => {
  const { spacing } = useStyles();

  const toggleValue = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }
    onChange([...values, option]);
  };

  return (
    <View style={[spacing.gapSm]}>
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          isChecked={values.includes(option)}
          onCheck={() => toggleValue(option)}
        />
      ))}
    </View>
  );
};

export default CheckboxGroup;
