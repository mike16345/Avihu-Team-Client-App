import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useToast } from "@/hooks/useToast";
import DisplayImage from "./DisplayImage";
import { Text } from "../ui/Text";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import SelectUploadType from "./SelectUploadType";
import { UploadDrawerProps } from "../ui/UploadDrawer";

const ImagePreview: React.FC<Omit<UploadDrawerProps, "trigger">> = ({
  handleUpload,
  images: existingImages,
  loading,
  imageCap = 2,
  confirmTitle = "שליחה",
}) => {
  const { spacing, text, layout } = useStyles();
  const { triggerErrorToast } = useToast();

  const [images, setImages] = useState<string[]>([]);
  const hadExistingImages = (existingImages?.length || 0) > 0;

  const showMaxImagesReachedError = () => {
    triggerErrorToast({
      title: "הגעת למגבלת התמונות",
      message: `ניתן להעלות עד ${imageCap} תמונות.`,
    });
  };

  const addImages = (newImages: string[]) => {
    const remainingSlots = imageCap - images.length;

    if (remainingSlots <= 0) {
      showMaxImagesReachedError();
      return;
    }

    if (newImages.length > remainingSlots) {
      showMaxImagesReachedError();
    }

    const imagesToAdd = newImages.slice(0, remainingSlots);

    if (imagesToAdd.length === 0) return;

    setImages([...images, ...imagesToAdd]);
  };

  const deleteImageByIndex = (index: number) => {
    const newImagesArr = images.filter((_, i) => i !== index);

    setImages(newImagesArr);
  };

  const uploadImage = async () => {
    await handleUpload(images);
  };

  useEffect(() => {
    if (!existingImages) return;

    setImages(existingImages);
  }, [existingImages]);

  return (
    <View style={[{ paddingVertical: 30, paddingHorizontal: 24 }, spacing.gap30, layout.flex1]}>
      <Text style={[text.textCenter]}>בחרו את אופן העלאת התמונות</Text>

      <View style={[spacing.gap30, !images.length && { gap: 226 }]}>
        <SelectUploadType
          imageCap={imageCap}
          selectedImagesCount={images.length}
          returnImages={addImages}
        />

        <DisplayImage images={images} removeImage={(index) => deleteImageByIndex(index)} />
      </View>

      <View>
        <PrimaryButton
          children={confirmTitle}
          block
          disabled={images.length === 0 && !hadExistingImages}
          onPress={uploadImage}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default ImagePreview;
