import type { AppPlatform, ReleaseProfile } from "./types";

export const getBuildPackageScript = (platform: AppPlatform, profile: ReleaseProfile): string => {
  const suffix = profile === "development" ? "dev" : profile === "production" ? "prod" : profile;
  return `build:${platform}:${suffix}`;
};
