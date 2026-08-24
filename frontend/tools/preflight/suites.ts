import {
  createArtifactCheck,
  createJavaScriptExportCheck,
  createSmokeInfrastructureCheck,
} from "./checks/artifacts";
import {
  createAndroidReleaseChecks,
  createCleanPrebuildCheck,
  type CheckPrerequisite,
} from "./checks/androidRelease";
import { createAssetsCheck } from "./checks/assets";
import { environmentCheck } from "./checks/environment";
import { expoConfigCheck } from "./checks/expoConfig";
import { createIosReleaseCheck } from "./checks/iosRelease";
import { androidNativeDriftCheck, nativeDriftCheck } from "./checks/nativeDrift";
import { createPlatformPolicyChecks, createProjectHealthChecks } from "./checks/projectHealth";
import { applyPolicy } from "./policy";
import { tenantConfigCheck } from "./checks/tenantConfig";
import type { ProcessPreflightContext } from "./processCheck";
import type { CheckDefinition, CheckInput, CheckResult } from "./types";

export type PreflightSuiteContext = ProcessPreflightContext;
export type PreflightSuite = CheckInput<PreflightSuiteContext>[];

const memoize = (definition: CheckDefinition<PreflightSuiteContext>): CheckPrerequisite => {
  let pending: Promise<CheckResult> | undefined;
  return (context) => {
    pending ??= Promise.resolve(definition.run(context));
    return pending;
  };
};

const normalize = (
  input: CheckInput<PreflightSuiteContext>,
  index: number
): CheckDefinition<PreflightSuiteContext> => {
  if (typeof input !== "function") {
    return input;
  }

  return {
    check: input.check ?? input.id ?? input.name ?? `check-${index + 1}`,
    run: input,
  };
};

const memoizeDefinition = (
  definition: CheckDefinition<PreflightSuiteContext>
): {
  definition: CheckDefinition<PreflightSuiteContext>;
  run: CheckPrerequisite;
} => {
  const ensure = memoize(definition);
  return { definition: { check: definition.check, run: ensure }, run: ensure };
};

export const createFastSuite = (context: PreflightSuiteContext): PreflightSuite => [
  tenantConfigCheck,
  environmentCheck,
  ...createProjectHealthChecks(),
  createAssetsCheck(context.tenant),
  expoConfigCheck,
  nativeDriftCheck,
  ...createPlatformPolicyChecks(context.tenantConfig.platforms ?? ["ios", "android"]),
];

export const createReleaseSuite = (context: PreflightSuiteContext): PreflightSuite => {
  const fastSuite = createFastSuite(context)
    .map(normalize)
    .map(memoizeDefinition)
    .map((node) => node.definition);
  const platforms = context.tenantConfig.platforms ?? ["ios", "android"];
  const basePrebuild = createCleanPrebuildCheck();
  const prebuild: CheckDefinition<PreflightSuiteContext> = {
    check: basePrebuild.check,
    run: async (runContext) => {
      const fastResults = await Promise.all(
        fastSuite.map((definition) => definition.run(runContext))
      );
      const failed = fastResults
        .map((result) => applyPolicy(result, { mode: "release" }))
        .find((result) => result.status === "fail");
      if (failed) {
        return {
          status: "fail",
          check: "native.prebuild",
          summary: `Clean prebuild was skipped because ${failed.check} failed`,
          details: [failed.summary],
          remediation:
            failed.remediation ?? "Resolve the fast preflight failure and rerun release preflight.",
        };
      }

      return basePrebuild.run(runContext);
    },
  };
  const prebuildNode = memoizeDefinition(prebuild);
  const androidDrift = memoizeDefinition({
    check: androidNativeDriftCheck.check,
    run: async (runContext) => {
      const prerequisite = await prebuildNode.run(runContext);
      return prerequisite.status === "fail"
        ? {
            status: "fail",
            check: androidNativeDriftCheck.check,
            summary: `Skipped because ${prerequisite.check} failed`,
            remediation: prerequisite.remediation,
          }
        : androidNativeDriftCheck.run(runContext);
    },
  });
  const android = platforms.includes("android")
    ? createAndroidReleaseChecks(androidDrift.run)
    : undefined;
  const javascriptExport = memoizeDefinition(
    createJavaScriptExportCheck(prebuildNode.run, platforms)
  );
  const ios = platforms.includes("ios")
    ? memoizeDefinition(createIosReleaseCheck(prebuildNode.run))
    : undefined;
  const artifacts = memoizeDefinition(
    createArtifactCheck(android?.ensureBundle, javascriptExport.run, platforms)
  );
  const smoke = memoizeDefinition(createSmokeInfrastructureCheck(artifacts.run));

  const releaseSuite: CheckDefinition<PreflightSuiteContext>[] = [
    ...fastSuite,
    prebuildNode.definition,
    ...(android
      ? [androidDrift.definition, android.lint, android.bundle, android.aabValidation]
      : []),
    javascriptExport.definition,
    ...(ios ? [ios.definition] : []),
    artifacts.definition,
    smoke.definition,
  ];
  return releaseSuite;
};

export const createEasSuite = (context: PreflightSuiteContext): PreflightSuite =>
  createFastSuite(context);
