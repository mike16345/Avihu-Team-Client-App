const { withAndroidManifest } = require("@expo/config-plugins");

const CAMERA_FEATURE = "android.hardware.camera";

const applyOptionalCameraFeature = (manifest) => {
  const features = manifest["uses-feature"] ?? [];
  manifest["uses-feature"] = features;
  const existing = features.find((feature) => feature.$?.["android:name"] === CAMERA_FEATURE);

  if (existing) {
    existing.$["android:required"] = "false";
    return manifest;
  }

  // CAMERA permission otherwise implies required hardware for Play and ChromeOS filtering.
  features.push({
    $: {
      "android:name": CAMERA_FEATURE,
      "android:required": "false",
    },
  });
  return manifest;
};

const withOptionalCameraFeature = (config) =>
  withAndroidManifest(config, (cfg) => {
    cfg.modResults.manifest = applyOptionalCameraFeature(cfg.modResults.manifest);
    return cfg;
  });

withOptionalCameraFeature.applyOptionalCameraFeature = applyOptionalCameraFeature;

module.exports = withOptionalCameraFeature;
