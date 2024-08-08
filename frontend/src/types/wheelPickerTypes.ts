export type WheelPickerProps = {
  data: WheelPickerOption[];
  selectedValue: any;
  onValueChange: (value: any) => void;
  height?: number;
  itemHeight?: number;
  activeItemStyle: StyleSheet;
  inactiveItemColor: StyleSheet;
};

export type SectionWheelPickerProps = {
  data: { data: WheelPickerOption[] }[];
  selectedValues: any[];
  onValueChange: (values: any[], indices: number[]) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor: StyleSheet;
  inactiveItemColor: StyleSheet;
};

export type WheelPickerOption = {
  value: any;
  label?: string;
};
