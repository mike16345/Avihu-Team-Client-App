const fs = require("node:fs");
const { getDefaultConfig } = require("expo/metro-config");
const { resolveTenantAssetsDirectory } = require("./tools/metro/tenantAssets.cjs");

const tenantId = process.env.APP_TENANT;

if (!tenantId) {
  throw new Error("APP_TENANT is required. Set it to a registered tenant before starting Metro.");
}

if (!/^[a-z][a-z0-9-]*$/.test(tenantId)) {
  throw new Error(`Invalid APP_TENANT "${tenantId}". Expected a lowercase tenant ID.`);
}

const tenantAssetsDirectory = resolveTenantAssetsDirectory(__dirname, tenantId, fs.existsSync);

if (!fs.existsSync(tenantAssetsDirectory)) {
  throw new Error(
    `Generated assets for APP_TENANT "${tenantId}" do not exist. ` +
      `Run: npm run assets:generate -- --tenant ${tenantId}`
  );
}

const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts, blockList } = config.resolver;
const existingBlockList = Array.isArray(blockList) ? blockList : [blockList].filter(Boolean);

// Expo SDK 53 watches all .env* files but only transforms standard dotenv names.
// Keep test-runner files and examples out of its JavaScript dependency graph.
const toolingEnvironmentFiles =
  /[/\\]\.env(?!(?:\.(?:local|(?:development|production)(?:\.local)?))?$)[^/\\]*$/;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...sourceExts, "svg"],
  blockList: [...existingBlockList, toolingEnvironmentFiles],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    "tenant-assets": tenantAssetsDirectory,
  },
};

module.exports = config;
