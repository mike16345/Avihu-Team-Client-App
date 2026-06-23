import React, { useEffect } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useToast } from "@/hooks/useToast";
import IconButton from "../ui/buttons/IconButton";

interface SelectUploadTypeProps {
  imageCap: number;
  selectedImagesCount: number;
  returnImages: (images: string[]) => void;
}

const cameraPickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  cameraType: ImagePicker.CameraType.back,
  quality: 1,
};

const SelectUploadType: React.FC<SelectUploadTypeProps> = ({
  imageCap,
  selectedImagesCount,
  returnImages,
}) => {
  const { layout } = useStyles();
  const { triggerErrorToast } = useToast();

  const [_, requestPermission] = ImagePicker.useCameraPermissions();

  const showMaxImagesReachedError = () => {
    triggerErrorToast({
      title: "הגעת למגבלת התמונות",
      message: `אפשר להעלות עד ${imageCap} תמונות בלבד.`,
    });
  };

  const getRemainingSlots = () => Math.max(imageCap - selectedImagesCount, 0);

  const checkPermissions = async (
    getPermissions: () => Promise<
      ImagePicker.CameraPermissionResponse | ImagePicker.MediaLibraryPermissionResponse
    >,
    requestPermissions: () => Promise<
      ImagePicker.CameraPermissionResponse | ImagePicker.MediaLibraryPermissionResponse
    >
  ) => {
    const { status, canAskAgain } = await getPermissions();

    if (status !== "granted") {
      if (canAskAgain) {
        const { status: newStatus } = await requestPermissions();

        return newStatus;
      }

      triggerErrorToast({
        title: "אין הרשאה לתמונות",
        message: "כדי לבחור או לצלם תמונה, יש לאפשר גישה לתמונות או למצלמה בהגדרות המכשיר.",
      });
    }

    return status;
  };

  const pickImage = async () => {
    const remainingSlots = getRemainingSlots();

    if (remainingSlots === 0) {
      showMaxImagesReachedError();
      return;
    }

    const status = await checkPermissions(
      ImagePicker.getMediaLibraryPermissionsAsync,
      ImagePicker.requestMediaLibraryPermissionsAsync
    );

    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      allowsMultipleSelection: remainingSlots > 1,
      selectionLimit: remainingSlots,
      orderedSelection: remainingSlots > 1,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const selectedImages = result.assets
      .map((asset) => asset.uri)
      .filter((uri): uri is string => Boolean(uri))
      .slice(0, remainingSlots);

    if (selectedImages.length === 0) return;

    returnImages(selectedImages);
  };

  const takePhoto = async () => {
    if (getRemainingSlots() === 0) {
      showMaxImagesReachedError();
      return;
    }

    const status = await checkPermissions(
      ImagePicker.getCameraPermissionsAsync,
      ImagePicker.requestCameraPermissionsAsync
    );

    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync(cameraPickerOptions);

    if (result.canceled) return;
    const fixedImage = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ flip: ImageManipulator.FlipType.Horizontal }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    returnImages([fixedImage.uri]);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={[layout.flexRow, layout.center, { gap: 40 }, layout.widthFull]}>
      <IconButton icon="camera" onPress={takePhoto} />
      <IconButton icon="gallery" onPress={pickImage} />
    </View>
  );
};

export default SelectUploadType;
