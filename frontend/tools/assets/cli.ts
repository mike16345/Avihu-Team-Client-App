import { generateTenantAssets } from "./generate";
import { getTenantAssetPaths } from "./paths";
import { validateTenantAssets } from "./validate";
import { auditAssets } from "./audit";
import { confirm } from "@clack/prompts";

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
      `Generated ${Object.keys(manifest.outputs).length} tenant assets: ${
        getTenantAssetPaths(tenantId).manifest
      }`
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
        console.log("Cleanup candidates:");
        for (const entry of entries) console.log(`- ${entry.relativePath}`);
        return (
          (await confirm({
            message: `Remove ${entries.length} proven-unused or stale-generated asset(s)?`,
            initialValue: false,
          })) === true
        );
      },
    });

    for (const entry of report.entries) {
      console.log(`${entry.classification.toUpperCase()} ${entry.relativePath}: ${entry.reason}`);
    }
    console.log(
      `Summary: ${Object.entries(report.summary)
        .map(([kind, count]) => `${kind}=${count}`)
        .join(", ")}`
    );
    if (report.deleted.length > 0) console.log(`Deleted: ${report.deleted.join(", ")}`);
    return;
  }

  const results = await validateTenantAssets(tenantId);
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}: ${result.message}`);
  }

  const failures = results.filter(({ ok }) => !ok);
  if (failures.length > 0) {
    throw new Error(`${failures.length} tenant asset check(s) failed`);
  }
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
