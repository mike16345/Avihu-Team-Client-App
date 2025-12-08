import React, { ReactNode, useCallback, useMemo } from "react";
import SectionWheelPicker from "../ui/SectionWheelPicker";
import { WheelPickerProps, WheelPickerOption } from "@/types/wheelPickerTypes";
import useStyles from "@/styles/useGlobalStyles";
import { StyleProp, View, ViewStyle } from "react-native";
import { ConditionalRender } from "../ui/ConditionalRender";
import { Text } from "../ui/Text";

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
  disabled?: boolean;
  label?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const WeightWheelPicker: React.FC<WeightWheelPickerProps> = ({
  minWeight,
  maxWeight,
  stepSize = 1,
  decimalStepSize = 1,
  decimalRange = 100,
  label = "משקל",
  showZeroDecimal = true,
  selectedWeight,
  onValueChange,
  height,
  itemHeight,
  disabled = false,
  activeItemColor,
  inactiveItemColor,
  style,
}) => {
  const { common, layout, spacing, text } = useStyles();

  const dividend = 10;
  const wholePart = Math.floor(selectedWeight);

  const decimalPart = showZeroDecimal
    ? selectedWeight - wholePart
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
        value: decimal < 10 && showZeroDecimal ? `.0${decimal}` : `.${decimal}`,
        label: `.${decimal < 10 && showZeroDecimal ? `0${decimal}` : `${decimal}`}`,
      });
    }

    return options;
  };

  const wholeWeightOptions = useMemo(generateWholeWeightOptions, [minWeight, maxWeight, stepSize]);
  const decimalWeightOptions = useMemo(generateDecimalWeightOptions, [
    decimalRange,
    decimalStepSize,
    decimalRange,
  ]);

  const handleValueChange = useCallback(
    (values: any[]) => {
      const wholeValue = values[0];
      const decimalValue = showZeroDecimal ? Number(values[1]) : Number(values[1]) / 10;

      onValueChange(wholeValue + decimalValue);
    },
    [showZeroDecimal]
  );

  const wheelPickerPropsArray: WheelPickerProps[] = [
    {
      data: decimalWeightOptions,
      selectedValue: decimalPart.toFixed(2),
      onValueChange: (value) => {
        handleValueChange([wholePart, value]);
      },
      onValueCommit: (value) => {
        handleValueChange([wholePart, value]);
      },
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
    },
    {
      data: wholeWeightOptions,
      selectedValue: wholePart,
      onValueChange: (value) => {
        handleValueChange([value, decimalPart.toFixed(2)]);
      },
      onValueCommit: (value) => {
        handleValueChange([value, decimalPart.toFixed(2)]);
      },
      height,
      itemHeight,
      activeItemColor,
      inactiveItemColor,
    },
  ];

  return (
    <View style={spacing.gapXl}>
      <ConditionalRender condition={typeof label == "string"}>
        <Text fontSize={20} fontVariant="semibold" style={[text.textCenter]}>
          {label}
        </Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof label !== "string"}>{label}</ConditionalRender>

      <View
        style={[
          common.borderXsm,
          spacing.pdHorizontalDefault,
          spacing.pdVerticalXs,
          common.rounded,
          layout.center,
          { opacity: disabled ? 0.4 : 1 },
          style,
        ]}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <SectionWheelPicker
          data={wheelPickerPropsArray}
          selectedValues={[decimalPart.toFixed(2), wholePart]}
          onValueChange={handleValueChange}
        />
      </View>
    </View>
  );
};

export default WeightWheelPicker;
