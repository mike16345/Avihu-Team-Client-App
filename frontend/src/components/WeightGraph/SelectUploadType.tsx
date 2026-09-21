import React from "react";
import { Alert, Linking, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useToast } from "@/hooks/useToast";
import IconButton from "../ui/buttons/IconButton";
import { resolveCameraPermission, type CameraPermissionResolution } from "./imagePickerPermission";

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

  const showMaxImagesReachedError = () => {
    triggerErrorToast({
      title: "הגעת למגבלת התמונות",
      message: `אפשר להעלות עד ${imageCap} תמונות בלבד.`,
    });
  };

  const getRemainingSlots = () => Math.max(imageCap - selectedImagesCount, 0);

  const showCameraPermissionMessage = (resolution: CameraPermissionResolution) => {
    if (resolution === "settings-required") {
      Alert.alert("נדרשת הרשאה למצלמה", "כדי לצלם תמונה, יש לאפשר גישה למצלמה דרך הגדרות המכשיר.", [
        { text: "ביטול", style: "cancel" },
        {
          text: "פתיחת הגדרות",
          onPress: () => void Linking.openSettings(),
        },
      ]);
      return;
    }

    Alert.alert(
      "נדרשת הרשאה למצלמה",
      "לא ניתן לצלם ללא גישה למצלמה. אפשר לנסות שוב בלחיצה על כפתור המצלמה.",
      [{ text: "הבנתי" }]
    );
  };

  const pickImage = async () => {
    const remainingSlots = getRemainingSlots();

    if (remainingSlots === 0) {
      showMaxImagesReachedError();
      return;
    }

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

    const permissionResolution = await resolveCameraPermission({
      getPermission: ImagePicker.getCameraPermissionsAsync,
      requestPermission: ImagePicker.requestCameraPermissionsAsync,
    });

    if (permissionResolution !== "granted") {
      showCameraPermissionMessage(permissionResolution);
      return;
    }

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

  return (
    <View style={[layout.flexRow, layout.center, { gap: 40 }, layout.widthFull]}>
      <IconButton icon="camera" onPress={takePhoto} />
      <IconButton icon="gallery" onPress={pickImage} />
    </View>
  );
};

export default SelectUploadType;
