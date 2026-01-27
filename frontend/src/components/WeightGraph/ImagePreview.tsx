import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import DisplayImage from "./DisplayImage";
import { Text } from "../ui/Text";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import SelectUploadType from "./SelectUploadType";
import { UploadDrawerProps } from "../ui/UploadDrawer";

const ImagePreview: React.FC<Omit<UploadDrawerProps, "trigger">> = ({
  handleUpload,
  loading,
  imageCap = 2,
}) => {
  const { spacing, text, layout } = useStyles();

  const [images, setImages] = useState<string[]>([]);
  const addImage = (image: string) => {
    const newImagesArr = [...images];

    newImagesArr.push(image);

    setImages(newImagesArr.slice(-imageCap));
  };

  const deleteImageByIndex = (index: number) => {
    const newImagesArr = images.filter((_, i) => i !== index);

    setImages(newImagesArr);
  };

  const uploadImage = async () => {
    handleUpload(images);
  };

  return (
    <View style={[{ paddingVertical: 30, paddingHorizontal: 70 }, spacing.gap30, layout.flex1]}>
      <Text style={[text.textCenter]}>בחרו את אופן העלאת התמונה</Text>

      <View style={[spacing.gap30, !images.length && { gap: 226 }]}>
        <SelectUploadType returnImage={(image: string) => addImage(image)} />

        <DisplayImage images={images} removeImage={(index) => deleteImageByIndex(index)} />
      </View>

      <View>
        <PrimaryButton
          children="שליחה"
          block
          disabled={images.length == 0}
          onPress={uploadImage}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default ImagePreview;
