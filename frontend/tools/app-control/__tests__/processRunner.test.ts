import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createCommandRunner } from "../processRunner";
import type { CommandSpec } from "../types";

const buildSpec: CommandSpec = {
  command: "npx",
  args: ["--yes", "eas-cli@16.27.0", "build", "--platform", "android", "--profile", "production"],
  env: { APP_TENANT: "avihu", APP_ENV: "production" },
  label: "Build Elevate Coach (production) for android",
  prerequisite: {
    command: "npm",
    args: ["run", "preflight:eas"],
    env: { APP_TENANT: "avihu", APP_ENV: "production" },
    label: "EAS preflight for Elevate Coach (production)",
  },
};

const childFor = (code: number | null, signal: NodeJS.Signals | null = null) => {
  const child = new EventEmitter() as EventEmitter & { kill: ReturnType<typeof vi.fn> };
  child.kill = vi.fn(() => true);
  queueMicrotask(() => child.emit("close", code, signal));
  return child;
};

describe("command runner build prerequisite", () => {
  it("runs the exact tenant-scoped EAS preflight before the pinned EAS build", async () => {
    const calls: Array<{ command: string; args: string[]; env?: NodeJS.ProcessEnv }> = [];
    const runner = createCommandRunner({
      spawnProcess: ((command: string, args: string[], options: { env?: NodeJS.ProcessEnv }) => {
        calls.push({ command, args, env: options.env });
        return childFor(0);
      }) as never,
    });

    await expect(runner(buildSpec)).resolves.toBe(0);
    expect(calls).toEqual([
      {
        command: "npm",
        args: ["run", "preflight:eas"],
        env: expect.objectContaining({ APP_TENANT: "avihu", APP_ENV: "production" }),
      },
      {
        command: "npx",
        args: [
          "--yes",
          "eas-cli@16.27.0",
          "build",
          "--platform",
          "android",
          "--profile",
          "production",
        ],
        env: expect.objectContaining({ APP_TENANT: "avihu", APP_ENV: "production" }),
      },
    ]);
  });

  it("does not start EAS when preflight fails", async () => {
    const spawnProcess = vi.fn(() => childFor(1));
    const runner = createCommandRunner({ spawnProcess: spawnProcess as never });

    await expect(runner(buildSpec)).resolves.toBe(1);
    expect(spawnProcess).toHaveBeenCalledTimes(1);
  });

  it("does not start EAS when preflight closes from a signal", async () => {
    const spawnProcess = vi.fn(() => childFor(null, "SIGTERM"));
    const runner = createCommandRunner({ spawnProcess: spawnProcess as never });

    await expect(runner(buildSpec)).resolves.toBe(1);
    expect(spawnProcess).toHaveBeenCalledTimes(1);
  });

  it("does not start EAS when preflight cannot be started", async () => {
    const child = new EventEmitter();
    const spawnProcess = vi.fn(() => {
      queueMicrotask(() => child.emit("error", new Error("npm unavailable")));
      return child;
    });
    const runner = createCommandRunner({ spawnProcess: spawnProcess as never });

    await expect(runner(buildSpec)).resolves.toBe(1);
    expect(spawnProcess).toHaveBeenCalledTimes(1);
  });
});
