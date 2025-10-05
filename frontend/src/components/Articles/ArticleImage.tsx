import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { useState } from "react";
import { View, Image, LayoutChangeEvent } from "react-native";
import WorkoutVideoPopup from "../WorkoutPlan/WorkoutVideoPopup";
import { ConditionalRender } from "../ui/ConditionalRender";

interface ArticleImageProps {
  imageUrl?: string;
  linkToVideo?: string;
  height?: number;
  isPlayable?: boolean;
}

const ArticleImage: React.FC<ArticleImageProps> = ({
  height = 138,
  imageUrl,
  linkToVideo,
  isPlayable,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const videoId = linkToVideo ? extractVideoId(linkToVideo) : "";
  const uri = imageUrl ? buildPhotoUrl(imageUrl) : getYouTubeThumbnail(videoId);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  return (
    <View onLayout={onLayout}>
      <ConditionalRender condition={uri && !isPlayable}>
        <Image
          source={{ uri }}
          height={height}
          width={containerWidth}
          style={{
            width: containerWidth,
            height,
            borderRadius: 8,
          }}
        />
      </ConditionalRender>

      <ConditionalRender condition={isPlayable && linkToVideo}>
        <WorkoutVideoPopup videoId={videoId} height={height} width={containerWidth} />
      </ConditionalRender>
    </View>
  );
};

export default ArticleImage;
