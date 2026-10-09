import { describe, expect, it } from "vitest";
import { avihuTenant } from "../tenants/avihu";
import { createExpoConfig, createTenantPlugins } from "../createExpoConfig";
import { tenantConfigSchema } from "../tenants/schema";
import { getRuntimeTenant } from "../../src/config/runtimeTenant";

const monitoring = { sentry: { organization: "avihuteam", project: "avihu-mobile", dsn: "https://public@o1.ingest.de.sentry.io/42" } };
describe("Sentry tenant configuration", () => {
  it("validates and publishes only public monitoring data", () => {
    const tenant = tenantConfigSchema.parse({ ...avihuTenant, monitoring });
    const config = createExpoConfig({ baseConfig: {}, tenant, environment: "preview", processEnv: { SENTRY_AUTH_TOKEN: "SECRET" } });
    expect(getRuntimeTenant({ expoConfig: config }).monitoring).toEqual(monitoring);
    expect(JSON.stringify(config.extra)).not.toContain("SECRET");
    expect(createTenantPlugins(tenant)).toContainEqual(["@sentry/react-native/expo", { organization: "avihuteam", project: "avihu-mobile", url: "https://sentry.io/" }]);
  });
  it("rejects malformed DSNs and embedded upload credentials", () => {
    expect(tenantConfigSchema.safeParse({ ...avihuTenant, monitoring: { sentry: { ...monitoring.sentry, dsn: "http://example.com/42" } } }).success).toBe(false);
    expect(tenantConfigSchema.safeParse({ ...avihuTenant, monitoring: { sentry: { ...monitoring.sentry, authToken: "SECRET" } } }).success).toBe(false);
  });
  it("does not route tenants without a monitoring destination", () => {
    const tenant = tenantConfigSchema.parse({ ...avihuTenant, monitoring: undefined });
    const config = createExpoConfig({ baseConfig: {}, tenant, environment: "development", processEnv: {} });
    expect(getRuntimeTenant({ expoConfig: config }).monitoring).toBeUndefined();
    expect(JSON.stringify(config.plugins)).not.toContain("@sentry");
  });
  it("isolates the native SDK from old runtime binaries", () => {
    const config = createExpoConfig({ baseConfig: {}, tenant: avihuTenant, environment: "production", processEnv: {} });
    expect(config.runtimeVersion).toBe("2.4.1");
  });
});
