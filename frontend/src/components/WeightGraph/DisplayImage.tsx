import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { Image, View, TouchableOpacity, LayoutChangeEvent } from "react-native";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";

interface DisplayImageProps {
  images?: string[];
  removeImage: (index: number) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ images, removeImage }) => {
  const { common, layout, spacing } = useStyles();
  const [height, setHeight] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const currentHeight = e.nativeEvent.layout.height;

    if (currentHeight !== height) {
      setHeight(currentHeight);
    }
  };

  return (
    <View onLayout={onLayout} style={layout.center}>
      <ConditionalRender condition={images?.length !== 0}>
        <View style={[layout.flexRow, spacing.gap30]}>
          {images?.map((image, i) => (
            <View key={i} style={[spacing.gapLg, layout.center]}>
              <Image
                source={{ uri: image }}
                resizeMode="cover"
                style={[{ width: 92, height: 156 }, common.rounded]}
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
