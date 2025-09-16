import React from "react";
import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { ItemType } from "react-native-dropdown-picker";
import { DropDownContextProvider } from "@/context/useDropdown";
import DropDownTrigger from "./DropDownTrigger";
import DropDownContent from "./DropDownContent";

const DEFAULT_ITEMS: ItemType<any>[] = [
  { label: "Option A", value: "option-a" },
  { label: "Option B", value: "option-b" },
  { label: "Option C", value: "option-c" },
];

interface DropDownTestHarnessProps {
  items?: ItemType<any>[];
  wrapInScrollView?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Utility component that mirrors the dropdown usage patterns found in the app so
 * that engineers can manually exercise the toggle behaviour during debugging.
 * The harness intentionally keeps the Collapsible implementation so we can
 * validate measurement and layout updates in both plain and ScrollView
 * scenarios.
 */
const DropDownTestHarness: React.FC<DropDownTestHarnessProps> = ({
  items = DEFAULT_ITEMS,
  wrapInScrollView = true,
  containerStyle,
}) => {
  const content = (
    <View style={[{ gap: 12 }, containerStyle]}>
      <DropDownTrigger />
      <DropDownContent />
    </View>
  );

  return (
    <DropDownContextProvider items={items} onSelect={() => {}}>
      {wrapInScrollView ? (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} nestedScrollEnabled>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </DropDownContextProvider>
  );
};

export default DropDownTestHarness;
