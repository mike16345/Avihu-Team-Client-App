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
  activeItemColor: string;
  inactiveItemColor: string;
  label?: string;
};

export type SectionWheelPickerProps = {
  data: WheelPickerProps[];
  selectedValues: any[];
  onValueChange: (values: any[], indices: number[]) => void;
};
