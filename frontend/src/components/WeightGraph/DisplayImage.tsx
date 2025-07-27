import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";

interface DisplayImageProps {
  images?: string[];
  removeImage: (index: number) => void;
}

const DisplayImage: React.FC<DisplayImageProps> = ({ images, removeImage }) => {
  const { common, layout, spacing } = useStyles();
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const currentHeight = e.nativeEvent.layout.height;

    if (currentHeight !== height) {
      setHeight(currentHeight);
    }
  };

  return (
    <View style={[layout.flex1]} onLayout={onLayout}>
      <ConditionalRender condition={images?.length !== 0}>
        <View style={[layout.flexRow, spacing.gapXl, layout.flex1, spacing.pdDefault]}>
          {images?.map((image, i) => (
            <View
              key={i}
              style={[spacing.gapDefault, layout.center, layout.flex1, { margin: "auto" }]}
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
