import { readdir, stat } from "node:fs/promises";
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
  ensurePrebuild: CheckPrerequisite
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
        "all",
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

    const bundles = await findFiles(outputDirectory, (name) => name.endsWith(".js"));
    const sourceMaps = await findFiles(outputDirectory, (name) => name.endsWith(".map"));
    if (bundles.length === 0 || sourceMaps.length === 0) {
      return {
        status: "fail",
        check: "javascript.production-export",
        summary: "Production export omitted JavaScript bundles or source maps",
        details: [`Export directory: ${outputDirectory}`],
        remediation: "Re-run Expo export with --source-maps and inspect the export directory.",
      };
    }

    return {
      ...result,
      details: [`Bundles: ${bundles.length}`, `Source maps: ${sourceMaps.length}`],
    };
  },
});

export const createArtifactCheck = (
  ensureBundle: CheckPrerequisite,
  ensureExport: CheckPrerequisite
): CheckDefinition<ProcessPreflightContext> => ({
  check: "artifacts.release",
  run: async (context) => {
    const [bundleResult, exportResult] = await Promise.all([
      ensureBundle(context),
      ensureExport(context),
    ]);
    const failed = [bundleResult, exportResult].find((result) => result.status === "fail");
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

    if (!aabPath) {
      missing.push("Android release AAB");
    }
    try {
      await stat(mappingPath);
    } catch {
      missing.push(`R8 mapping: ${mappingPath}`);
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

    if (!aabPath) {
      return {
        status: "fail",
        check: "artifacts.release",
        summary: "Required Android release AAB is missing",
        remediation: "Rebuild the Android release bundle and rerun preflight.",
      };
    }

    const [aabStats, mappingStats] = await Promise.all([stat(aabPath), stat(mappingPath)]);
    const sourceMapStats = await Promise.all(sourceMaps.map((sourceMap) => stat(sourceMap)));
    const sourceMapBytes = sourceMapStats.reduce((total, file) => total + file.size, 0);

    return {
      status: "pass",
      check: "artifacts.release",
      summary: "Release artifacts and deobfuscation mappings are present",
      details: [
        `AAB: ${aabPath} (${formatBytes(aabStats.size)})`,
        `R8 mapping: ${mappingPath} (${formatBytes(mappingStats.size)})`,
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
    }).run(context);
  },
});
