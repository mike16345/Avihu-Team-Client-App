import React from "react";
import SectionWheelPicker from "../ui/SectionWheelPicker";
import { WheelPickerProps, WheelPickerOption } from "@/types/wheelPickerTypes";

interface WeightWheelPickerProps {
  minWeight: number;
  maxWeight: number;
  stepSize?: number;
  selectedWeight: number;
  onValueChange: (weight: number) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor: string;
  inactiveItemColor: string;
}

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
  const wholePart = Math.floor(selectedWeight);
  const decimalPart = Math.round((selectedWeight - wholePart) * 100);

  const generateWholeWeightOptions = (): WheelPickerOption[] => {
    const options: WheelPickerOption[] = [];

    for (let weight = minWeight; weight <= maxWeight; weight += stepSize) {
      options.push({ value: weight, label: `${weight} kg` });
    }

    return options;
  };

  const generateDecimalWeightOptions = (): WheelPickerOption[] => {
    const options: WheelPickerOption[] = [];

    for (let decimal = 0; decimal < 100; decimal++) {
      options.push({
        value: decimal < 10 ? `0${decimal}` : `${decimal}`,
        label: `.${decimal < 10 ? `0${decimal}` : `${decimal}`}`,
      });
    }

    return options;
  };

  const wholeWeightOptions = generateWholeWeightOptions();
  const decimalWeightOptions = generateDecimalWeightOptions();

  const handleValueChange = (values: any[]) => {
    const wholeValue = values[0];
    const decimalValue = Number(values[1]) / 100;

    onValueChange(wholeValue + decimalValue);
  };

  const wheelPickerPropsArray: WheelPickerProps[] = [
    {
      data: wholeWeightOptions,
      selectedValue: wholePart,
      onValueChange: (value) => handleValueChange([value, decimalPart]),
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
    },
    {
      data: decimalWeightOptions,
      selectedValue: decimalPart,
      onValueChange: (value) => handleValueChange([wholePart, value]),
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
      label: 'ק"ג',
    },
  ];

  return (
    <SectionWheelPicker
      data={wheelPickerPropsArray}
      selectedValues={[wholePart, decimalPart]}
      onValueChange={handleValueChange}
    />
  );
};

export default WeightWheelPicker;
