import React from "react";
import HorizontalSelector from "@/components/ui/HorizontalSelector";
import { useSpacingStyles } from "@/styles/useSpacingStyles";

interface RangeSelectorProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ options, value, onChange }) => {
  const { pdHorizontalLg } = useSpacingStyles();

  return (
    <HorizontalSelector
      items={options}
      selected={value || ""}
      onSelect={onChange}
      style={pdHorizontalLg}
    />
  );
};

export default RangeSelector;
