import useStyles from "@/styles/useGlobalStyles";
import { ImagePickerResult } from "expo-image-picker";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import DisplayImage from "./DisplayImage";
import ImagePreviewOption from "./ImagePreviewOption";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useUserStore } from "@/store/userStore";

interface ImagePreviewProps {
  close: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ close }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { uploadPhoto } = useWeighInPhotosApi();
  const currentUserId = useUserStore((state) => state.currentUser?._id);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [images, setImages] = useState<ImagePickerResult[]>([]);

  const setImageByIndex = (index: number, image: ImagePickerResult) => {
    const newImagesArr = [...images];

    newImagesArr[index] = image;

    setImages(newImagesArr);
    setSelectedImage(index);
  };

  const deleteimageByIndex = (index: number) => {
    const newImagesArr = images.filter((_, i) => i !== index);

    setImages(newImagesArr);
  };

  return (
    <View style={[spacing.gapDefault, { direction: `rtl` }]}>
      <Text style={[text.textLeft, fonts.lg, colors.textOnBackground, text.textBold]}>
        תמונה שנבחרה
      </Text>
      <DisplayImage
        image={images[selectedImage] ? images[selectedImage].assets[0] : undefined}
        removeImage={() => deleteimageByIndex(0)}
        handleImageSelected={(image: ImagePickerResult) => setImageByIndex(selectedImage, image)}
      />
      <View style={[spacing.gapLg]}>
        <View style={[layout.flexRowReverse, layout.center, spacing.gapLg]}>
          <ImagePreviewOption
            handleImageSelect={() => setSelectedImage(0)}
            selected={selectedImage == 0}
            image={images[0] ? images[0].assets[0] : undefined}
          />
          <ImagePreviewOption
            handleImageSelect={() => setSelectedImage(1)}
            selected={selectedImage == 1}
            image={images[1] ? images[1].assets[0] : undefined}
          />
        </View>
        <View style={[layout.flexRow, layout.center, spacing.gapSm]}>
          <Button
            style={[spacing.pdSm, colors.backgroundSecondary, common.roundedSm, { width: `50%` }]}
            onPress={close}
          >
            ביטול
          </Button>
          <Button
            style={[colors.backgroundPrimary, spacing.pdSm, common.roundedSm, { width: `50%` }]}
            children={<Text style={[colors.textOnBackground, fonts.default]}>שליחה</Text>}
            onPress={() => uploadPhoto(currentUserId, images[0].assets[0].uri)}
          ></Button>
        </View>
      </View>
    </View>
  );
};

export default ImagePreview;
