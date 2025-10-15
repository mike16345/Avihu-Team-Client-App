import { ReactNode } from "react";

export type WheelPickerOption = {
  value: any;
  label?: string;
};

export type WheelPickerProps = {
  data: WheelPickerOption[];
  selectedValue: any;
  onValueChange: (value: any) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor?: string;
  inactiveItemColor?: string;
  label?: ReactNode;
  disabled?: boolean;
  onValueCommit?: (value: number | string) => void; // fires when scroll settles
  throttleMs?: number; // default ~80ms for live updates
  hapticOnCommit?: boolean; // default true
};

export type SectionWheelPickerProps = {
  data: WheelPickerProps[];
  selectedValues: any[];
  onValueChange: (values: any[], indices: number[]) => void;
};
