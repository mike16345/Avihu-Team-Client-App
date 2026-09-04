import { resolveAction } from "./actions";
import { renderError } from "../cli-ui/render";
import { parseAppArguments } from "./arguments";
import { formatDryRun } from "./dryRun";
import { runCommand } from "./processRunner";
import { confirmSelection, printSelectionSummary, promptForSelection } from "./prompts";
import type { AppSelection, ParsedAppArguments } from "./types";

const selectionFromConfirmedArguments = (arguments_: ParsedAppArguments): AppSelection => {
  if (!arguments_.action || !arguments_.tenantId || !arguments_.environment) {
    throw new Error("Confirmed arguments must include an action, tenant, and environment");
  }

  switch (arguments_.action) {
    case "start":
      return {
        action: "start",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
      };
    case "run":
      if (!arguments_.platform) {
        throw new Error("platform is required for run actions");
      }
      return {
        action: "run",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
        platform: arguments_.platform,
        device: arguments_.device,
      };
    case "install":
      if (!arguments_.platform || !arguments_.binaryPath) {
        throw new Error("platform and --binary are required for install actions");
      }
      return {
        action: "install",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
        platform: arguments_.platform,
        binaryPath: arguments_.binaryPath,
        device: arguments_.device,
      };
    case "preflight":
      return {
        action: "preflight",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
        mode: arguments_.preflightMode ?? "fast",
      };
    case "assets":
      if (!arguments_.assetOperation) {
        throw new Error("asset operation is required for asset actions");
      }
      return {
        action: "assets",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
        operation: arguments_.assetOperation,
      };
    case "build":
      if (!arguments_.platform || !arguments_.profile) {
        throw new Error("platform and profile are required for build actions");
      }
      return {
        action: "build",
        tenantId: arguments_.tenantId,
        environment: arguments_.profile,
        profile: arguments_.profile,
        platform: arguments_.platform,
      };
    case "update":
      if (arguments_.environment === "development") {
        throw new Error("Updates require the preview or production environment");
      }
      return {
        action: "update",
        tenantId: arguments_.tenantId,
        environment: arguments_.environment,
      };
  }
};

const main = async (): Promise<number> => {
  try {
    const parsed = parseAppArguments(process.argv.slice(2));
    const selection = parsed.confirmed
      ? selectionFromConfirmedArguments(parsed)
      : await promptForSelection(parsed);

    if (!selection) {
      return 0;
    }

    if (parsed.confirmed) {
      printSelectionSummary(selection);
    } else if (!(await confirmSelection(selection))) {
      return 0;
    }

    const spec = resolveAction(selection);
    if (parsed.dryRun) {
      console.log(formatDryRun(spec));
      return 0;
    }

    return runCommand(spec);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run app control";
    console.error(renderError(message, "Run npm run app with --tenant <tenant-id> and --yes."));
    return 1;
  }
};

void main().then((exitCode) => {
  process.exitCode = exitCode;
});
