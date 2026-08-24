export const GENERATOR_VERSION = 1 as const;
export const ADAPTIVE_SAFE_ZONE_RATIO = 0.66;
export const ADAPTIVE_MINIMUM_SAFE_ZONE_UTILIZATION = 0.9;
export const NOTIFICATION_ALPHA_THRESHOLD = 128;
export const NOTIFICATION_LUMINANCE_THRESHOLD = 176;

export const ASSET_OUTPUT_FILES = {
  appleIcon: "apple-icon.png",
  androidLegacyIcon: "android-legacy-icon.png",
  androidAdaptiveForeground: "android-adaptive-foreground.png",
  androidAdaptiveBackground: "android-adaptive-background.png",
  notificationIcon: "notification-icon.png",
  splash: "splash.png",
  runtimeLogo: "runtime-logo.png",
  applePreview: "previews/apple.png",
  androidCirclePreview: "previews/android-circle.png",
  androidSquirclePreview: "previews/android-squircle.png",
  notificationPreview: "previews/notification.png",
} as const;

export type AssetOutputName = keyof typeof ASSET_OUTPUT_FILES;

export interface ImageMetadata {
  width: number;
  height: number;
  hasAlpha: boolean;
  colorSpace: string;
}

export interface ManifestImage extends ImageMetadata {
  relativePath: string;
  sha256: string;
}

export interface AssetManifest {
  generatorVersion: typeof GENERATOR_VERSION;
  tenantId: string;
  rules: {
    adaptiveSafeZoneRatio: number;
    adaptiveMinimumSafeZoneUtilization: number;
    notificationMask: string;
  };
  source: ManifestImage;
  outputs: Record<AssetOutputName, ManifestImage>;
}

export interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}
