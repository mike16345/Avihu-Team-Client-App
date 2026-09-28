import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import ProgressImageUpload from "@/components/ProgressPhotos/ProgressImageUpload";
import ProgressPhotosGallery from "@/components/ProgressPhotos/ProgressPhotosGallery";

const ProgressPhotosWindow = () => {
  const { layout, spacing } = useStyles();

  return (
    <CustomScrollView
      bottomOffset={100}
      nestedScrollEnabled
      style={layout.flex1}
      contentContainerStyle={[spacing.gapLg]}
    >
      <View style={[spacing.gapLg, spacing.pdHorizontalLg]}>
        <Text style={[layout.alignSelfStart]} fontSize={16}>
          תמונות התקדמות
        </Text>

        <ProgressImageUpload />

        <ProgressPhotosGallery />
      </View>
    </CustomScrollView>
  );
};

export default ProgressPhotosWindow;
