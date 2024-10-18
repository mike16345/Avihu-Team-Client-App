import useStyles from "@/styles/useGlobalStyles";
import { ImagePickerResult } from "expo-image-picker";
import React from "react";
import { Image, Text, View } from "react-native";
import { Button } from "react-native-paper";

interface ImagePreviewProps {
  image: ImagePickerResult;
  close: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, close }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  return (
    <View style={[spacing.gapDefault]}>
      <Text style={[text.textLeft, fonts.xl, colors.textOnBackground, text.textBold]}>
        תמונה שנבחרה
      </Text>
      <Image
        source={{ uri: image.assets[0].uri }}
        style={[{ width: 300, height: 300, margin: `auto` }, layout.center]}
      />
      <View style={[spacing.gapDefault]}>
        <Button onPress={close}>בחר תמונה אחרת</Button>
        <Button
          style={[colors.backgroundPrimary, spacing.pdSm, common.roundedSm]}
          children={<Text style={[colors.textOnBackground, fonts.default]}>שמור תמונה</Text>}
        ></Button>
      </View>
    </View>
  );
};

export default ImagePreview;
