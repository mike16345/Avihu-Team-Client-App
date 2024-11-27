import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Image, View, TouchableOpacity, useWindowDimensions } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import SelectUploadType from "./SelectUploadType";
import { Text } from "../ui/Text";

interface DisplayImageProps {
  image?: string;
  removeImage: () => void;
  handleImageSelected: (image: string) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ image, removeImage, handleImageSelected }) => {
  const { colors, common, fonts, layout, spacing } = useStyles();
  const { height, width } = useWindowDimensions();

  return (
    <View>
      {image ? (
        <View
          style={{ position: `relative`, width: width * 0.7, height: height * 0.3, margin: `auto` }}
        >
          <Image
            source={{ uri: image }}
            style={[
              { width: width * 0.7, height: height * 0.3 },
              layout.center,
              common.borderDefault,
              colors.borderPrimary,
            ]}
          />
          <TouchableOpacity
            style={[
              { position: `absolute`, top: 0, borderBottomEndRadius: 12 },
              colors.backgroundPrimary,
            ]}
            onPress={removeImage}
          >
            <NativeIcon
              library="FontAwesome"
              name="trash"
              style={[colors.textOnBackground, fonts.xl, spacing.pdSm]}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            { height: height * 0.3, margin: `auto` },
            layout.center,
            spacing.gapLg,
            layout.widthFull,
          ]}
        >
          <NativeIcon
            library="MaterialCommunityIcons"
            name="image-off-outline"
            style={[colors.textOnBackground, { fontSize: 86 }]}
          />
          <Text style={colors.textOnBackground}>אין תמונה להצגה!</Text>
          <Text style={colors.textOnBackground}>בחרו אופן העלאת תמונה</Text>
          <SelectUploadType returnImage={(image: string) => handleImageSelected(image)} />
        </View>
      )}
    </View>
  );
};

export default DisplayImage;
