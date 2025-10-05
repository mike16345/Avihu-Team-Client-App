import { useQuery } from "@tanstack/react-query";
import { MEASUREMENTS_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import { useMeasurementApi } from "@/hooks/api/useMeasurementApi";
import { IUserMuscleMeasurements } from "@/interfaces/measurements";

const useMeasurementQuery = () => {
  const { getMeasurements } = useMeasurementApi();
  const userId = useUserStore((state) => state.currentUser?._id);

  return useQuery<any, any, IUserMuscleMeasurements, any>({
    queryFn: () => getMeasurements(userId!),
    queryKey: [MEASUREMENTS_KEY + userId],
    enabled: !!userId,
    staleTime: ONE_DAY,
  });
};

export default useMeasurementQuery;
