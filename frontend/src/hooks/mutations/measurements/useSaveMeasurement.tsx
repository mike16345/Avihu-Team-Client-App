import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useToast } from "../../useToast";
import queryClient from "@/QueryClient/queryClient";
import { MEASUREMENTS_KEY } from "@/constants/reactQuery";
import { useMeasurementApi } from "@/hooks/api/useMeasurementApi";

const useSaveMeasurement = () => {
  const id = useUserStore((state) => state.currentUser?._id);
  const { saveMeasurement } = useMeasurementApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  return useMutation({
    mutationFn: ({
      date,
      measurement,
      muscle,
    }: {
      date: string;
      measurement: string;
      muscle: string;
    }) => saveMeasurement(id || "", date, measurement, muscle),
    onSuccess: () => {
      triggerSuccessToast({ title: "הועלה בהצלחה ", message: "ניתן להיות במעקב דרך גרף ההיקפים" });
      queryClient.invalidateQueries({ queryKey: [MEASUREMENTS_KEY + id] });
    },
    onError: () => triggerErrorToast({ message: "אירעה שגיאה בהעלאת ההיקפים" }),
  });
};

export default useSaveMeasurement;
