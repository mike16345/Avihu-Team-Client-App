import { readdir } from "node:fs/promises";
import path from "node:path";

import { nativeDriftCheck } from "./nativeDrift";
import { createProcessCheck, type ProcessPreflightContext } from "../processCheck";
import type { CheckDefinition, CheckResult } from "../types";
import type { CheckPrerequisite } from "./androidRelease";

const findXcodeProject = async (projectRoot: string) => {
  try {
    const entries = await readdir(path.join(projectRoot, "ios"), { withFileTypes: true });
    const project = entries.find(
      (entry) => entry.isDirectory() && entry.name.endsWith(".xcodeproj")
    );
    return project ? path.join(projectRoot, "ios", project.name) : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

export const createIosReleaseCheck = (
  ensurePrebuild: CheckPrerequisite
): CheckDefinition<ProcessPreflightContext> => ({
  check: "ios.release-validation",
  run: async (context): Promise<CheckResult> => {
    if (context.platform !== "darwin") {
      return {
        status: "warn",
        check: "ios.release-validation",
        summary: "iOS release validation requires macOS",
        remediation:
          "Run npm run preflight:release on macOS to validate the generated iOS project.",
      };
    }

    const prebuild = await ensurePrebuild(context);
    if (prebuild.status === "fail") {
      return {
        status: "fail",
        check: "ios.release-validation",
        summary: "iOS validation was skipped because clean prebuild failed",
        details: [prebuild.summary],
        remediation: prebuild.remediation,
      };
    }

    const drift = await nativeDriftCheck.run(context);
    if (drift.status === "fail") {
      return {
        ...drift,
        check: "ios.release-validation",
        summary: "Generated iOS configuration differs from resolved Expo configuration",
      };
    }

    const project = await findXcodeProject(context.projectRoot);
    if (!project) {
      return {
        status: "fail",
        check: "ios.release-validation",
        summary: "Generated Xcode project is missing",
        remediation: "Run a clean Expo prebuild on macOS and inspect the generated ios directory.",
      };
    }

    return createProcessCheck({
      check: "ios.release-validation",
      command: "xcodebuild",
      args: ["-list", "-json", "-project", project],
      successSummary: "Generated iOS project and build configuration are valid",
      failureSummary: "Xcode could not load the generated iOS project",
      remediation:
        "Open the generated Xcode project, resolve configuration errors, and rerun preflight.",
    }).run(context);
  },
});
