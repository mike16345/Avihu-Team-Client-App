import { useQuery } from "@tanstack/react-query";
import { useSessionsApi } from "../api/useSessionsApi";

const useWorkoutSessionQuery = () => {
  const { getSession } = useSessionsApi();
  return useQuery({});
};

export default useWorkoutSessionQuery;
