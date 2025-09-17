import { deleteItem, fetchData, sendData } from "@/API/api";
import { IUserMuscleMeasurements } from "@/interfaces/measurements";
import { ApiResponse } from "@/types/ApiTypes";

const MEASUREMENT_ENDPOINT = "muscleMeasurements";

export const useMeasurementApi = () => {
  const saveMeasurement = (userId: string, date: string, measurement: string, muscle: string) =>
    sendData<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT, {
      userId,
      date,
      measurement,
      muscle,
    });

  const getMeasurements = (userId: string) =>
    fetchData<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT + "/one", userId);

  const removeMeasurement = (userId: string, muscle: string, date: string) =>
    deleteItem<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT, {
      userId,
      muscle,
      date,
    });

  return { removeMeasurement, saveMeasurement, getMeasurements };
};
