import React, { useState } from "react";
import WheelPicker from "../ui/WheelPicker";

type WeightWheelPickerProps = {
  minWeight: number;
  maxWeight: number;
  stepSize?: number;
  selectedWeight: number;
  onValueChange: (weight: number) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor: string;
  inactiveItemColor: string;
};

const WeightWheelPicker: React.FC<WeightWheelPickerProps> = ({
  minWeight,
  maxWeight,
  stepSize = 1,
  selectedWeight,
  onValueChange,
  height,
  itemHeight,
  activeItemColor,
  inactiveItemColor,
}) => {
  const generateWeightOptions = () => {
    const options: { value: number; label?: string }[] = [];

    for (let weight = minWeight; weight <= maxWeight; weight += stepSize) {
      options.push({ value: weight, label: `kg` });
    }

    return options;
  };

  const [weightOptions] = useState(generateWeightOptions());
  const selectedIndex = weightOptions.findIndex((option) => option.value === selectedWeight);

  return (
    <WheelPicker
      data={weightOptions}
      selectedValue={selectedWeight}
      onValueChange={onValueChange}
      height={height}
      itemHeight={itemHeight}
      activeItemColor={activeItemColor}
      inactiveItemColor={inactiveItemColor}
      label="kg"
    />
  );
};

export default WeightWheelPicker;
