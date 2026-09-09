import type { TenantFeatureDefaults, TenantNativeCapabilities } from "../types";

export const featureDefaults = {
  articles: true,
  chat: true,
  dietPlan: true,
  smartFoodCatalog: true,
  workoutPlan: true,
  stepTracking: true,
  progressTracking: true,
  formsAndAgreements: true,
  mediaCapture: true,
  notifications: true,
} satisfies TenantFeatureDefaults;

export const nativeCapabilities = {
  camera: true,
  photoLibrary: true,
  notifications: true,
  backgroundTasks: true,
  appleHealth: true,
  healthConnect: true,
  liveActivities: true,
} satisfies TenantNativeCapabilities;
