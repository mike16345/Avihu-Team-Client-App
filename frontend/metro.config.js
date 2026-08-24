const fs = require("node:fs");
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const tenantId = process.env.APP_TENANT;

if (!tenantId) {
  throw new Error("APP_TENANT is required. Set it to a registered tenant before starting Metro.");
}

if (!/^[a-z][a-z0-9-]*$/.test(tenantId)) {
  throw new Error(`Invalid APP_TENANT "${tenantId}". Expected a lowercase tenant ID.`);
}

const tenantAssetsDirectory = path.resolve(
  __dirname,
  "config",
  "tenants",
  "assets",
  tenantId,
  "generated"
);

if (!fs.existsSync(tenantAssetsDirectory)) {
  throw new Error(
    `Generated assets for APP_TENANT "${tenantId}" do not exist. ` +
      `Run: npm run assets:generate -- --tenant ${tenantId}`
  );
}

const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = config.resolver;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...sourceExts, "svg"],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    "tenant-assets": tenantAssetsDirectory,
  },
};

module.exports = config;
