import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";

const SelectUploadType = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const uploadTypes = [
    {
      title: `צלם תמונה`,
      icon: (
        <NativeIcon library="FontAwesome" name="camera" style={[colors.textPrimary, fonts.xl]} />
      ),
    },
    {
      title: `העלה תמונה`,
      icon: (
        <NativeIcon library="FontAwesome" name="upload" style={[colors.textPrimary, fonts.xl]} />
      ),
    },
  ];

  return (
    <View style={[spacing.gapXxl, layout.heightFull, { direction: "rtl" }]}>
      <Text style={[text.textLeft, fonts.xl, colors.textOnBackground, text.textBold]}>
        בחר צורת העלאה
      </Text>
      <View style={spacing.gapDefault}>
        {uploadTypes.map(({ icon, title }, i) => (
          <TouchableOpacity
            key={i}
            style={[
              layout.flexRow,
              layout.itemsCenter,
              layout.justifyStart,
              colors.backgroundSecondary,
              spacing.gapXxl,
              spacing.pdDefault,
              common.rounded,
            ]}
          >
            {icon}
            <Text style={[fonts.default]}>{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SelectUploadType;
