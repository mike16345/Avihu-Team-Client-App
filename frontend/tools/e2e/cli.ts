import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

import {
  E2E_ARTIFACT_DIR,
  resolveE2EConfig,
  type E2EConfig,
} from "./config";
import { redactArtifactSecrets } from "./artifactRedaction";
import { runProcess, type ProcessRunner } from "./processRunner";

export interface E2ERunDependencies {
  processEnv: Readonly<Record<string, string | undefined>>;
  runProcess: ProcessRunner;
  ensureDirectory: (path: string) => void;
  redactArtifacts: (root: string, secrets: readonly string[]) => void;
  writeOutput: (value: string) => void;
}

interface E2ERunOptions {
  preflightOnly?: boolean;
}

const writeFailure = (dependencies: E2ERunDependencies, message: string) => {
  dependencies.writeOutput(`E2E preflight failed: ${message}\n`);
  return 1;
};

const redact = (value: string, config: E2EConfig) => {
  let redacted = value;
  for (const secret of [config.email, config.password]) {
    if (secret) redacted = redacted.split(secret).join("[REDACTED]");
  }
  return redacted;
};

export const runE2EAndroid = async (
  dependencies: E2ERunDependencies,
  options: E2ERunOptions = {}
): Promise<number> => {
  let config: E2EConfig;
  try {
    config = resolveE2EConfig(dependencies.processEnv, {
      requireCredentials: !options.preflightOnly,
    });
  } catch (error) {
    return writeFailure(dependencies, error instanceof Error ? error.message : String(error));
  }

  const maestroVersion = await dependencies.runProcess({
    command: "maestro",
    args: ["--version"],
    env: { ...dependencies.processEnv },
    stdio: "pipe",
  });
  if (maestroVersion.exitCode !== 0) {
    return writeFailure(dependencies, "Maestro CLI is unavailable. Install it and retry.");
  }

  const devices = await dependencies.runProcess({
    command: "adb",
    args: ["devices"],
    env: { ...dependencies.processEnv },
    stdio: "pipe",
  });
  const hasAuthorizedDevice = devices.exitCode === 0 && /^\S+\s+device$/m.test(devices.stdout);
  if (!hasAuthorizedDevice) {
    return writeFailure(
      dependencies,
      "No authorized Android device is connected. Start an emulator or authorize a device."
    );
  }

  const installedApp = await dependencies.runProcess({
    command: "adb",
    args: ["shell", "pm", "path", config.appId],
    env: { ...dependencies.processEnv },
    stdio: "pipe",
  });
  if (installedApp.exitCode !== 0 || !installedApp.stdout.includes("package:")) {
    return writeFailure(
      dependencies,
      `Expected preview app is not installed (${config.appId}). Install the E2E APK and retry.`
    );
  }

  if (options.preflightOnly) {
    dependencies.writeOutput("E2E Android preflight passed.\n");
    return 0;
  }

  dependencies.ensureDirectory(`${E2E_ARTIFACT_DIR}/debug`);
  const rejectedSuffix = Date.now().toString(36);
  const maestro = await dependencies.runProcess({
    command: "maestro",
    args: [
      "test",
      "--config",
      ".maestro/config.yaml",
      "--format",
      "HTML",
      "--output",
      `${E2E_ARTIFACT_DIR}/report.html`,
      "--debug-output",
      `${E2E_ARTIFACT_DIR}/debug`,
      config.flowDir,
    ],
    env: {
      ...dependencies.processEnv,
      MAESTRO_APP_ID: config.appId,
      MAESTRO_E2E_EMAIL: config.email,
      MAESTRO_E2E_PASSWORD: config.password,
      MAESTRO_REJECTED_EMAIL: `maestro-rejected-${rejectedSuffix}@example.invalid`,
      MAESTRO_REJECTED_PASSWORD: `rejected-${rejectedSuffix}`,
      MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
      MAESTRO_CLI_NO_ANALYTICS: "true",
    },
    stdio: "pipe",
  });
  dependencies.redactArtifacts(
    E2E_ARTIFACT_DIR,
    [config.email, config.password].filter((value): value is string => Boolean(value))
  );

  if (maestro.exitCode !== 0) {
    const diagnostics = redact([maestro.stdout, maestro.stderr].filter(Boolean).join("\n"), config);
    dependencies.writeOutput(`Maestro failed with exit code ${maestro.exitCode}.\n`);
    if (diagnostics.trim()) dependencies.writeOutput(`${diagnostics.trim()}\n`);
    return maestro.exitCode;
  }

  dependencies.writeOutput(
    `Five Maestro flows passed. Report: ${E2E_ARTIFACT_DIR}/report.html\n`
  );
  return 0;
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const preflightOnly = process.argv.slice(2).includes("--preflight-only");
  void runE2EAndroid(
    {
      processEnv: process.env,
      runProcess,
      ensureDirectory: (directory) => mkdirSync(directory, { recursive: true }),
      redactArtifacts: redactArtifactSecrets,
      writeOutput: (value) => process.stdout.write(value),
    },
    { preflightOnly }
  ).then((exitCode) => {
    process.exitCode = exitCode;
  });
}
