import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import DisplayImage from "./DisplayImage";
import ImagePreviewOption from "./ImagePreviewOption";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useUserStore } from "@/store/userStore";
import Loader from "../ui/loaders/Loader";
import Toast from "react-native-toast-message";
import { Text } from "../ui/Text";

interface ImagePreviewProps {
  handleClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ handleClose }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { handleUpload, uploading } = useWeighInPhotosApi();
  const currentUserId = useUserStore((state) => state.currentUser?._id);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);

  const setImageByIndex = (index: number, image: string) => {
    const newImagesArr = [...images];

    newImagesArr[index] = image;

    setImages(newImagesArr);
    setSelectedImage(index);
  };

  const deleteimageByIndex = (index: number) => {
    const newImagesArr = images.filter((_, i) => i !== index);

    setImages(newImagesArr);
  };

  const uploadImage = async () => {
    for (let i = 0; i < 2; i++) {
      await handleUpload(images[i], currentUserId || ``, `${i + 1}`);
    }

    Toast.show({
      text1: "קבצים נשלחו בהצלחה!",
      autoHide: true,
      type: "success",
      swipeable: true,
      text1Style: { textAlign: `center` },
    });
    handleClose();
  };

  return (
    <View style={[spacing.gapLg, spacing.pdSm]}>
      {uploading && <Loader variant="Screen" positionTop={`-90%`} positionLeft={`-5%`} />}

      <DisplayImage
        image={images[selectedImage] ? images[selectedImage] : undefined}
        removeImage={() => deleteimageByIndex(0)}
        handleImageSelected={(image: string) => setImageByIndex(selectedImage, image)}
      />
      <View style={[spacing.gapLg]}>
        <View style={[layout.flexRowReverse, layout.center, spacing.gapLg]}>
          <ImagePreviewOption
            handleImageSelect={() => setSelectedImage(0)}
            selected={selectedImage == 0}
            image={images[0]}
          />
          <ImagePreviewOption
            handleImageSelect={() => setSelectedImage(1)}
            selected={selectedImage == 1}
            image={images[1]}
          />
        </View>
        <View style={[layout.flexRow, layout.center, spacing.gapDefault]}>
          <Button
            style={[colors.backgroundPrimary, spacing.pdSm, common.roundedSm, { width: `50%` }]}
            onPress={uploadImage}
          >
            <Text style={[colors.textOnBackground, text.textBold, fonts.default]}>שליחה</Text>
          </Button>
          <Button
            style={[spacing.pdSm, colors.backgroundSecondary, common.roundedSm, { width: `50%` }]}
            onPress={handleClose}
          >
            <Text style={[text.textBold, fonts.default]}>ביטול</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ImagePreview;
