import PrimaryButton from "../ui/buttons/PrimaryButton";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import UploadDrawer from "../ui/UploadDrawer";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useToast } from "@/hooks/useToast";

const ProgressImageUpload = () => {
  const { text } = useStyles();
  const { handleUpload } = useWeighInPhotosApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  const onImageUpload = async (images: string[]) => {
    try {
      images.forEach(async (image, i) => await handleUpload(image, `${i + 1}`));

      triggerSuccessToast({ title: "הועלה בהצלחה", message: "המאמן קיבל את התמונות" });
    } catch (error) {
      triggerErrorToast({ message: "אירעה שגיאה בהעלאת התמונות" });
    }
  };

  return (
    <>
      <UploadDrawer
        trigger={
          <PrimaryButton mode="light" block icon="camera">
            <Text fontSize={16} fontVariant="bold">
              העלאת תמונת התקדמות
            </Text>
          </PrimaryButton>
        }
        handleUpload={onImageUpload}
      />

      <Text style={text.textCenter} fontVariant="light">
        העלו תמונה של ההתקדמות שלכם למאמן
      </Text>
    </>
  );
};

export default ProgressImageUpload;
