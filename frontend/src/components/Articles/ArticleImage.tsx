import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { useState } from "react";
import { View, Image, LayoutChangeEvent } from "react-native";

const ArticleImage = ({ imageUrl, linkToVideo }: { imageUrl?: string; linkToVideo?: string }) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const uri = imageUrl
    ? buildPhotoUrl(imageUrl)
    : getYouTubeThumbnail(extractVideoId(linkToVideo!));

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  return (
    <View onLayout={onLayout}>
      {uri && (
        <Image
          source={{ uri }}
          height={138}
          width={containerWidth}
          style={{
            width: containerWidth,
            height: 138,
            borderRadius: 8,
          }}
        />
      )}
    </View>
  );
};

export default ArticleImage;
