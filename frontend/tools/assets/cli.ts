import { generateTenantAssets } from "./generate";
import { getTenantAssetPaths } from "./paths";
import { validateTenantAssets } from "./validate";

type AssetCommand = "generate" | "check";

const parseArguments = (args: string[]): { command: AssetCommand; tenantId: string } => {
  const command = args[0];
  if (command !== "generate" && command !== "check") {
    throw new Error("Usage: tsx tools/assets/cli.ts <generate|check> --tenant <tenant-id>");
  }

  const tenantFlagIndex = args.indexOf("--tenant");
  const inlineTenant = args.find((argument) => argument.startsWith("--tenant="))?.slice(9);
  const tenantId = tenantFlagIndex >= 0 ? args[tenantFlagIndex + 1] : inlineTenant;
  if (!tenantId) {
    throw new Error("--tenant <tenant-id> is required");
  }

  return { command, tenantId };
};

const run = async () => {
  const { command, tenantId } = parseArguments(process.argv.slice(2));

  if (command === "generate") {
    const manifest = await generateTenantAssets(tenantId);
    console.log(
      `Generated ${Object.keys(manifest.outputs).length} tenant assets: ${
        getTenantAssetPaths(tenantId).manifest
      }`
    );
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
