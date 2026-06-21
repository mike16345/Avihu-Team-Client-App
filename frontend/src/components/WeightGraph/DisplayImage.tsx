import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { Image, View, TouchableOpacity, LayoutChangeEvent, StyleSheet } from "react-native";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";

interface DisplayImageProps {
  images?: string[];
  removeImage: (index: number) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ images, removeImage }) => {
  const { common, layout } = useStyles();
  const [containerWidth, setContainerWidth] = useState(0);
  const imageCount = images?.length || 0;
  const usesGridLayout = imageCount > 2;
  const columns = usesGridLayout ? 2 : Math.max(imageCount, 1);
  const gap = usesGridLayout ? 12 : 20;
  const availableWidth = containerWidth || 240;
  const imageWidth = Math.max(92, Math.min(110, (availableWidth - gap * (columns - 1)) / columns));
  const imageHeight = usesGridLayout ? imageWidth * 1.2 : 156;

  const onLayout = (e: LayoutChangeEvent) => {
    const currentWidth = e.nativeEvent.layout.width;

    if (currentWidth !== containerWidth) {
      setContainerWidth(currentWidth);
    }
  };

  return (
    <View onLayout={onLayout} style={layout.widthFull}>
      <ConditionalRender condition={images?.length !== 0}>
        <View style={[layout.flexRow, layout.wrap, layout.justifyCenter, { gap }]}>
          {images?.map((image, i) => (
            <View key={i} style={[styles.imageCard, { width: imageWidth }]}>
              <Image
                source={{ uri: image }}
                resizeMode="cover"
                style={[{ width: imageWidth, height: imageHeight }, common.rounded]}
              />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(i)}>
                <Icon name="close" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ConditionalRender>
    </View>
  );
};

const styles = StyleSheet.create({
  imageCard: {
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DisplayImage;
