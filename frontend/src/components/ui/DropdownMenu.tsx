import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import useStyles from "@/styles/useGlobalStyles";
import FrameShadow from "./FrameShadow";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "./ConditionalRender";

interface DropDownMenuProps {
  selectedValue?: string;
  onSelect: (selected: string) => void;
  items: ItemType<string>[];
}

const DropdownMenu: React.FC<DropDownMenuProps> = ({ items, onSelect, selectedValue }) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  const selectedItemLabel = selectedValue || "בחר";

  return (
    <View style={{ position: "relative" }}>
      <FrameShadow>
        <DropDownPicker
          open={open}
          setOpen={setOpen}
          closeOnBackPressed
          items={items}
          listMode="FLATLIST"
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
              borderTopEndRadius: 10,
              borderTopStartRadius: 10,
              borderBottomEndRadius: 10,
              borderBottomStartRadius: 10,
              zIndex: 3,
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
      </FrameShadow>

      <ConditionalRender condition={!open}>
        <View
          style={[
            {
              height: 8,
              width: 8,
              position: "absolute",
              left: 15,
              top: 21,
            },
            colors.backgroundSuccess,
            common.roundedFull,
          ]}
        />
      </ConditionalRender>
    </View>
  );
};

export default DropdownMenu;
