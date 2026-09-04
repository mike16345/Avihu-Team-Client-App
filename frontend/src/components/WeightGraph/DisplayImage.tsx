import { semanticColors } from "@/themes/semanticColors";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";

interface DisplayImageProps {
  images?: string[];
  removeImage: (index: number) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ images, removeImage }) => {
  const { common, layout } = useStyles();

  return (
    <View style={layout.widthFull}>
      <ConditionalRender condition={images?.length !== 0}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.previewContent}
          showsHorizontalScrollIndicator={false}
        >
          {images?.map((image, i) => (
            <View key={`${image}-${i}`} style={styles.imageCard}>
              <Image
                source={{ uri: image }}
                resizeMode="cover"
                style={[styles.image, common.rounded]}
              />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(i)}>
                <Icon name="close" width={14} height={14} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ConditionalRender>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContent: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  imageCard: {
    position: "relative",
    width: 110,
  },
  image: {
    width: 110,
    height: 146,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: semanticColors.overlay.imageSurface,
    shadowColor: semanticColors.scrim,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DisplayImage;
