import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "./ConditionalRender";

export interface DropDownMenuProps {
  selectedValue?: string;
  onSelect: (selected: any) => void;
  items: ItemType<any>[];
}

const DropdownMenu: React.FC<DropDownMenuProps> = ({ items, onSelect, selectedValue }) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const [open, setOpen] = useState(false);

  const handleSelect = (value: any) => {
    onSelect(value);
    setOpen(false);
  };

  const selectedItemLabel = selectedValue || "בחר";

  return (
    <View style={{ position: "relative" }}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        closeOnBackPressed
        items={items}
        listMode="SCROLLVIEW"
        bottomOffset={10}
        placeholder={selectedItemLabel}
        placeholderStyle={[text.textLeft, spacing.pdHorizontalLg]}
        style={[
          colors.outline,
          {
            borderBottomEndRadius: 8,
            borderBottomStartRadius: 8,
            borderTopEndRadius: 8,
            borderTopStartRadius: 8,
          },
        ]}
        dropDownContainerStyle={[
          colors.backgroundSecondary,
          colors.borderOnPrimary,
          common.rounded,
          common.borderSm,
          spacing.mgVerticalDefault,
          {
            elevation: 3,
            borderTopEndRadius: 10,
            borderTopStartRadius: 10,
            borderBottomEndRadius: 10,
            borderBottomStartRadius: 10,
            zIndex: 3,
            maxHeight: 200,
          },
        ]}
        renderListItem={({ label, value }) => (
          <TouchableOpacity
            onPress={() => handleSelect(value)}
            style={[{ padding: 10 }, layout.flexRow, layout.justifyBetween]}
          >
            <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
              <View
                style={[{ height: 8, width: 8 }, colors.backgroundSuccess, common.roundedFull]}
              />
              <Text>{label}</Text>
            </View>
            <ConditionalRender condition={value === selectedValue}>
              <Icon name="check" />
            </ConditionalRender>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <TouchableOpacity
            style={[spacing.pdDefault, layout.center]}
            onPress={() => setOpen(false)}
          >
            <Text>אין פריטים</Text>
          </TouchableOpacity>
        )}
      />

      <View
        style={[
          {
            height: 8,
            width: 8,
            position: "absolute",
            left: 15,
            top: 21,
            zIndex: 5000,
          },
          colors.backgroundSuccess,
          common.roundedFull,
        ]}
      />
    </View>
  );
};

export default DropdownMenu;
