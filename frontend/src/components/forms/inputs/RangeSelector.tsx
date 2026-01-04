import React from "react";
import HorizontalSelector from "@/components/ui/HorizontalSelector";

interface RangeSelectorProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}

const RangeSelector: React.FC<RangeSelectorProps> = ({ options, value, onChange }) => {
  return <HorizontalSelector items={options} selected={value || ""} onSelect={onChange} />;
};

export default RangeSelector;
