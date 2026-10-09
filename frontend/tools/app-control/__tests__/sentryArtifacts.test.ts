import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import {
  assertSentryUploadCredentials,
  createSentryUploadRetryCommand,
  createSentryArtifactUploadStep,
  recordPublishedArtifacts,
  validatePublishedArtifacts,
} from "../sentryArtifacts";
import { createCommandRunner } from "../processRunner";
import { formatDryRun } from "../dryRun";
const selection = { action: "update", tenantId: "avihu", environment: "preview" } as const;
const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));
it("validates credentials without exposing their values", () => {
  expect(() => assertSentryUploadCredentials(selection, {})).toThrow("SENTRY_AUTH_TOKEN");
  expect(() =>
    assertSentryUploadCredentials(selection, { SENTRY_AUTH_TOKEN: "secret-fixture" })
  ).not.toThrow();
  expect(
    JSON.stringify(createSentryUploadRetryCommand(selection, ".sentry-artifacts/test"))
  ).not.toContain("secret-fixture");
});
it("rejects wrong selections and changed artifacts; retry uploads without publishing", () => {
  const root = mkdtempSync(join(tmpdir(), "sentry-artifacts-"));
  roots.push(root);
  const dir = join(root, ".sentry-artifacts", "test");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "bundle.js"), "original");
  writeFileSync(join(dir, "bundle.js.map"), "{}");
  recordPublishedArtifacts(selection, dir);
  expect(() => validatePublishedArtifacts(selection, dir)).not.toThrow();
  expect(() =>
    validatePublishedArtifacts({ ...selection, environment: "production" }, dir)
  ).toThrow();
  expect(createSentryUploadRetryCommand(selection, dir).args).not.toContain("update");
  writeFileSync(join(dir, "bundle.js"), "different");
  expect(() => validatePublishedArtifacts(selection, dir)).toThrow("changed");
});
it("sequences preflight, publication, upload, and returns upload failure", async () => {
  const upload = createSentryArtifactUploadStep(selection, ".sentry-artifacts/test")!;
  const spec = {
    command: "publish",
    args: [],
    env: upload.env,
    label: "Publish",
    prerequisite: { ...upload, command: "preflight" },
    successor: upload,
  };
  const codes = [0, 0, 9];
  const commands: string[] = [];
  const spawnProcess = vi.fn((command: string) => {
    commands.push(command);
    const child = new EventEmitter();
    queueMicrotask(() => child.emit("close", codes.shift()));
    return child;
  });
  const runner = createCommandRunner({
    spawnProcess: spawnProcess as never,
    writeOutput: () => {},
    writeError: () => {},
  });
  expect(await runner(spec)).toBe(9);
  expect(commands).toEqual(["preflight", "publish", "npx"]);
  expect(formatDryRun(spec)).toContain("Upload Sentry");
  commands.length = 0;
  codes.push(0, 1);
  expect(await runner(spec)).toBe(1);
  expect(commands).toEqual(["preflight", "publish"]);
});
