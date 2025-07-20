import { View, Text, Platform } from "react-native";
import React from "react";
import { ConditionalRender } from "./ConditionalRender";
import FrameShadow from "./FrameShadow";
import DropdownMenu, { DropDownMenuProps } from "./DropdownMenu";

const CustomDropdown: React.FC<DropDownMenuProps> = (props) => {
  return (
    <>
      <ConditionalRender condition={Platform.OS == "ios"}>
        <FrameShadow>
          <DropdownMenu {...props} />
        </FrameShadow>
      </ConditionalRender>

      <ConditionalRender condition={Platform.OS == "android"}>
        <DropdownMenu {...props} />
      </ConditionalRender>
    </>
  );
};

export default CustomDropdown;
