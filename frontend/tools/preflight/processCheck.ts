import { spawn } from "node:child_process";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ConfigurationPreflightContext } from "./contexts";
import type { CheckDefinition, CheckResult } from "./types";

export interface ProcessSpec {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type ProcessRunner = (spec: Readonly<ProcessSpec>) => Promise<ProcessResult>;

export interface ProcessPreflightContext extends ConfigurationPreflightContext {
  runner: ProcessRunner;
  platform: NodeJS.Platform;
  smokeCommand?: Readonly<{ command: string; args: readonly string[] }>;
}

export interface ProcessCheckOptions {
  check: string;
  command: string;
  args: readonly string[];
  successSummary: string;
  failureSummary: string;
  remediation: string;
  env?: Readonly<Record<string, string>>;
}

const MAX_EVIDENCE_LINES = 8;
const MAX_EVIDENCE_LINE_LENGTH = 240;

const safePathSegment = (value: string) => value.replace(/[^a-zA-Z0-9._-]+/gu, "-");

const safeTimestamp = (value: string) =>
  safePathSegment(value).replaceAll(":", "-").replaceAll(".", "-");

export const getPreflightRunDirectory = (
  context: Pick<ProcessPreflightContext, "projectRoot" | "timestamp">
) =>
  path.join(
    context.projectRoot,
    ".preflight",
    safeTimestamp(context.timestamp ?? new Date().toISOString())
  );

const redactEnvironmentValues = (
  value: string,
  processEnv: Readonly<Record<string, string | undefined>>
) => {
  const environmentValues = Object.values(processEnv)
    .filter((candidate): candidate is string => Boolean(candidate && candidate.length >= 4))
    .sort((left, right) => right.length - left.length);

  return environmentValues.reduce(
    (sanitized, environmentValue) => sanitized.replaceAll(environmentValue, "[REDACTED]"),
    value
  );
};

export const sanitizeProcessOutput = (
  value: string,
  processEnv: Readonly<Record<string, string | undefined>>
) =>
  redactEnvironmentValues(value, processEnv)
    .replace(/(Authorization\s*:\s*Bearer\s+)[^\s]+/giu, "$1[REDACTED]")
    .replace(
      /((?:--?[A-Z0-9_-]*(?:TOKEN|SECRET|PASSWORD|API_KEY|AUTH)[A-Z0-9_-]*)(?:=|\s+))[^\s]+/giu,
      "$1[REDACTED]"
    )
    .replace(
      /((?:[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|AUTH)[A-Z0-9_]*)\s*[=:]\s*)[^\s]+/giu,
      "$1[REDACTED]"
    )
    .replace(/(https?:\/\/)[^\s/@:]+:[^\s/@]+@/giu, "$1[REDACTED]@")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "");

const buildFullLog = (spec: Readonly<ProcessSpec>, result: Readonly<ProcessResult>) =>
  [
    `[command] ${[spec.command, ...spec.args].join(" ")}`,
    `[exit] ${result.exitCode}`,
    "[stdout]",
    result.stdout,
    "[stderr]",
    result.stderr,
  ].join("\n");

const truncateEvidence = (stdout: string, stderr: string) => {
  const evidence = [stderr, stdout]
    .flatMap((stream) => stream.split(/\r?\n/u))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_EVIDENCE_LINES)
    .map((line) =>
      line.length > MAX_EVIDENCE_LINE_LENGTH
        ? `${line.slice(0, MAX_EVIDENCE_LINE_LENGTH - 1)}…`
        : line
    );

  return evidence.length > 0 ? evidence : ["The command returned no diagnostic output."];
};

const resolveSafeLogPath = async (context: Readonly<ProcessPreflightContext>, check: string) => {
  const configuredLogRoot = path.join(context.projectRoot, ".preflight");
  await mkdir(configuredLogRoot, { recursive: true });
  const canonicalProjectRoot = await realpath(context.projectRoot);
  const canonicalLogRoot = await realpath(configuredLogRoot);
  if (
    canonicalLogRoot !== canonicalProjectRoot &&
    !canonicalLogRoot.startsWith(`${canonicalProjectRoot}${path.sep}`)
  ) {
    throw new Error("Preflight log directory resolves outside the project root");
  }

  const configuredRunDirectory = getPreflightRunDirectory(context);
  await mkdir(configuredRunDirectory, { recursive: true });
  const runDirectory = await realpath(configuredRunDirectory);
  if (
    runDirectory !== canonicalLogRoot &&
    !runDirectory.startsWith(`${canonicalLogRoot}${path.sep}`)
  ) {
    throw new Error("Preflight run directory resolves outside the log root");
  }
  return path.join(configuredRunDirectory, `${safePathSegment(check)}.log`);
};

const writeSanitizedLog = async (
  context: Readonly<ProcessPreflightContext>,
  logPath: string,
  spec: Readonly<ProcessSpec>,
  result: Readonly<ProcessResult>
) => {
  const sanitized = sanitizeProcessOutput(buildFullLog(spec, result), context.processEnv);
  await writeFile(logPath, `${sanitized.trimEnd()}\n`, { encoding: "utf8", mode: 0o600 });
  return { logPath, sanitized };
};

export const runSpawnProcess: ProcessRunner = (spec) =>
  new Promise((resolve) => {
    const child = spawn(spec.command, spec.args, {
      cwd: spec.cwd,
      env: { ...process.env, ...spec.env },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let settled = false;

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.once("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({ exitCode: 1, stdout: Buffer.concat(stdout).toString(), stderr: error.message });
    });
    child.once("close", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({
        exitCode: code ?? 1,
        stdout: Buffer.concat(stdout).toString(),
        stderr: `${Buffer.concat(stderr).toString()}${signal ? `\nTerminated by ${signal}` : ""}`,
      });
    });
  });

export const createProcessCheck = (
  options: ProcessCheckOptions
): CheckDefinition<ProcessPreflightContext> => ({
  check: options.check,
  run: async (context): Promise<CheckResult> => {
    const spec: ProcessSpec = {
      command: options.command,
      args: [...options.args],
      cwd: context.projectRoot,
      env: {
        APP_TENANT: context.tenant,
        APP_ENV: context.environment,
        ...options.env,
      },
    };
    const logPath = await resolveSafeLogPath(context, options.check);
    const result = await context.runner(spec).catch((error: unknown) => ({
      exitCode: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
    }));
    const { sanitized } = await writeSanitizedLog(context, logPath, spec, result);

    if (result.exitCode === 0) {
      return {
        status: "pass",
        check: options.check,
        summary: options.successSummary,
      };
    }

    const separator = sanitized.indexOf("[stdout]\n");
    const streams = separator >= 0 ? sanitized.slice(separator + "[stdout]\n".length) : sanitized;
    const stderrMarker = streams.indexOf("\n[stderr]\n");
    const stdout = stderrMarker >= 0 ? streams.slice(0, stderrMarker) : streams;
    const stderr = stderrMarker >= 0 ? streams.slice(stderrMarker + "\n[stderr]\n".length) : "";
    const safeCommand = sanitizeProcessOutput(
      [options.command, ...options.args].join(" "),
      context.processEnv
    );

    return {
      status: "fail",
      check: options.check,
      summary: options.failureSummary,
      details: [
        `Command: ${safeCommand}`,
        `Exit code: ${result.exitCode}`,
        ...truncateEvidence(stdout, stderr),
        `Full sanitized log: ${logPath}`,
      ],
      remediation: `${options.remediation} Log: ${logPath}`,
    };
  },
});
