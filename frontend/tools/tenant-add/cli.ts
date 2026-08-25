import "dotenv/config";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { box, cancel, intro, outro } from "@clack/prompts";
import { collectTenantAnswers } from "./prompts";
import { scaffoldTenant } from "./scaffold";

const runFastPreflight = (frontendRoot: string, tenantId: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(
      "npm",
      ["run", "preflight", "--", "--tenant", tenantId, "--environment", "development"],
      { cwd: frontendRoot, env: process.env, stdio: "inherit" }
    );
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Fast preflight failed${signal ? ` (${signal})` : ` (exit ${code})`}`));
    });
  });

export const runTenantAddCli = async (
  frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
) => {
  intro("Add a white-label tenant");
  const answers = await collectTenantAnswers();
  if (!answers) return 0;

  try {
    const result = await scaffoldTenant(answers, frontendRoot, (tenantId) =>
      runFastPreflight(frontendRoot, tenantId)
    );
    box(
      [
        `Mode: ${result.tenant.kind}`,
        `Config: ${result.modulePath}`,
        `Assets: ${result.assetDirectory}`,
        `Logo: ${result.logoSource}`,
        "Schema, Expo config, assets, and fast preflight: passed",
        "",
        result.launchCommand,
        ...(result.tenant.kind === "repository"
          ? ["Review and commit the generated tenant module, registry entry, and assets."]
          : ["Local files are Git-ignored and cannot be released."]),
      ].join("\n"),
      "Tenant ready"
    );
    outro("Tenant onboarding complete.");
    return 0;
  } catch (error) {
    cancel(error instanceof Error ? error.message : String(error));
    return 1;
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) void runTenantAddCli().then((exitCode) => (process.exitCode = exitCode));
