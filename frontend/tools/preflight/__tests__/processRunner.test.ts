import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";

import { createSpawnProcessRunner } from "../processCheck";

describe("bounded process runner", () => {
  it("bounds noisy output and terminates a hung process tree on timeout", async () => {
    const child = new EventEmitter() as EventEmitter & {
      pid: number;
      stdout: PassThrough;
      stderr: PassThrough;
    };
    child.pid = 42;
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    const terminations: Array<[number, boolean]> = [];
    const runner = createSpawnProcessRunner({
      spawnProcess: (() => {
        queueMicrotask(() => child.stdout.write("x".repeat(1_000)));
        return child;
      }) as never,
      terminateTree: (pid, force) => {
        terminations.push([pid, force]);
        if (!force) child.emit("close", null, "SIGTERM");
      },
    });
    const result = await runner({
      command: "fixture",
      args: [],
      cwd: "/workspace",
      env: {},
      timeoutMs: 5,
      maxOutputBytes: 32,
    });
    expect(result).toMatchObject({ timedOut: true, outputTruncated: true });
    expect(result.stdout).toHaveLength(32);
    expect(terminations).toEqual([[42, false]]);
  });
});
