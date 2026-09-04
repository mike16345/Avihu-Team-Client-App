import "dotenv/config";
import { spawn } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { box, cancel, intro, outro, spinner } from "@clack/prompts";
import type { TenantEasConfig } from "../../config/tenants/types";
import { replaceTenantEasBlock } from "./easEditor";
import {
  createEasProject,
  getAuthenticatedExpoAccounts,
  getAuthenticatedExpoUser,
  verifyLinkedEasProject,
} from "./eas/project";
import type { EasProjectIdentity, EasProjectRunner, TenantEasSelection } from "./eas/types";
import { listTenantDrafts, removeTenantDraft, writeTenantDraft } from "./draft";
import {
  collectTenantAnswers,
  collectTenantDraftSelection,
  collectTenantEasSelection,
} from "./prompts";
import {
  createRecoveredEasSelection,
  readTenantRecovery,
  removeTenantRecovery,
  writeTenantRecovery,
} from "./recovery";
import { discardStagedTenant, publishStagedTenant, scaffoldTenant } from "./scaffold";
import { verifyNewTenant, type TenantVerificationRunner } from "./verification";

const runTenantVerificationProcess: TenantVerificationRunner = ({ command, args, cwd, env }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (value: Buffer) => {
      output += String(value);
    });
    child.stderr.on("data", (value: Buffer) => {
      output += String(value);
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve({ exitCode: code ?? 1, output }));
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
    ...(selection.owner ? { owner: selection.owner } : {}),
    projectId: selection.projectId,
    sourceIcon: input.sourceIcon,
  });
};

const publishLinkedEas = async (modulePath: string, identity: EasProjectIdentity) => {
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
};

export const runTenantAddCli = async (
  frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
) => {
  intro("Add a white-label tenant");
  const tenantAddRoot = path.join(frontendRoot, ".tenant-add");
  const draftSelection = await collectTenantDraftSelection(await listTenantDrafts(tenantAddRoot));
  if (!draftSelection) return 0;
  if (draftSelection.kind === "delete") {
    await removeTenantDraft(tenantAddRoot, draftSelection.tenantId);
    outro(`Deleted saved tenant draft ${draftSelection.tenantId}.`);
    return 0;
  }
  if (draftSelection.kind === "start-over") {
    await removeTenantDraft(tenantAddRoot, draftSelection.tenantId);
  }
  const initialAnswers =
    draftSelection.kind === "resume" ? draftSelection.draft.answers : undefined;
  let activeDraftId = draftSelection.kind === "resume" ? draftSelection.draft.tenantId : undefined;
  const answers = await collectTenantAnswers(undefined, {
    initialAnswers,
    getExpoAccounts: () => getAuthenticatedExpoAccounts(runEasProcess, frontendRoot),
    onProgress: async (partialAnswers) => {
      if (!partialAnswers.id) return;
      activeDraftId = partialAnswers.id;
      await writeTenantDraft(tenantAddRoot, {
        schemaVersion: 1,
        tenantId: partialAnswers.id,
        updatedAt: new Date().toISOString(),
        answers: partialAnswers,
      });
    },
  });
  if (!answers) return 0;

  try {
    const result = await scaffoldTenant(answers, frontendRoot);
    const recovery = await readTenantRecovery(tenantAddRoot, result.tenant.id);
    const selection = recovery
      ? createRecoveredEasSelection(recovery, result.tenant.id, result.tenant.slug)
      : await collectTenantEasSelection(
          result.tenant.kind,
          result.tenant.slug,
          undefined,
          () => getAuthenticatedExpoUser(runEasProcess, frontendRoot),
          answers.expoOwner
        );
    if (recovery) {
      box(
        `Reusing recovered EAS project ${recovery.owner}/${recovery.slug} (${recovery.projectId})`,
        "EAS recovery"
      );
    }
    if (!selection) {
      await discardStagedTenant(result);
      return 0;
    }
    let identity: EasProjectIdentity | null = null;
    try {
      identity = await resolveEasSelection(selection, {
        frontendRoot,
        displayName: result.tenant.displayName,
        slug: result.tenant.slug,
        sourceIcon: path.join(result.stagedAssetDirectory, "source/app-icon.png"),
      });
      if (identity) await publishLinkedEas(result.stagedModulePath, identity);
      const verificationProgress = spinner();
      await publishStagedTenant(result, frontendRoot, async (tenantId) => {
        verificationProgress.start("Preparing tenant validation");
        try {
          await verifyNewTenant(frontendRoot, tenantId, runTenantVerificationProcess, (stage) =>
            verificationProgress.message(stage)
          );
          verificationProgress.stop("Tenant validation passed");
        } catch (error) {
          verificationProgress.error("Tenant validation failed");
          throw error;
        }
      });
    } catch (error) {
      await discardStagedTenant(result);
      if (identity) {
        await writeTenantRecovery(path.join(frontendRoot, ".tenant-add"), {
          schemaVersion: 1,
          tenantId: result.tenant.id,
          owner: identity.owner,
          slug: identity.slug,
          projectId: identity.projectId,
          updateUrl: identity.updateUrl,
          createdAt: new Date().toISOString(),
        });
      }
      throw error;
    }
    if (recovery) await removeTenantRecovery(tenantAddRoot, result.tenant.id);
    if (activeDraftId) await removeTenantDraft(tenantAddRoot, activeDraftId);
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
