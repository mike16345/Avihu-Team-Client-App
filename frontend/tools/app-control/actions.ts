import { getTenant } from "../../config/tenants/registry";
import type { AppSelection, CommandSpec } from "./types";

export const EAS_CLI_ARGS = ["--yes", "eas-cli@16.27.0"] as const;

const createCommandSpec = (
  selection: AppSelection,
  command: string,
  args: string[],
  label: string
): CommandSpec => ({
  command,
  args,
  env: {
    APP_TENANT: selection.tenantId,
    APP_ENV: selection.environment,
  },
  label,
});

export const resolveAction = (selection: AppSelection): CommandSpec => {
  const tenant = getTenant(selection.tenantId);
  const labelPrefix = `${tenant.displayName} (${selection.environment})`;

  switch (selection.action) {
    case "start":
      return createCommandSpec(selection, "npx", ["expo", "start", "-c"], `Start ${labelPrefix}`);
    case "run":
      return createCommandSpec(
        selection,
        "npx",
        ["expo", `run:${selection.platform}`],
        `Run ${labelPrefix} on ${selection.platform}`
      );
    case "preflight":
      return createCommandSpec(
        selection,
        "npm",
        ["run", selection.mode === "release" ? "preflight:release" : "preflight"],
        `${selection.mode === "release" ? "Release" : "Fast"} preflight for ${labelPrefix}`
      );
    case "assets":
      return createCommandSpec(
        selection,
        "npm",
        ["run", `assets:${selection.operation}`],
        `${selection.operation === "generate" ? "Generate" : "Audit"} assets for ${labelPrefix}`
      );
    case "build":
      return createCommandSpec(
        selection,
        "npx",
        [
          ...EAS_CLI_ARGS,
          "build",
          "--platform",
          selection.platform,
          "--profile",
          selection.profile,
          "--non-interactive",
        ],
        `Build ${labelPrefix} for ${selection.platform}`
      );
    case "update":
      return createCommandSpec(
        selection,
        "npx",
        [
          ...EAS_CLI_ARGS,
          "update",
          "--branch",
          selection.environment,
          "--environment",
          selection.environment,
          "--auto",
          "--non-interactive",
        ],
        `Publish update for ${labelPrefix}`
      );
  }
};
