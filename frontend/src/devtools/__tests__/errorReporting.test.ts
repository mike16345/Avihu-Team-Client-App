import { afterEach, expect, it, vi } from "vitest";
import { createDeveloperActions, type DeveloperActionDependencies } from "../actions";
import { setErrorReporter } from "@/services/errorReporting/reportError";
afterEach(() => setErrorReporter(null));
const dependencies = {
  getNotificationPermission: async () => "undetermined",
  requestNotificationPermission: async () => "denied",
  scheduleTestNotification: async () => undefined,
  openNotificationSettings: async () => {},
  clearMemoryQueryCache: () => {},
  clearPersistedQueryCache: async () => {},
  reloadApp: async () => {},
  reportFailure: () => {},
  flushReports: async () => true,
} as DeveloperActionDependencies;
it("captures one real synthetic exception retaining answers and removing credential markers", async () => {
  const capture = vi.fn((_error: Error, _context: unknown) => "verification-event-id");
  setErrorReporter(capture);
  const result = await createDeveloperActions(dependencies).sendTestError();
  expect(result.ok).toBe(true);
  expect(result.message).toContain("Check Sentry");
  expect(capture).toHaveBeenCalledTimes(1);
  expect(capture.mock.calls[0][0]).toBeInstanceOf(Error);
  const serialized = JSON.stringify(capture.mock.calls[0][1]);
  expect(serialized).toContain("תשובה לדוגמה");
  expect(serialized).not.toContain("FAKE_CREDENTIAL_MARKER");
});
it("reports disabled monitoring clearly and never claims ingestion after flush failure", async () => {
  expect((await createDeveloperActions(dependencies).sendTestError()).ok).toBe(false);
  setErrorReporter(() => "id");
  const result = await createDeveloperActions({
    ...dependencies,
    flushReports: async () => false,
  }).sendTestError();
  expect(result.ok).toBe(false);
  expect(result.message).not.toContain("delivered");
});
