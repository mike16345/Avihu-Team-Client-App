const { withAndroidManifest } = require("@expo/config-plugins");

const applyAndroidBackCompatibility = (manifest) => {
  const application = manifest.application?.[0];

  if (!application) {
    throw new Error("AndroidManifest.xml must contain an application element");
  }

  application.$ ??= {};
  application.$["android:enableOnBackInvokedCallback"] = "false";

  return manifest;
};

const withAndroidBackCompatibility = (config) =>
  withAndroidManifest(config, (cfg) => {
    cfg.modResults.manifest = applyAndroidBackCompatibility(cfg.modResults.manifest);
    return cfg;
  });

withAndroidBackCompatibility.applyAndroidBackCompatibility = applyAndroidBackCompatibility;

module.exports = withAndroidBackCompatibility;
