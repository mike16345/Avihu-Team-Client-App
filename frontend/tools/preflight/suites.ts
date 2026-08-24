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
import { nativeDriftCheck } from "./checks/nativeDrift";
import { createPlatformPolicyChecks, createProjectHealthChecks } from "./checks/projectHealth";
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
): CheckDefinition<PreflightSuiteContext> => {
  const ensure = memoize(definition);
  return { check: definition.check, run: ensure };
};

export const createFastSuite = (context: PreflightSuiteContext): PreflightSuite => [
  tenantConfigCheck,
  environmentCheck,
  ...createProjectHealthChecks(),
  createAssetsCheck(context.tenant),
  expoConfigCheck,
  nativeDriftCheck,
  ...createPlatformPolicyChecks(),
];

export const createReleaseSuite = (context: PreflightSuiteContext): PreflightSuite => {
  const fastSuite = createFastSuite(context).map(normalize).map(memoizeDefinition);
  const basePrebuild = createCleanPrebuildCheck();
  const prebuild: CheckDefinition<PreflightSuiteContext> = {
    check: basePrebuild.check,
    run: async (runContext) => {
      const fastResults = await Promise.all(
        fastSuite.map((definition) => definition.run(runContext))
      );
      const failed = fastResults.find((result) => result.status === "fail");
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
  const ensurePrebuild = memoize(prebuild);
  const android = createAndroidReleaseChecks(ensurePrebuild);
  const javascriptExport = createJavaScriptExportCheck(ensurePrebuild);
  const ensureExport = memoize(javascriptExport);
  const ios = createIosReleaseCheck(ensurePrebuild);
  const artifacts = createArtifactCheck(android.ensureBundle, ensureExport);
  const ensureArtifacts = memoize(artifacts);
  const smoke = createSmokeInfrastructureCheck(ensureArtifacts);

  return [
    ...fastSuite,
    prebuild,
    android.lint,
    android.bundle,
    android.aabValidation,
    javascriptExport,
    ios,
    artifacts,
    smoke,
  ];
};

export const createEasSuite = (context: PreflightSuiteContext): PreflightSuite =>
  createFastSuite(context);
