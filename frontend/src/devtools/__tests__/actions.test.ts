import { describe, expect, it } from "vitest";

import {
  createDeveloperActions,
  type DeveloperActionDependencies,
  type DeveloperNotificationPermission,
} from "../actions";

const dependencies = (
  overrides: Partial<DeveloperActionDependencies> = {}
): DeveloperActionDependencies => ({
  getNotificationPermission: async () => "granted",
  requestNotificationPermission: async () => "granted",
  scheduleTestNotification: async () => "notification-id",
  openNotificationSettings: async () => undefined,
  clearMemoryQueryCache: () => undefined,
  clearPersistedQueryCache: async () => undefined,
  reloadApp: async () => undefined,
  reportFailure: () => undefined,
  ...overrides,
});

describe("developer actions", () => {
  it("refreshes notification permission without changing it", async () => {
    const actions = createDeveloperActions(
      dependencies({ getNotificationPermission: async () => "denied" })
    );

    await expect(actions.refreshNotificationPermission()).resolves.toEqual({
      ok: true,
      message: "Notification permission refreshed.",
      permission: "denied",
    });
  });

  it("refuses a test notification while permission is not granted", async () => {
    const scheduled: string[] = [];
    const actions = createDeveloperActions(
      dependencies({
        getNotificationPermission: async () => "denied",
        scheduleTestNotification: async () => {
          scheduled.push("scheduled");
          return "notification-id";
        },
      })
    );

    await expect(actions.sendTestNotification("Elevate Coach")).resolves.toEqual({
      ok: false,
      message: "Notification permission is not granted.",
    });
    expect(scheduled).toEqual([]);
  });

  it("sends an Elevate Coach local test notification after a granted permission check", async () => {
    const scheduled: Array<{ title: string; body: string }> = [];
    const actions = createDeveloperActions(
      dependencies({
        scheduleTestNotification: async (title, body) => {
          scheduled.push({ title, body });
          return "notification-id";
        },
      })
    );

    await expect(actions.sendTestNotification("Elevate Coach")).resolves.toEqual({
      ok: true,
      message: "Test notification scheduled.",
    });
    expect(scheduled).toEqual([{ title: "Elevate Coach", body: "Developer test notification" }]);
  });

  it("reports failure when the notification scheduler returns no identifier", async () => {
    const actions = createDeveloperActions(
      dependencies({ scheduleTestNotification: async () => undefined })
    );

    await expect(actions.sendTestNotification("Elevate Coach")).resolves.toEqual({
      ok: false,
      message: "Test notification could not be scheduled.",
    });
  });

  it.each([
    ["granted", true, "Notification permission granted."],
    ["denied", false, "Notification permission was not granted."],
    ["undetermined", false, "Notification permission was not granted."],
  ] as const)(
    "reports requested permission result %s",
    async (permission: DeveloperNotificationPermission, ok, message) => {
      const actions = createDeveloperActions(
        dependencies({ requestNotificationPermission: async () => permission })
      );

      await expect(actions.requestNotificationPermission()).resolves.toEqual({
        ok,
        message,
        permission,
      });
    }
  );

  it("clears memory and persisted query cache", async () => {
    const cleared = { memory: false, persisted: false };
    const actions = createDeveloperActions(
      dependencies({
        clearMemoryQueryCache: () => {
          cleared.memory = true;
        },
        clearPersistedQueryCache: async () => {
          cleared.persisted = true;
        },
      })
    );

    await expect(actions.clearServerCache()).resolves.toEqual({
      ok: true,
      message: "Server cache cleared.",
    });
    expect(cleared).toEqual({ memory: true, persisted: true });
  });

  it("opens settings and requests reload through the device boundary", async () => {
    const requested: string[] = [];
    const actions = createDeveloperActions(
      dependencies({
        openNotificationSettings: async () => {
          requested.push("settings");
        },
        reloadApp: async () => {
          requested.push("reload");
        },
      })
    );

    await expect(actions.openNotificationSettings()).resolves.toMatchObject({ ok: true });
    await expect(actions.reloadApp()).resolves.toMatchObject({ ok: true });
    expect(requested).toEqual(["settings", "reload"]);
  });

  it.each([
    ["settings", "Notification settings could not be opened."],
    ["cache", "Server cache could not be cleared."],
    ["reload", "The app could not be reloaded."],
  ] as const)("reports a safe %s failure", async (operation, expectedMessage) => {
    const failures: string[] = [];
    const error = new Error("token=secret-value");
    const actions = createDeveloperActions(
      dependencies({
        openNotificationSettings: async () => {
          if (operation === "settings") throw error;
        },
        clearPersistedQueryCache: async () => {
          if (operation === "cache") throw error;
        },
        reloadApp: async () => {
          if (operation === "reload") throw error;
        },
        reportFailure: (action) => failures.push(action),
      })
    );

    let result;
    if (operation === "settings") {
      result = await actions.openNotificationSettings();
    } else if (operation === "cache") {
      result = await actions.clearServerCache();
    } else {
      result = await actions.reloadApp();
    }

    expect(result).toEqual({ ok: false, message: expectedMessage });
    expect(JSON.stringify(result)).not.toContain("secret-value");
    expect(failures).toEqual([operation]);
  });
});
