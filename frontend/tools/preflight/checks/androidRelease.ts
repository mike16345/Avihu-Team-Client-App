import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createProcessCheck, type ProcessPreflightContext } from "../processCheck";
import type { CheckDefinition, CheckResult } from "../types";

export type CheckPrerequisite = (
  context: Readonly<ProcessPreflightContext>
) => Promise<CheckResult>;

const failForPrerequisite = (check: string, prerequisite: CheckResult): CheckResult => ({
  status: "fail",
  check,
  summary: `Skipped because ${prerequisite.check} failed`,
  details: [prerequisite.summary],
  remediation: prerequisite.remediation ?? "Resolve the prerequisite failure and rerun preflight.",
});

const runAfter = async (
  check: string,
  context: Readonly<ProcessPreflightContext>,
  prerequisite: CheckPrerequisite,
  run: () => Promise<CheckResult>
) => {
  const result = await prerequisite(context);
  return result.status === "fail" ? failForPrerequisite(check, result) : run();
};

const findFiles = async (root: string, extension: string): Promise<string[]> => {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const target = path.join(root, entry.name);
        if (entry.isDirectory()) {
          return findFiles(target, extension);
        }
        return (entry.isFile() || entry.isSymbolicLink()) && entry.name.endsWith(extension)
          ? [target]
          : [];
      })
    );
    return nested.flat().sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const APPLICATION_SOURCE_EXTENSIONS = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

const findRegularFiles = async (root: string): Promise<string[]> => {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const target = path.join(root, entry.name);
        if (entry.isDirectory()) {
          return findRegularFiles(target);
        }
        return entry.isFile() ? [target] : [];
      })
    );
    return nested.flat().sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const readOptionalFile = async (target: string) => {
  try {
    return await readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const getProperty = (contents: string, name: string) => {
  const properties = new Map<string, string>();
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator >= 0) {
      properties.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
  }
  return properties.get(name);
};

const toProjectPath = (projectRoot: string, target: string) =>
  path.relative(projectRoot, target).split(path.sep).join("/");

export interface AndroidEdgeToEdgeAudit {
  drift: string[];
  evidence: string[];
}

export const auditAndroidEdgeToEdge = async (
  projectRoot: string,
  generatedAndroidExists: boolean
): Promise<AndroidEdgeToEdgeAudit> => {
  const drift: string[] = [];
  const evidence: string[] = [];

  if (generatedAndroidExists) {
    const properties = await readOptionalFile(
      path.join(projectRoot, "android", "gradle.properties")
    );
    const edgeToEdgeProperty = properties
      ? getProperty(properties, "expo.edgeToEdgeEnabled")
      : undefined;
    if (edgeToEdgeProperty !== "true") {
      drift.push(
        `Generated Android property: expected expo.edgeToEdgeEnabled=true, generated ${edgeToEdgeProperty ?? "missing"}`
      );
    }

    const resourceFiles = (
      await findRegularFiles(path.join(projectRoot, "android", "app", "src", "main", "res"))
    ).filter((target) => {
      const relative = path.relative(
        path.join(projectRoot, "android", "app", "src", "main", "res"),
        target
      );
      const [resourceDirectory] = relative.split(path.sep);
      return resourceDirectory.startsWith("values") && path.extname(target) === ".xml";
    });
    const resourceContents = await Promise.all(
      resourceFiles.map(async (target) => ({ target, contents: await readFile(target, "utf8") }))
    );
    if (
      resourceContents.some(({ contents }) =>
        contents.includes("windowOptOutEdgeToEdgeEnforcement")
      )
    ) {
      drift.push("Generated Android styles must not declare windowOptOutEdgeToEdgeEnforcement");
    }
    const fixedStatusBarColor = resourceContents.some(({ contents }) => {
      const declarations = [
        ...contents.matchAll(
          /<item\b[^>]*\bname=["']android:statusBarColor["'][^>]*>\s*([^<]+?)\s*<\/item>/gu
        ),
      ];
      const hasStatusBarColor = /\b(?:android:)?statusBarColor\b/u.test(contents);
      return (
        hasStatusBarColor &&
        (declarations.length === 0 ||
          declarations.some((match) => {
            const value = match[1].trim().toLowerCase();
            return value !== "#00000000" && value !== "@android:color/transparent";
          }))
      );
    });
    if (fixedStatusBarColor) {
      drift.push("Generated Android styles must not declare a fixed statusBarColor");
    }

    evidence.push(
      `Android edge-to-edge native property: ${edgeToEdgeProperty ?? "missing"}; resource files audited: ${resourceFiles.length}`
    );
  }

  const sourceFiles = (await findRegularFiles(path.join(projectRoot, "src"))).filter((target) =>
    APPLICATION_SOURCE_EXTENSIONS.has(path.extname(target))
  );
  for (const sourceFile of sourceFiles) {
    const contents = await readFile(sourceFile, "utf8");
    if (/\bStatusBar\s*\.\s*currentHeight\b/u.test(contents)) {
      drift.push(
        `Application source must not use StatusBar.currentHeight: ${toProjectPath(projectRoot, sourceFile)}`
      );
    }
  }
  evidence.push(
    `Application source files audited for manual status-bar height: ${sourceFiles.length}`
  );

  return { drift, evidence };
};

export const findReleaseAab = async (projectRoot: string) => {
  const candidates = await findFiles(
    path.join(projectRoot, "android", "app", "build", "outputs", "bundle"),
    ".aab"
  );
  return (
    candidates.find((candidate) => candidate.includes(`${path.sep}release${path.sep}`)) ?? null
  );
};

const getReleaseMappingPath = (projectRoot: string) =>
  path.join(projectRoot, "android", "app", "build", "outputs", "mapping", "release", "mapping.txt");

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
};

export const createCleanPrebuildCheck = (
  platforms: readonly ("ios" | "android")[] = ["ios", "android"]
): CheckDefinition<ProcessPreflightContext> => {
  const includesIos = platforms.includes("ios");
  const includesAndroid = platforms.includes("android");
  const selectedPlatform = includesIos && includesAndroid ? "all" : includesIos ? "ios" : "android";

  return createProcessCheck({
    check: "native.prebuild",
    command: "npx",
    args: ["expo", "prebuild", "--clean", "--no-install", "--platform", selectedPlatform],
    env: { CI: "1" },
    successSummary: "Clean native projects were generated",
    failureSummary: "Clean Expo prebuild failed",
    remediation: "Run npx expo prebuild --clean --no-install and resolve the generation error.",
  });
};

export interface AndroidReleaseChecks {
  lint: CheckDefinition<ProcessPreflightContext>;
  bundle: CheckDefinition<ProcessPreflightContext>;
  aabValidation: CheckDefinition<ProcessPreflightContext>;
  ensureAabValidation: CheckPrerequisite;
}

const memoize = (definition: CheckDefinition<ProcessPreflightContext>): CheckPrerequisite => {
  let pending: Promise<CheckResult> | undefined;
  return (context) => {
    pending ??= Promise.resolve(definition.run(context));
    return pending;
  };
};

const memoizedDefinition = (definition: CheckDefinition<ProcessPreflightContext>) => {
  const run = memoize(definition);
  return { definition: { check: definition.check, run }, run };
};

export const createAndroidReleaseChecks = (
  ensurePrebuild: CheckPrerequisite
): AndroidReleaseChecks => {
  const gradleCommand = (context: Readonly<ProcessPreflightContext>) =>
    path.join(
      context.projectRoot,
      "android",
      context.platform === "win32" ? "gradlew.bat" : "gradlew"
    );

  const lint: CheckDefinition<ProcessPreflightContext> = {
    check: "android.lint-release",
    run: (context) =>
      runAfter("android.lint-release", context, ensurePrebuild, async () => {
        const command = gradleCommand(context);
        try {
          await access(command);
        } catch {
          return {
            status: "fail",
            check: "android.lint-release",
            summary: "Generated Android Gradle wrapper is missing",
            remediation: "Resolve the clean prebuild output, then rerun release preflight.",
          };
        }

        return createProcessCheck({
          check: "android.lint-release",
          command,
          args: ["lintRelease", "--no-daemon"],
          cwd: (runContext) => path.join(runContext.projectRoot, "android"),
          successSummary: "Android release lint passed",
          failureSummary: "Android release lint failed",
          remediation: "Open the Android lint report, fix blocking findings, and rerun preflight.",
        }).run(context);
      }),
  };
  const lintNode = memoizedDefinition(lint);

  const bundle: CheckDefinition<ProcessPreflightContext> = {
    check: "android.bundle-release",
    run: (context) =>
      runAfter("android.bundle-release", context, lintNode.run, async () => {
        const result = await createProcessCheck({
          check: "android.bundle-release",
          command: gradleCommand(context),
          args: ["bundleRelease", "--no-daemon"],
          cwd: (runContext) => path.join(runContext.projectRoot, "android"),
          successSummary: "Android release bundle compiled",
          failureSummary: "Android release bundle compilation failed",
          remediation: "Fix the Gradle release build, then rerun release preflight.",
        }).run(context);

        if (result.status === "fail") {
          return result;
        }

        const aabPath = await findReleaseAab(context.projectRoot);
        const aabStats = aabPath ? await lstat(aabPath) : undefined;
        if (!aabPath || !aabStats) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "Gradle completed without a release AAB",
            remediation:
              "Inspect android/app/build/outputs/bundle, then rerun the release bundle task.",
          };
        }
        if (!aabStats.isFile() || aabStats.isSymbolicLink()) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "Release AAB must be a regular file",
            details: [`Invalid: ${aabPath}`],
            remediation: "Remove the symlink or non-file output, then rerun bundleRelease.",
          };
        }
        if (aabStats.size === 0) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "Release AAB is empty",
            details: [`Empty: ${aabPath}`],
            remediation:
              "Remove the empty AAB, then rerun bundleRelease and inspect Gradle output.",
          };
        }

        const mappingPath = getReleaseMappingPath(context.projectRoot);
        let mappingStats: Awaited<ReturnType<typeof lstat>> | undefined;
        try {
          mappingStats = await lstat(mappingPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
          }
          mappingStats = undefined;
        }
        if (!mappingStats) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "Gradle completed without a nonempty R8 mapping file",
            details: [`Expected: ${mappingPath}`],
            remediation:
              "Confirm release minification is enabled, then rerun the release bundle task.",
          };
        }
        if (!mappingStats.isFile() || mappingStats.isSymbolicLink()) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "R8 mapping file must be a regular file",
            details: [`Invalid: ${mappingPath}`],
            remediation:
              "Remove the symlink or non-file mapping, then rerun bundleRelease and retain the generated mapping.",
          };
        }
        if (mappingStats.size === 0) {
          return {
            status: "fail",
            check: "android.bundle-release",
            summary: "R8 mapping file is empty",
            details: [`Empty: ${mappingPath}`],
            remediation:
              "Confirm release minification is enabled, remove the empty mapping, and rerun bundleRelease.",
          };
        }

        return {
          ...result,
          details: [
            `AAB: ${aabPath} (${formatBytes(aabStats.size)})`,
            `R8 mapping: ${mappingPath} (${formatBytes(mappingStats.size)})`,
          ],
        };
      }),
  };
  const bundleNode = memoizedDefinition(bundle);

  const aabValidation: CheckDefinition<ProcessPreflightContext> = {
    check: "android.aab-validation",
    run: (context) =>
      runAfter("android.aab-validation", context, bundleNode.run, async () => {
        const aabPath = await findReleaseAab(context.projectRoot);
        if (!aabPath) {
          return {
            status: "fail",
            check: "android.aab-validation",
            summary: "Release AAB is missing",
            remediation: "Run the Android release bundle task and inspect its full preflight log.",
          };
        }

        const locator = createProcessCheck({
          check: "android.aab-tool",
          command: context.platform === "win32" ? "where.exe" : "which",
          args: ["bundletool"],
          successSummary: "Android bundletool is installed",
          failureSummary: "Android bundletool is unavailable",
          remediation:
            context.platform === "darwin"
              ? "Run brew install bundletool."
              : "Download bundletool from https://github.com/google/bundletool/releases and add a bundletool launcher to PATH.",
        });
        const tool = await locator.run(context);
        if (tool.status === "fail") {
          return {
            status: "warn",
            check: "android.aab-validation",
            summary: "AAB exists but optional SDK validation was skipped",
            details: tool.details,
            remediation:
              context.platform === "darwin"
                ? "Run brew install bundletool, then rerun release preflight."
                : "Download bundletool from https://github.com/google/bundletool/releases, add a bundletool launcher to PATH, then rerun release preflight.",
          };
        }

        return createProcessCheck({
          check: "android.aab-validation",
          command: "bundletool",
          args: ["validate", `--bundle=${aabPath}`],
          successSummary: "Android App Bundle passed bundletool validation",
          failureSummary: "Android App Bundle validation failed",
          remediation: "Rebuild the release AAB and inspect the analyzer diagnostics.",
        }).run(context);
      }),
  };

  const aabNode = memoizedDefinition(aabValidation);
  return {
    lint: lintNode.definition,
    bundle: bundleNode.definition,
    aabValidation: aabNode.definition,
    ensureAabValidation: aabNode.run,
  };
};
