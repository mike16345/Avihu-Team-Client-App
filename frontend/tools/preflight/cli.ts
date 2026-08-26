import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { assertTenantEasActionAllowed, parseTenantEnvironment } from "../../config/tenants/schema";
import { createPreflightContext } from "./contexts";
import { runChecks } from "./engine";
import { applyPolicy } from "./policy";
import { renderHuman } from "./renderHuman";
import { renderJson } from "./renderJson";
import { runSpawnProcess } from "./processCheck";
import { createEasSuite, createFastSuite, createReleaseSuite } from "./suites";
import type { PreflightMode } from "./types";
import type { TenantConfig } from "../../config/tenants/types";
import { publishPreflightFile } from "./safePublication";
import { resolveExpoProjectEnvironment } from "./projectEnv";

interface CliArguments {
  mode: PreflightMode;
  tenantId: string;
  environment: ReturnType<typeof parseTenantEnvironment>;
  jsonPath?: string;
}

const parseMode = (value: string | undefined): PreflightMode => {
  if (value === "fast" || value === "release" || value === "eas") {
    return value;
  }
  throw new Error(
    "Usage: tsx tools/preflight/cli.ts <fast|release|eas> --tenant <id> --environment <name>"
  );
};

export const parsePreflightArguments = (
  argv: string[],
  processEnv: Readonly<Record<string, string | undefined>> = process.env
): CliArguments => {
  const parsed = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      tenant: { type: "string" },
      environment: { type: "string" },
      json: { type: "string" },
    },
  });
  const mode = parseMode(parsed.positionals[0]);
  if (parsed.positionals.length !== 1) {
    throw new Error("Preflight accepts exactly one mode: fast, release, or eas.");
  }
  const tenantId = parsed.values.tenant ?? processEnv.APP_TENANT;
  if (!tenantId) {
    throw new Error("--tenant <tenant-id> is required when APP_TENANT is absent.");
  }
  const environment = parseTenantEnvironment(parsed.values.environment ?? processEnv.APP_ENV);

  return {
    mode,
    tenantId,
    environment,
    ...(parsed.values.json ? { jsonPath: parsed.values.json } : {}),
  };
};

const parseSmokeCommand = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("PREFLIGHT_SMOKE_COMMAND_JSON must be a JSON array of command arguments.");
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    parsed.some((part) => typeof part !== "string" || part.length === 0)
  ) {
    throw new Error("PREFLIGHT_SMOKE_COMMAND_JSON must be a non-empty JSON string array.");
  }

  return { command: parsed[0], args: parsed.slice(1) };
};

const resolveJsonPath = (projectRoot: string, requestedPath: string) => {
  const reportRoot = path.join(projectRoot, ".preflight");
  const target = path.resolve(projectRoot, requestedPath);
  if (target !== reportRoot && !target.startsWith(`${reportRoot}${path.sep}`)) {
    throw new Error("--json output must be inside the project's .preflight directory.");
  }
  return target;
};

export interface PreflightCliDependencies {
  argv: string[];
  projectRoot: string;
  processEnv: Readonly<Record<string, string | undefined>>;
  platform: NodeJS.Platform;
  runner: typeof runSpawnProcess;
  now: () => Date;
  writeOutput: (value: string) => void;
}

export const assertPreflightAllowed = (tenant: TenantConfig, mode: PreflightMode) => {
  if (mode !== "fast") assertTenantEasActionAllowed(tenant, `${mode} preflight`);
  if (tenant.kind === "local" && mode !== "fast") {
    throw new Error(`Local tenant "${tenant.id}" cannot run ${mode} preflight`);
  }
};

export const runPreflightCli = async (dependencies: PreflightCliDependencies) => {
  const { projectRoot } = dependencies;
  const args = parsePreflightArguments(dependencies.argv, dependencies.processEnv);
  const timestamp = dependencies.now().toISOString();
  const configuration = await createPreflightContext({
    projectRoot,
    tenantId: args.tenantId,
    environment: args.environment,
    processEnv: dependencies.processEnv,
    timestamp,
  });
  assertPreflightAllowed(configuration.tenantConfig, args.mode);
  const smokeCommand = parseSmokeCommand(dependencies.processEnv.PREFLIGHT_SMOKE_COMMAND_JSON);
  const context = {
    ...configuration,
    runner: dependencies.runner,
    platform: dependencies.platform,
    ...(smokeCommand ? { smokeCommand } : {}),
  };
  const suite =
    args.mode === "release"
      ? createReleaseSuite(context)
      : args.mode === "eas"
        ? createEasSuite(context)
        : createFastSuite(context);
  const report = applyPolicy(await runChecks(suite, context), { mode: args.mode });

  if (args.jsonPath) {
    const jsonPath = resolveJsonPath(projectRoot, args.jsonPath);
    const json = renderJson(report);
    await publishPreflightFile(projectRoot, jsonPath, json);
    dependencies.writeOutput(json);
  } else {
    dependencies.writeOutput(`${renderHuman(report)}\n`);
  }

  return report.exitCode;
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain)
  void runPreflightCli({
    argv: process.argv.slice(2),
    projectRoot: process.cwd(),
    processEnv: resolveExpoProjectEnvironment(process.cwd(), process.env),
    platform: process.platform,
    runner: runSpawnProcess,
    now: () => new Date(),
    writeOutput: (value) => process.stdout.write(value),
  })
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `${message}\nRemediation: select a valid tenant/environment and rerun preflight.`
      );
      process.exitCode = 1;
    });
