import { generateTenantAssets } from "./generate";
import { getTenantAssetPaths } from "./paths";
import { validateTenantAssets } from "./validate";
import { auditAssets } from "./audit";
import { confirm } from "@clack/prompts";
import { renderDetailLines, renderError, renderHeader } from "../cli-ui/render";
import { renderAssetAudit, renderAssetChecks, renderAssetGenerated } from "./presentation";

type AssetCommand = "generate" | "check" | "audit";

const parseArguments = (
  args: string[]
): { command: AssetCommand; tenantId: string; clean: boolean; yes: boolean } => {
  const command = args[0];
  if (command !== "generate" && command !== "check" && command !== "audit") {
    throw new Error("Usage: tsx tools/assets/cli.ts <generate|check|audit> --tenant <tenant-id>");
  }

  const tenantFlagIndex = args.indexOf("--tenant");
  const inlineTenant = args.find((argument) => argument.startsWith("--tenant="))?.slice(9);
  const tenantId = tenantFlagIndex >= 0 ? args[tenantFlagIndex + 1] : inlineTenant;
  if (!tenantId) {
    throw new Error("--tenant <tenant-id> is required");
  }

  return { command, tenantId, clean: args.includes("--clean"), yes: args.includes("--yes") };
};

const run = async () => {
  const { command, tenantId, clean, yes } = parseArguments(process.argv.slice(2));

  if (command === "generate") {
    const manifest = await generateTenantAssets(tenantId);
    console.log(
      renderAssetGenerated(
        tenantId,
        Object.keys(manifest.outputs).length,
        getTenantAssetPaths(tenantId).manifest
      )
    );
    return;
  }

  if (command === "audit") {
    if (clean && !yes && !process.stdin.isTTY) {
      throw new Error("Non-interactive cleanup requires --yes");
    }

    const report = await auditAssets({
      tenantId,
      clean,
      yes,
      confirmCleanup: async (entries) => {
        console.log(
          [
            renderHeader("Cleanup candidates", tenantId),
            renderDetailLines(entries.map((entry) => entry.relativePath)),
          ].join("\n")
        );
        return (
          (await confirm({
            message: `Remove ${entries.length} proven-unused or stale-generated asset(s)?`,
            initialValue: false,
          })) === true
        );
      },
    });

    console.log(renderAssetAudit(report));
    return;
  }

  const results = await validateTenantAssets(tenantId);
  console.log(renderAssetChecks(tenantId, results));

  const failures = results.filter(({ ok }) => !ok);
  if (failures.length > 0) {
    throw new Error(`${failures.length} tenant asset check(s) failed`);
  }
};

run().catch((error: unknown) => {
  console.error(renderError(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
