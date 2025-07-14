import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Image, TouchableOpacity, useWindowDimensions } from "react-native";
import NativeIcon from "../Icon/NativeIcon";

interface ImagePreviewOptionProps {
  image?: string;
  selected: boolean;
  handleImageSelect: () => void;
}

const ImagePreviewOption: React.FC<ImagePreviewOptionProps> = ({
  image,
  selected,
  handleImageSelect,
}) => {
  const { colors, common, layout } = useStyles();
  const { height, width } = useWindowDimensions();

  return (
    <TouchableOpacity
      style={[
        selected ? colors.borderPrimary : colors.borderSecondary,
        colors.backdrop,
        common.borderSm,
        layout.center,

        { width: width * 0.12, height: height * 0.05 },
      ]}
      onPress={handleImageSelect}
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: width * 0.11, height: height * 0.047 }} />
      ) : (
        <NativeIcon
          style={[selected ? colors.textPrimary : colors.textOnBackground]}
          library="FontAwesome"
          name="plus"
        />
      )}
    </TouchableOpacity>
  );
};

export default ImagePreviewOption;
