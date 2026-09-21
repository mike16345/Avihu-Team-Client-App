import { spawn } from "node:child_process";
import path from "node:path";

import type { ConfigurationPreflightContext } from "./contexts";
import { publishPreflightFile } from "./safePublication";
import type { CheckDefinition, CheckResult } from "./types";

export interface ProcessSpec {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
  outputTruncated?: boolean;
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
  cwd?: string | ((context: Readonly<ProcessPreflightContext>) => string);
  timeoutMs?: number;
  maxOutputBytes?: number;
  redactCommand?: boolean;
  sensitiveValues?: readonly string[];
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
  processEnv: Readonly<Record<string, string | undefined>>,
  sensitiveValues: readonly string[] = []
) => {
  const redacted = sensitiveValues
    .filter((candidate) => candidate.length > 0)
    .sort((left, right) => right.length - left.length)
    .reduce((sanitized, candidate) => sanitized.replaceAll(candidate, "[REDACTED]"), value);

  return redactEnvironmentValues(redacted, processEnv)
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
};

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

const writeSanitizedLog = async (
  context: Readonly<ProcessPreflightContext>,
  logPath: string,
  spec: Readonly<ProcessSpec>,
  result: Readonly<ProcessResult>
) => {
  const sanitized = sanitizeProcessOutput(buildFullLog(spec, result), context.processEnv);
  await publishPreflightFile(context.projectRoot, logPath, `${sanitized.trimEnd()}\n`);
  return { logPath, sanitized };
};

export interface SpawnRunnerOptions {
  terminateTree?: (pid: number, force: boolean) => void;
  spawnProcess?: typeof spawn;
}

const defaultTerminateTree = (pid: number, force: boolean) => {
  if (process.platform === "win32") {
    spawn("taskkill.exe", ["/pid", String(pid), "/t", ...(force ? ["/f"] : [])], {
      shell: false,
      stdio: "ignore",
    });
    return;
  }
  const signal = force ? "SIGKILL" : "SIGTERM";
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      process.kill(pid, signal);
    } catch {
      // The process may have exited between the timeout and termination.
    }
  }
};

export const createSpawnProcessRunner =
  (options: SpawnRunnerOptions = {}): ProcessRunner =>
  (spec) =>
    new Promise((resolve) => {
      const limit = spec.maxOutputBytes ?? 2 * 1024 * 1024;
      const timeoutMs = spec.timeoutMs ?? 10 * 60 * 1000;
      const child = (options.spawnProcess ?? spawn)(spec.command, spec.args, {
        cwd: spec.cwd,
        env: { ...process.env, ...spec.env },
        shell: false,
        detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout: Buffer<ArrayBufferLike> = Buffer.alloc(0);
      let stderr: Buffer<ArrayBufferLike> = Buffer.alloc(0);
      let outputTruncated = false;
      let settled = false;
      let timedOut = false;
      let forceTimeout: ReturnType<typeof setTimeout> | undefined;

      const append = (current: Buffer<ArrayBufferLike>, chunk: Buffer) => {
        if (current.length >= limit) {
          outputTruncated = true;
          return current;
        }
        const remaining = limit - current.length;
        if (chunk.length > remaining) {
          outputTruncated = true;
        }
        return Buffer.concat([current, chunk.subarray(0, remaining)]);
      };

      const finish = (exitCode: number, signal?: string, errorMessage?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (forceTimeout) clearTimeout(forceTimeout);
        resolve({
          exitCode,
          stdout: stdout.toString(),
          stderr:
            errorMessage ?? `${stderr.toString()}${signal ? `\nTerminated by ${signal}` : ""}`,
          timedOut,
          outputTruncated,
        });
      };

      const timeout = setTimeout(() => {
        timedOut = true;
        const terminate = options.terminateTree ?? defaultTerminateTree;
        terminate(child.pid ?? 0, false);
        forceTimeout = setTimeout(() => {
          if (!settled) {
            terminate(child.pid ?? 0, true);
            finish(1, "SIGKILL");
          }
        }, 1_000).unref();
      }, timeoutMs);
      timeout.unref();

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = append(stdout, chunk);
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr = append(stderr, chunk);
      });
      child.once("error", (error) => {
        finish(1, undefined, error.message);
      });
      child.once("close", (code, signal) => {
        finish(code ?? 1, signal ?? undefined);
      });
    });

export const runSpawnProcess = createSpawnProcessRunner();

export interface ProcessCheckExecution {
  result: CheckResult;
  sanitizedStdout: string;
  sanitizedStderr: string;
  outputTruncated: boolean;
}

export const executeProcessCheck = async (
  options: ProcessCheckOptions,
  context: Readonly<ProcessPreflightContext>
): Promise<ProcessCheckExecution> => {
  const logPath = path.join(
    getPreflightRunDirectory(context),
    `${safePathSegment(options.check)}.log`
  );
  const spec: ProcessSpec = {
    command: options.command,
    args: [...options.args],
    cwd:
      typeof options.cwd === "function"
        ? options.cwd(context)
        : (options.cwd ?? context.projectRoot),
    env: { APP_TENANT: context.tenant, APP_ENV: context.environment, ...options.env },
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    ...(options.maxOutputBytes === undefined ? {} : { maxOutputBytes: options.maxOutputBytes }),
  };
  // Validate the destination before starting an expensive command.
  await publishPreflightFile(context.projectRoot, logPath, "[pending]\n");
  const raw: ProcessResult = await context.runner(spec).catch((error: unknown) => ({
    exitCode: 1,
    stdout: "",
    stderr: error instanceof Error ? error.message : String(error),
  }));
  const sanitizedStdout = sanitizeProcessOutput(
    raw.stdout,
    context.processEnv,
    options.sensitiveValues
  );
  const sanitizedStderr = sanitizeProcessOutput(
    raw.stderr,
    context.processEnv,
    options.sensitiveValues
  );
  const displaySpec = options.redactCommand
    ? { ...spec, command: "[CONFIGURED COMMAND]", args: ["[REDACTED]"] }
    : spec;
  await writeSanitizedLog(context, logPath, displaySpec, {
    ...raw,
    stdout: sanitizedStdout,
    stderr: sanitizedStderr,
  });

  if (raw.exitCode === 0 && !raw.timedOut) {
    return {
      result: { status: "pass", check: options.check, summary: options.successSummary },
      sanitizedStdout,
      sanitizedStderr,
      outputTruncated: raw.outputTruncated === true,
    };
  }
  const safeCommand = options.redactCommand
    ? "[CONFIGURED COMMAND REDACTED]"
    : sanitizeProcessOutput([options.command, ...options.args].join(" "), context.processEnv);
  return {
    result: {
      status: "fail",
      check: options.check,
      summary: raw.timedOut ? `${options.failureSummary} (timed out)` : options.failureSummary,
      details: [
        `Command: ${safeCommand}`,
        `Exit code: ${raw.exitCode}`,
        ...(raw.outputTruncated ? ["Output was truncated at the configured safety limit."] : []),
        ...truncateEvidence(sanitizedStdout, sanitizedStderr),
        `Full sanitized log: ${logPath}`,
      ],
      remediation: `${options.remediation} Log: ${logPath}`,
    },
    sanitizedStdout,
    sanitizedStderr,
    outputTruncated: raw.outputTruncated === true,
  };
};

export const createProcessCheck = (
  options: ProcessCheckOptions
): CheckDefinition<ProcessPreflightContext> => ({
  check: options.check,
  run: async (context): Promise<CheckResult> =>
    (await executeProcessCheck(options, context)).result,
});
