import React from "react";
import SectionWheelPicker from "../ui/SectionWheelPicker";
import { WheelPickerProps, WheelPickerOption } from "@/types/wheelPickerTypes";

interface WeightWheelPickerProps {
  minWeight: number;
  maxWeight: number;
  stepSize?: number;
  decimalStepSize?: number;
  decimalRange?: number;
  showZeroDecimal?: boolean;
  selectedWeight: number;
  onValueChange: (weight: number) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor: string;
  inactiveItemColor: string;
  label?: string;
}

const WeightWheelPicker: React.FC<WeightWheelPickerProps> = ({
  minWeight,
  maxWeight,
  stepSize = 1,
  decimalStepSize = 1,
  decimalRange = 100,
  label = "",
  showZeroDecimal = true,
  selectedWeight,
  onValueChange,
  height,
  itemHeight,
  activeItemColor,
  inactiveItemColor,
}) => {
  const dividend = showZeroDecimal ? 100 : 10;
  const wholePart = Math.floor(selectedWeight);
  const decimalPart = showZeroDecimal
    ? Math.round((selectedWeight - wholePart) * dividend)
    : (selectedWeight - wholePart) * dividend;

  const generateWholeWeightOptions = (): WheelPickerOption[] => {
    const options: WheelPickerOption[] = [];

    for (let weight = minWeight; weight <= maxWeight; weight += stepSize) {
      options.push({ value: weight, label: `${weight} kg` });
    }

    return options;
  };

  const generateDecimalWeightOptions = (): WheelPickerOption[] => {
    const options: WheelPickerOption[] = [];

    for (let decimal = 0; decimal < decimalRange; decimal += decimalStepSize) {
      options.push({
        value: decimal < 10 && showZeroDecimal ? `0${decimal}` : `${decimal}`,
        label: `.${decimal < 10 && showZeroDecimal ? `0${decimal}` : `${decimal}`}`,
      });
    }
    return options;
  };

  const wholeWeightOptions = generateWholeWeightOptions();
  const decimalWeightOptions = generateDecimalWeightOptions();

  const handleValueChange = (values: any[]) => {
    const wholeValue = values[0];
    const decimalValue = showZeroDecimal ? Number(values[1]) / 100 : Number(values[1]) / 10;

    onValueChange(wholeValue + decimalValue);
  };

  const wheelPickerPropsArray: WheelPickerProps[] = [
    {
      data: wholeWeightOptions,
      selectedValue: wholePart,
      onValueChange: (value) => {
        handleValueChange([value, decimalPart]);
      },
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
      activeItemBackgroundStyle,
    },
    {
      data: decimalWeightOptions,
      selectedValue: decimalPart,
      onValueChange: (value) => {
        handleValueChange([wholePart, value]);
      },
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
      activeItemBackgroundStyle,
      label: label,
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
