import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import DisplayImage from "./DisplayImage";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useUserStore } from "@/store/userStore";
import { Text } from "../ui/Text";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import SelectUploadType from "./SelectUploadType";
import { useToast } from "@/hooks/useToast";

interface ImagePreviewProps {
  handleClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ handleClose }) => {
  const { spacing, text, layout } = useStyles();
  const { handleUpload, uploading } = useWeighInPhotosApi();
  const { triggerSuccessToast } = useToast();
  const currentUserId = useUserStore((state) => state.currentUser?._id);

  const [images, setImages] = useState<string[]>([]);
  const addImage = (image: string) => {
    const newImagesArr = [...images];

    newImagesArr.push(image);

    setImages(newImagesArr.slice(-2));
  };

  const deleteImageByIndex = (index: number) => {
    const newImagesArr = images.filter((_, i) => i !== index);

    setImages(newImagesArr);
  };

  const uploadImage = async () => {
    for (let i = 0; i < 2; i++) {
      await handleUpload(images[i], currentUserId || ``, `${i + 1}`);
    }

    triggerSuccessToast({ title: "הועלה בהצלחה", message: "המאמן קיבל את התמונות" });

    handleClose();
  };

  return (
    <View style={[spacing.gapSm, spacing.pdSm, layout.flex1]}>
      <Text style={[text.textCenter]}>בחרו את אופן העלאת התמונה</Text>

      <SelectUploadType returnImage={(image: string) => addImage(image)} />

      <View style={[layout.flex1]}>
        <DisplayImage images={images} removeImage={(index) => deleteImageByIndex(index)} />
      </View>

      <View style={[spacing.gapLg]}>
        <PrimaryButton
          children="שליחה"
          block
          disabled={images.length == 0}
          onPress={uploadImage}
          loading={uploading}
        />
      </View>
    </View>
  );
};

export default ImagePreview;
