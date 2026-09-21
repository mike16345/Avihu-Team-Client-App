import { lstat, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { findReleaseAab, type CheckPrerequisite } from "./androidRelease";
import {
  createProcessCheck,
  getPreflightRunDirectory,
  type ProcessPreflightContext,
} from "../processCheck";
import type { CheckDefinition, CheckResult } from "../types";

const findFiles = async (root: string, predicate: (name: string) => boolean): Promise<string[]> => {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map(async (entry) => {
          const target = path.join(root, entry.name);
          if (entry.isDirectory()) {
            return findFiles(target, predicate);
          }
          return entry.isFile() && predicate(entry.name) ? [target] : [];
        })
      )
    )
      .flat()
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
};

const prerequisiteFailure = (check: string, result: CheckResult): CheckResult => ({
  status: "fail",
  check,
  summary: `Skipped because ${result.check} failed`,
  details: [result.summary],
  remediation: result.remediation ?? "Resolve the prerequisite failure and rerun preflight.",
});

export const createJavaScriptExportCheck = (
  ensurePrebuild: CheckPrerequisite,
  platforms: readonly ("ios" | "android")[] = ["ios", "android"]
): CheckDefinition<ProcessPreflightContext> => ({
  check: "javascript.production-export",
  run: async (context) => {
    const prebuild = await ensurePrebuild(context);
    if (prebuild.status === "fail") {
      return prerequisiteFailure("javascript.production-export", prebuild);
    }

    const outputDirectory = path.join(getPreflightRunDirectory(context), "export");
    const result = await createProcessCheck({
      check: "javascript.production-export",
      command: "npx",
      args: [
        "expo",
        "export",
        "--platform",
        platforms.length === 2 ? "all" : platforms[0],
        "--source-maps",
        "--output-dir",
        outputDirectory,
      ],
      env: { NODE_ENV: "production", CI: "1" },
      successSummary: "Production JavaScript export completed with source maps",
      failureSummary: "Production JavaScript export failed",
      remediation: "Run the production Expo export and resolve the Metro diagnostics.",
    }).run(context);

    if (result.status === "fail") {
      return result;
    }

    const analysis = await analyzeExpoExport(outputDirectory, platforms);
    if (!analysis.valid) {
      return {
        status: "fail",
        check: "javascript.production-export",
        summary: "Production export omitted JavaScript bundles or source maps",
        details: analysis.errors,
        remediation: "Re-run Expo export with --source-maps and inspect the export directory.",
      };
    }

    return {
      ...result,
      details: analysis.details,
    };
  },
});

export const createArtifactCheck = (
  ensureAndroidValidation: CheckPrerequisite | undefined,
  ensureExport: CheckPrerequisite,
  platforms: readonly ("ios" | "android")[] = ["ios", "android"],
  ensurePlatformValidations: readonly CheckPrerequisite[] = []
): CheckDefinition<ProcessPreflightContext> => ({
  check: "artifacts.release",
  run: async (context) => {
    const [androidResult, exportResult, ...platformResults] = await Promise.all([
      ensureAndroidValidation?.(context),
      ensureExport(context),
      ...ensurePlatformValidations.map((ensure) => ensure(context)),
    ]);
    const failed = [androidResult, exportResult, ...platformResults].find(
      (result) => result?.status === "fail"
    );
    if (failed) {
      return prerequisiteFailure("artifacts.release", failed);
    }

    const aabPath = await findReleaseAab(context.projectRoot);
    const mappingPath = path.join(
      context.projectRoot,
      "android",
      "app",
      "build",
      "outputs",
      "mapping",
      "release",
      "mapping.txt"
    );
    const exportDirectory = path.join(getPreflightRunDirectory(context), "export");
    const sourceMaps = await findFiles(exportDirectory, (name) => name.endsWith(".map"));
    const missing: string[] = [];

    if (platforms.includes("android") && !aabPath) {
      missing.push("Android release AAB");
    }
    if (platforms.includes("android")) {
      try {
        const mapping = await lstat(mappingPath);
        if (!mapping.isFile() || mapping.isSymbolicLink() || mapping.size === 0) {
          throw new Error("empty");
        }
      } catch {
        missing.push(`R8 mapping: ${mappingPath}`);
      }
    }
    if (sourceMaps.length === 0) {
      missing.push(`JavaScript source maps: ${exportDirectory}`);
    }

    if (missing.length > 0) {
      return {
        status: "fail",
        check: "artifacts.release",
        summary: "Required release artifacts are missing",
        details: missing,
        remediation:
          "Enable release shrinking/source maps as planned, rebuild, and retain the reported artifact paths.",
      };
    }

    if (platforms.includes("android") && !aabPath) {
      return {
        status: "fail",
        check: "artifacts.release",
        summary: "Required Android release AAB is missing",
        remediation: "Rebuild the Android release bundle and rerun preflight.",
      };
    }

    const [aabStats, mappingStats] = aabPath
      ? await Promise.all([lstat(aabPath), lstat(mappingPath)])
      : [undefined, undefined];
    const sourceMapStats = await Promise.all(sourceMaps.map((sourceMap) => stat(sourceMap)));
    const sourceMapBytes = sourceMapStats.reduce((total, file) => total + file.size, 0);

    return {
      status: "pass",
      check: "artifacts.release",
      summary: "Release artifacts and deobfuscation mappings are present",
      details: [
        ...(aabPath && aabStats && mappingStats
          ? [
              `AAB: ${aabPath} (${formatBytes(aabStats.size)})`,
              `R8 mapping: ${mappingPath} (${formatBytes(mappingStats.size)})`,
            ]
          : []),
        `JavaScript source maps: ${sourceMaps.length} (${formatBytes(sourceMapBytes)})`,
      ],
    };
  },
});

export const createSmokeInfrastructureCheck = (
  ensureArtifacts: CheckPrerequisite
): CheckDefinition<ProcessPreflightContext> => ({
  check: "smoke.infrastructure",
  run: async (context) => {
    if (!context.smokeCommand) {
      return {
        status: "warn",
        check: "smoke.infrastructure",
        summary: "No automated release smoke command is configured",
        remediation:
          "Run the documented device smoke checklist, or configure PREFLIGHT_SMOKE_COMMAND_JSON as a JSON argument array.",
      };
    }

    const artifacts = await ensureArtifacts(context);
    if (artifacts.status === "fail") {
      return prerequisiteFailure("smoke.infrastructure", artifacts);
    }

    return createProcessCheck({
      check: "smoke.infrastructure",
      command: context.smokeCommand.command,
      args: context.smokeCommand.args,
      successSummary: "Configured release smoke tests passed",
      failureSummary: "Configured release smoke tests failed",
      remediation:
        "Inspect the configured device/simulator smoke-test log and fix the failed flow.",
      redactCommand: true,
      sensitiveValues: [context.smokeCommand.command, ...context.smokeCommand.args],
    }).run(context);
  },
});

interface ExportMetadata {
  version?: unknown;
  bundler?: unknown;
  fileMetadata?: Record<string, { bundle?: unknown }>;
}

export const analyzeExpoExport = async (
  outputDirectory: string,
  platforms: readonly ("ios" | "android")[]
) => {
  const errors: string[] = [];
  const details: string[] = [];
  let metadata: ExportMetadata;
  try {
    metadata = JSON.parse(await readFile(path.join(outputDirectory, "metadata.json"), "utf8"));
  } catch {
    return { valid: false, errors: ["Expo Atlas metadata.json is missing or invalid"], details };
  }
  if (metadata.version !== 0 || metadata.bundler !== "metro" || !metadata.fileMetadata) {
    errors.push("metadata.json is not Expo Atlas-compatible Metro metadata");
  }
  for (const platform of platforms) {
    const bundle = metadata.fileMetadata?.[platform]?.bundle;
    if (typeof bundle !== "string" || bundle.length === 0) {
      errors.push(`metadata.json is missing the ${platform} bundle mapping`);
      continue;
    }
    const bundlePath = path.resolve(outputDirectory, bundle);
    if (!bundlePath.startsWith(`${path.resolve(outputDirectory)}${path.sep}`)) {
      errors.push(`${platform} bundle mapping escapes the export directory`);
      continue;
    }
    const mapPath = `${bundlePath}.map`;
    try {
      const [bundleInfo, mapInfo] = await Promise.all([lstat(bundlePath), lstat(mapPath)]);
      if (
        !bundleInfo.isFile() ||
        !mapInfo.isFile() ||
        bundleInfo.isSymbolicLink() ||
        mapInfo.isSymbolicLink() ||
        bundleInfo.size === 0 ||
        mapInfo.size === 0
      ) {
        throw new Error("empty");
      }
      details.push(
        `${platform}: bundle ${formatBytes(bundleInfo.size)}, source map ${formatBytes(mapInfo.size)}`
      );
    } catch {
      errors.push(`${platform} bundle or corresponding source map is missing/empty: ${bundle}`);
    }
  }
  return { valid: errors.length === 0, errors, details };
};
