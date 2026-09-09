const path = require("node:path");

const resolveTenantAssetsDirectory = (projectRoot, tenantId, exists) => {
  const localTenantIndex = path.resolve(
    projectRoot,
    "config",
    "tenants",
    ".local",
    tenantId,
    "index.ts"
  );
  return path.resolve(
    projectRoot,
    "config",
    "tenants",
    "assets",
    ...(exists(localTenantIndex) ? [".local"] : []),
    tenantId,
    "generated"
  );
};

module.exports = { resolveTenantAssetsDirectory };
