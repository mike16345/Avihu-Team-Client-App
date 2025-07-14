import { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import ImageViewing from "react-native-image-viewing";

const BlogImage = ({ imageUrl }: { imageUrl: string }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  return (
    <View>
      {imageUrl && (
        <>
          <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <ImageViewing
            images={[{ uri: imageUrl }]}
            imageIndex={0}
            visible={isViewerVisible}
            onRequestClose={() => setIsViewerVisible(false)}
          />
        </>
      )}
    </View>
  );
};

export default BlogImage;
