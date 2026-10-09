import { beforeEach, expect, it, vi } from "vitest";
import { avihuTenant } from "../../../../config/tenants/avihu";
import { createExpoConfig } from "../../../../config/createExpoConfig";
const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  withScope: vi.fn(),
  captureException: vi.fn(),
  close: vi.fn(),
}));
const constants = vi.hoisted(() => ({
  expoConfig: {} as any,
  nativeAppVersion: "2.4.1",
  nativeBuildVersion: "1",
}));
vi.mock("@sentry/react-native", () => sdk);
vi.mock("expo-constants", () => ({ default: constants }));
vi.mock("expo-updates", () => ({
  updateId: "update-123",
  isEmbeddedLaunch: false,
  runtimeVersion: "2.4.1",
}));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  constants.expoConfig = createExpoConfig({
    baseConfig: {},
    tenant: avihuTenant,
    environment: "preview",
    processEnv: {},
  });
});
it("initializes once with release context and event sanitizers", async () => {
  const { initializeErrorReporting } = await import("../initialize");
  initializeErrorReporting();
  initializeErrorReporting();
  expect(sdk.init).toHaveBeenCalledTimes(1);
  const options = sdk.init.mock.calls[0][0];
  expect(options.environment).toBe("preview");
  expect(options.dsn).toContain("ingest.de.sentry.io");
  expect(options.tracesSampleRate).toBe(0);
  expect(options.beforeSend({ extra: { password: "PRIVATE", answer: "כאב" } }).extra).toEqual({
    password: "[redacted]",
    answer: "כאב",
  });
  expect(sdk.setTag).toHaveBeenCalledWith("expo-update-id", "update-123");
});
it("does not initialize when the tenant has no destination", async () => {
  delete constants.expoConfig.extra.tenant.monitoring;
  const { initializeErrorReporting } = await import("../initialize");
  initializeErrorReporting();
  expect(sdk.init).not.toHaveBeenCalled();
});
