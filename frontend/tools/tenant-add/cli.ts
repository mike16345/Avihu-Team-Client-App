import "dotenv/config";
import { spawn } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { box, cancel, confirm, intro, outro } from "@clack/prompts";
import type { TenantEasConfig } from "../../config/tenants/types";
import { replaceTenantEasBlock } from "./easEditor";
import { createEasProject, getAuthenticatedExpoUser, verifyLinkedEasProject } from "./eas/project";
import type { EasProjectIdentity, EasProjectRunner, TenantEasSelection } from "./eas/types";
import { collectTenantAnswers, collectTenantEasSelection } from "./prompts";
import { writeTenantRecovery } from "./recovery";
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

const runEasProcess: EasProjectRunner = ({ command, args, cwd, env }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...env, NODE_ENV: env.NODE_ENV ?? process.env.NODE_ENV ?? "development" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (value: Buffer) => {
      stdout += String(value);
    });
    child.stderr.on("data", (value: Buffer) => {
      stderr += String(value);
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });

const resolveEasSelection = async (
  selection: TenantEasSelection,
  input: { frontendRoot: string; displayName: string; slug: string; sourceIcon: string }
): Promise<EasProjectIdentity | null> => {
  if (selection.kind === "skip") return null;
  if (selection.kind === "create") {
    const approved = await confirm({
      message: `Create Expo project ${selection.owner}/${input.slug} now?`,
      initialValue: false,
    });
    if (approved !== true) return null;
    return createEasProject(runEasProcess, {
      displayName: input.displayName,
      slug: input.slug,
      owner: selection.owner,
      sourceIcon: input.sourceIcon,
    });
  }
  return verifyLinkedEasProject(runEasProcess, {
    displayName: input.displayName,
    slug: input.slug,
    projectId: selection.projectId,
    sourceIcon: input.sourceIcon,
  });
};

const publishLinkedEas = async (
  frontendRoot: string,
  modulePath: string,
  tenantId: string,
  identity: EasProjectIdentity
) => {
  const indexPath = path.join(modulePath, "index.ts");
  const original = await readFile(indexPath, "utf8");
  const eas: TenantEasConfig = {
    status: "linked",
    owner: identity.owner,
    projectId: identity.projectId,
    updateUrl: identity.updateUrl,
  };
  const updated = replaceTenantEasBlock(original, eas);
  const writeAtomic = async (source: string) => {
    const temporary = `${indexPath}.${process.pid}.tmp`;
    await writeFile(temporary, source, "utf8");
    await rename(temporary, indexPath);
  };
  await writeAtomic(updated);
  try {
    await runFastPreflight(frontendRoot, tenantId);
  } catch (error) {
    await writeAtomic(original);
    await writeTenantRecovery(path.join(frontendRoot, ".tenant-add"), {
      schemaVersion: 1,
      tenantId,
      owner: identity.owner,
      slug: identity.slug,
      projectId: identity.projectId,
      updateUrl: identity.updateUrl,
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
};

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
    const selection = await collectTenantEasSelection(
      result.tenant.kind,
      result.tenant.slug,
      undefined,
      () => getAuthenticatedExpoUser(runEasProcess, frontendRoot)
    );
    if (!selection) return 0;
    const identity = await resolveEasSelection(selection, {
      frontendRoot,
      displayName: result.tenant.displayName,
      slug: result.tenant.slug,
      sourceIcon: path.join(result.assetDirectory, "source/app-icon.png"),
    });
    if (identity) {
      await publishLinkedEas(frontendRoot, result.modulePath, result.tenant.id, identity);
    }
    box(
      [
        `Mode: ${result.tenant.kind}`,
        `Config: ${result.modulePath}`,
        `Assets: ${result.assetDirectory}`,
        `Logo: ${result.logoSource}`,
        `EAS setup: ${identity ? `linked (${identity.owner}/${identity.projectId})` : "pending"}`,
        ...(!identity && result.tenant.kind === "repository"
          ? [`npm run tenant:eas -- --tenant ${result.tenant.id}`]
          : []),
        "Schema, Expo config, assets, and fast preflight: passed",
        "",
        result.launchCommand,
        ...(result.tenant.kind === "repository"
          ? ["Review and commit the generated tenant folder, registry entry, and assets."]
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
if (isMain)
  void runTenantAddCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
