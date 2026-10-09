import { beforeEach, expect, it, vi } from "vitest";
import { createDeveloperActions } from "@/devtools/actions";
import { setErrorReporter } from "../reportError";
const captured: { error: Error; context: any }[] = [];
beforeEach(() => {
  captured.length = 0;
  setErrorReporter((error, context) => {
    captured.push({ error, context });
    return "event";
  });
});
it("reports swallowed developer storage failures without changing the fallback", async () => {
  const original = new Error("storage unavailable");
  const actions = createDeveloperActions({
    getNotificationPermission: async () => "granted",
    requestNotificationPermission: async () => "granted",
    scheduleTestNotification: async () => "id",
    openNotificationSettings: async () => {},
    clearMemoryQueryCache: () => {},
    clearPersistedQueryCache: async () => {
      throw original;
    },
    reloadApp: async () => {},
    reportFailure: () => {},
  });
  const result = await actions.clearServerCache();
  expect(result.ok).toBe(false);
  expect(captured).toHaveLength(1);
  expect(captured[0].error).toBe(original);
  expect(captured[0].context.operation).toContain("clearServerCache");
});
const task = vi.hoisted(() => ({ callback: undefined as undefined | (() => Promise<unknown>) }));
vi.mock("expo-task-manager", () => ({
  defineTask: (_name: string, callback: () => Promise<unknown>) => {
    task.callback = callback;
  },
  isTaskRegisteredAsync: async () => false,
}));
vi.mock("expo-background-task", () => ({
  BackgroundTaskResult: { Success: "success", Failed: "failed" },
  registerTaskAsync: async () => {},
}));
vi.mock("react", () => ({ default: { useCallback: (callback: unknown) => callback } }));
const state = vi.hoisted(() => ({ failure: new Error("background storage failed") }));
vi.mock("@/store/notificationStore", () => ({
  useNotificationStore: {
    getState: () => ({
      updateNotificationsPastTriggerTime: () => {
        throw state.failure;
      },
    }),
  },
}));
it("reports background task failures while returning the existing failed result", async () => {
  const { default: useBackgroundTasks } = await import("@/hooks/useBackgroundTasks");
  useBackgroundTasks();
  expect(await task.callback!()).toBe("failed");
  expect(captured[0].error).toBe(state.failure);
  expect(captured).toHaveLength(1);
});
