import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import TipsModal from "./TipsModal";
import { Text } from "../ui/Text";

interface TipsProps {
  tips: string[];
}

const Tips: React.FC<TipsProps> = ({ tips }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          colors.backgroundPrimary,
          common.rounded,
          layout.itemsCenter,
          spacing.pdDefault,
          layout.flex1,
          { width: 130 },
        ]}
        onPress={() => setOpen(true)}
      >
        <Text style={[text.textBold, text.textRight, layout.widthFull, fonts.md]}>דגשים</Text>
        <View style={[layout.center, layout.flex1]}>
          <NativeIcon library="FontAwesome5" name="list-ul" size={32} />
        </View>
      </TouchableOpacity>
      <TipsModal tips={tips} isOpen={open} dismiss={() => setOpen(false)} />
    </>
  );
};

export default Tips;
