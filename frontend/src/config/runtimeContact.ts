import Constants from "expo-constants";

export const getTrainerPhoneNumber = (): string =>
  Constants.expoConfig?.extra?.TRAINER_PHONE_NUMBER ??
  process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER ??
  "";
