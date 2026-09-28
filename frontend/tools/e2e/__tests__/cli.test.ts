import { describe, expect, it, vi } from "vitest";

import { runE2EAndroid, type E2ERunDependencies } from "../cli";
import type { ProcessResult, ProcessSpec } from "../processRunner";

const email = ["mobile-e2e", "example.invalid"].join("@");
const password = ["unit", "test", "credential"].join("-");

const environment = {
  APP_ENV: "preview",
  E2E_API_URL: "https://api.example.invalid/test",
  MAESTRO_E2E_EMAIL: email,
  MAESTRO_E2E_PASSWORD: password,
};

const successFor = (spec: ProcessSpec): ProcessResult => {
  if (spec.command === "adb" && spec.args[0] === "devices") {
    return { exitCode: 0, stdout: "List of devices attached\nemulator-5554\tdevice\n", stderr: "" };
  }
  if (spec.command === "adb") {
    return {
      exitCode: 0,
      stdout: "package:/data/app/com.avihuteam.avihuteam/base.apk\n",
      stderr: "",
    };
  }
  return { exitCode: 0, stdout: "ok\n", stderr: "" };
};

const setup = (implementation: (spec: ProcessSpec) => ProcessResult = successFor) => {
  const calls: ProcessSpec[] = [];
  const output: string[] = [];
  const directories: string[] = [];
  const dependencies: E2ERunDependencies = {
    processEnv: environment,
    runProcess: vi.fn(async (spec: ProcessSpec) => {
      calls.push(spec);
      return implementation(spec);
    }),
    ensureDirectory: vi.fn((path: string) => directories.push(path)),
    redactArtifacts: vi.fn(),
    writeOutput: vi.fn((value: string) => output.push(value)),
  };

  return { calls, dependencies, directories, output };
};

describe("runE2EAndroid", () => {
  it("fails when Maestro is unavailable", async () => {
    const context = setup((spec) =>
      spec.command === "maestro" && spec.args[0] === "--version"
        ? { exitCode: 127, stdout: "", stderr: "command not found" }
        : successFor(spec)
    );

    expect(await runE2EAndroid(context.dependencies)).toBe(1);
    expect(context.output.join("\n")).toContain("Maestro CLI is unavailable");
  });

  it("fails when adb reports no authorized device", async () => {
    const context = setup((spec) =>
      spec.command === "adb" && spec.args[0] === "devices"
        ? { exitCode: 0, stdout: "List of devices attached\n", stderr: "" }
        : successFor(spec)
    );

    expect(await runE2EAndroid(context.dependencies)).toBe(1);
    expect(context.output.join("\n")).toContain("No authorized Android device");
  });

  it("fails when the expected package is not installed", async () => {
    const context = setup((spec) =>
      spec.command === "adb" && spec.args[0] === "shell"
        ? { exitCode: 1, stdout: "", stderr: "package not found" }
        : successFor(spec)
    );

    expect(await runE2EAndroid(context.dependencies)).toBe(1);
    expect(context.output.join("\n")).toContain("Expected preview app is not installed");
  });

  it("passes credentials through the process environment without exposing them in arguments", async () => {
    const context = setup();

    expect(await runE2EAndroid(context.dependencies)).toBe(0);
    const testCall = context.calls.find(
      (spec) => spec.command === "maestro" && spec.args[0] === "test"
    );
    expect(testCall?.env).toMatchObject({
      MAESTRO_E2E_EMAIL: email,
      MAESTRO_E2E_PASSWORD: password,
    });
    expect(testCall?.args.join(" ")).not.toContain(email);
    expect(testCall?.args.join(" ")).not.toContain(password);
    expect(context.output.join("\n")).not.toContain(email);
    expect(context.output.join("\n")).not.toContain(password);
    expect(context.dependencies.redactArtifacts).toHaveBeenCalledWith(".maestro-artifacts", [
      email,
      password,
    ]);
  });

  it("writes HTML and debug artifacts under the ignored artifact directory", async () => {
    const context = setup();

    expect(await runE2EAndroid(context.dependencies)).toBe(0);
    const testCall = context.calls.find(
      (spec) => spec.command === "maestro" && spec.args[0] === "test"
    );
    expect(context.directories).toContain(".maestro-artifacts/debug");
    expect(testCall?.args).toEqual(
      expect.arrayContaining([
        "--format",
        "HTML",
        "--output",
        ".maestro-artifacts/report.html",
        "--debug-output",
        ".maestro-artifacts/debug",
      ])
    );
  });

  it("returns Maestro's nonzero exit status", async () => {
    const context = setup((spec) =>
      spec.command === "maestro" && spec.args[0] === "test"
        ? { exitCode: 7, stdout: "flow failed", stderr: "selector missing" }
        : successFor(spec)
    );

    expect(await runE2EAndroid(context.dependencies)).toBe(7);
    expect(context.output.join("\n")).toContain("Maestro failed with exit code 7");
  });
});
