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
        listMode="FLATLIST"
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
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
            zIndex: 2000,
            elevation: 2000,
          },
        ]}
        dropDownContainerStyle={[
          colors.backgroundSecondary,
          colors.borderOnPrimary,
          common.rounded,
          common.borderSm,
          spacing.mgVerticalLg,
          {
            zIndex: 3000,
            elevation: 3000,
            position: "absolute",
            borderTopEndRadius: 10,
            borderTopStartRadius: 10,
            borderBottomEndRadius: 10,
            borderBottomStartRadius: 10,
            maxHeight: 200,
          },
        ]}
        renderListItem={({ label, value }) => {
          const isSelected = selectedValue === value || selectedValue === label;

          return (
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

              <ConditionalRender condition={isSelected}>
                <Icon name="check" />
              </ConditionalRender>
            </TouchableOpacity>
          );
        }}
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
