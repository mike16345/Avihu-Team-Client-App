import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";

const SelectUploadType = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const uploadTypes = [
    {
      title: `פתיחת מצלמה`,
      iconName: `camera`,
    },
    {
      title: `בחר תמונה קיימת`,
      iconName: "upload",
    },
  ];

  return (
    <View style={[spacing.gapXxl, layout.heightFull, { direction: "rtl" }]}>
      <Text style={[text.textLeft, fonts.xl, colors.textOnBackground, text.textBold]}>
        בחר צורת העלאה
      </Text>
      <View style={[spacing.gapLg, spacing.pdVerticalXxl]}>
        {uploadTypes.map(({ iconName, title }, i) => (
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
            <NativeIcon
              library="FontAwesome"
              name={iconName}
              style={[colors.textPrimary, fonts.xl]}
            />
            <Text style={[fonts.default]}>{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SelectUploadType;
