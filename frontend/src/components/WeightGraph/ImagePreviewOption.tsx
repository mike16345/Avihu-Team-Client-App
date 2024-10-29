import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Image, TouchableOpacity } from "react-native";
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

  return (
    <TouchableOpacity
      style={[
        selected ? colors.borderPrimary : colors.borderSecondary,
        colors.backdrop,
        common.borderSm,
        layout.center,
        { width: 48, height: 48 },
      ]}
      onPress={handleImageSelect}
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: 44, height: 44 }} />
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
