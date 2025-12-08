import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useToast } from "../../useToast";
import queryClient from "@/QueryClient/queryClient";
import { MEASUREMENTS_KEY } from "@/constants/reactQuery";
import { useMeasurementApi } from "@/hooks/api/useMeasurementApi";

const useDeleteMeasurement = () => {
  const id = useUserStore((state) => state.currentUser?._id);
  const { removeMeasurement } = useMeasurementApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  return useMutation({
    mutationFn: ({ date, muscle }: { date: string; muscle: string }) =>
      removeMeasurement(id || "", muscle, date),
    onSuccess: () => {
      triggerSuccessToast({
        title: "היקף נמחק בהצלחה",
        message: "ניתן להיות במעקב דרך גרף ההיקפים",
      });
      queryClient.invalidateQueries({ queryKey: [MEASUREMENTS_KEY + id] });
    },
    onError: () => triggerErrorToast({ message: "אירעה שגיאה במחיקת ההיקף" }),
  });
};

export default useDeleteMeasurement;
