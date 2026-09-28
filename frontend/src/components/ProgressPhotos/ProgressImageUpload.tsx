import { useMemo } from "react";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import UploadDrawer from "@/components/ui/UploadDrawer";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { USER_IMAGE_URLS_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import useUserImageUrlsQuery from "@/hooks/queries/ProgressPhotos/useUserImageUrlsQuery";
import { findCurrentWeekCycle, ONE_WEEK_MS } from "./utils";

const daysUntilNextUpload = (uploadDate?: string) => {
  if (!uploadDate) return 0;
  const [day, month, year] = uploadDate.split("/");
  if (!day || !month || !year) return 0;
  const uploadedAt = new Date(`${year}-${month}-${day}T00:00:00`).getTime();
  const remaining = uploadedAt + ONE_WEEK_MS - Date.now();
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
};

const ProgressImageUpload = () => {
  const { text } = useStyles();
  const { handleUploadCycle, uploading } = useWeighInPhotosApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.currentUser?._id);
  const { data: photos = [] } = useUserImageUrlsQuery();

  const currentWeekCycle = useMemo(
    () => findCurrentWeekCycle(photos as string[]),
    [photos]
  );

  const onImageUpload = async (images: string[]) => {
    if (images.length !== 4) {
      triggerErrorToast({
        title: "יש לבחור 4 תמונות",
        message: "מחזור מלא דורש 4 תמונות בסדר: מלפנים, מאחור, מהצד ימין, מהצד שמאל.",
      });
      return;
    }
    try {
      await handleUploadCycle(images);
      triggerSuccessToast({ title: "הועלה בהצלחה", message: "המאמן קיבל את התמונות" });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [USER_IMAGE_URLS_KEY + userId] });
      }
    } catch (error) {
      // toast already shown by handleUploadCycle
    }
  };

  if (currentWeekCycle) {
    return (
      <PrimaryButton mode="light" block icon="camera" disabled>
        <Text fontSize={16} fontVariant="bold">
          כבר הועלה מחזור השבוע
        </Text>
      </PrimaryButton>
    );
  }

  return (
    <>
      <UploadDrawer
        imageCap={4}
        loading={uploading}
        trigger={
          <PrimaryButton mode="light" block icon="camera">
            <Text fontSize={16} fontVariant="bold">
              העלאת תמונת התקדמות
            </Text>
          </PrimaryButton>
        }
        handleUpload={onImageUpload}
        hint={
          <Text style={text.textCenter} fontVariant="bold">
            בחרו לפי הסדר: מלפנים → מאחור → מהצד ימין → מהצד שמאל
          </Text>
        }
      />
    </>
  );
};

export default ProgressImageUpload;
