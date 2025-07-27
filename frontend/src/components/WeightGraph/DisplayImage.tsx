import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Image, View, TouchableOpacity, useWindowDimensions } from "react-native";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";

interface DisplayImageProps {
  images?: string[];
  removeImage: (index: number) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ images, removeImage }) => {
  const { common, layout, spacing } = useStyles();
  const { height, width } = useWindowDimensions();

  return (
    <View style={{ height: height * 0.35 }}>
      <ConditionalRender condition={images?.length !== 0}>
        <View style={[layout.flexRow, spacing.gapXl]}>
          {images?.map((image, i) => (
            <View
              key={i}
              style={[spacing.gapDefault, layout.center, { height: height * 0.3, margin: "auto" }]}
            >
              <Image
                source={{ uri: image }}
                style={[{ width: width * 0.3 }, layout.flex1, layout.center, common.rounded]}
              />
              <TouchableOpacity onPress={() => removeImage(i)}>
                <Icon name="close" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ConditionalRender>
    </View>
  );
};

export default DisplayImage;
