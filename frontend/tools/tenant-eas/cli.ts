import "dotenv/config";
import { spawn } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { cancel, confirm, intro, isCancel, outro, select, text } from "@clack/prompts";
import { getTenant } from "../../config/tenants/registry";
import type { TenantConfig, TenantEasConfig } from "../../config/tenants/types";
import { replaceTenantEasBlock } from "../tenant-add/easEditor";
import {
  createEasProject,
  getAuthenticatedExpoUser,
  verifyLinkedEasProject,
} from "../tenant-add/eas/project";
import type {
  EasProjectIdentity,
  EasProjectRunner,
  TenantEasSelection,
} from "../tenant-add/eas/types";
import {
  readTenantRecovery,
  removeTenantRecovery,
  type TenantRecovery,
  writeTenantRecovery,
} from "../tenant-add/recovery";

export interface TenantEasCliDependencies {
  argv: string[];
  getTenant: (tenantId: string) => TenantConfig;
  collectSelection: (tenant: TenantConfig) => Promise<TenantEasSelection | null>;
  resolveProject: (
    tenant: TenantConfig,
    selection: TenantEasSelection
  ) => Promise<EasProjectIdentity>;
  readTenantIndex: (tenantId: string) => Promise<string>;
  writeTenantIndex: (tenantId: string, source: string) => Promise<void>;
  replaceTenantEasBlock: typeof replaceTenantEasBlock;
  runFastPreflight: (tenantId: string) => Promise<void>;
  readRecovery: (tenantId: string) => Promise<TenantRecovery | null>;
  writeRecovery: (identity: EasProjectIdentity, tenantId: string) => Promise<void>;
  removeRecovery: (tenantId: string) => Promise<void>;
  writeOutput: (value: string) => void;
}

const parseTenantId = (argv: string[]) => {
  const parsed = parseArgs({ args: argv, options: { tenant: { type: "string" } }, strict: true });
  if (!parsed.values.tenant) throw new Error("Usage: npm run tenant:eas -- --tenant <tenant-id>");
  return parsed.values.tenant;
};

export const runTenantEasCli = async (dependencies: TenantEasCliDependencies): Promise<number> => {
  const tenantId = parseTenantId(dependencies.argv);
  const tenant = dependencies.getTenant(tenantId);
  if (tenant.kind !== "repository") throw new Error("Local tenants cannot be linked to EAS");
  if (tenant.eas.status !== "pending") throw new Error(`Tenant "${tenant.id}" is already linked`);
  const recovery = await dependencies.readRecovery(tenant.id);
  if (recovery && recovery.slug !== tenant.slug) {
    throw new Error(`Recovery slug "${recovery.slug}" does not match tenant slug "${tenant.slug}"`);
  }
  let identity: EasProjectIdentity;
  if (recovery) {
    identity = await dependencies.resolveProject(tenant, {
      kind: "link",
      projectId: recovery.projectId,
    });
    for (const field of ["owner", "slug", "projectId", "updateUrl"] as const) {
      if (identity[field] !== recovery[field]) {
        throw new Error(`Recovered EAS ${field} no longer matches the verified remote project`);
      }
    }
  } else {
    const selection = await dependencies.collectSelection(tenant);
    if (!selection || selection.kind === "skip") return 0;
    identity = await dependencies.resolveProject(tenant, selection);
  }
  const eas: TenantEasConfig = {
    status: "linked",
    owner: identity.owner,
    projectId: identity.projectId,
    updateUrl: identity.updateUrl,
  };
  let original: string | undefined;
  let wroteLinkedSource = false;
  try {
    original = await dependencies.readTenantIndex(tenant.id);
    const updated = dependencies.replaceTenantEasBlock(original, eas);
    await dependencies.writeTenantIndex(tenant.id, updated);
    wroteLinkedSource = true;
    await dependencies.runFastPreflight(tenant.id);
  } catch (error) {
    if (wroteLinkedSource && original !== undefined) {
      await dependencies.writeTenantIndex(tenant.id, original);
    }
    await dependencies.writeRecovery(identity, tenant.id);
    throw error;
  }
  await dependencies.removeRecovery(tenant.id);
  dependencies.writeOutput(
    `EAS linked: ${identity.owner}/${identity.projectId}\n` +
      `npm run app -- build ios --tenant ${tenant.id} --environment production --profile production --yes --dry-run\n`
  );
  return 0;
};

const runProcess: EasProjectRunner = ({ command, args, cwd, env }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...env,
        NODE_ENV: env.NODE_ENV ?? process.env.NODE_ENV ?? "development",
      },
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

const runFastPreflight = (root: string, tenantId: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(
      "npm",
      ["run", "preflight", "--", "--tenant", tenantId, "--environment", "development"],
      { cwd: root, env: process.env, stdio: "inherit" }
    );
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Fast preflight failed (exit ${code})`))
    );
  });

const runDefaultCli = async () => {
  const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const indexPath = (tenantId: string) =>
    path.join(frontendRoot, "config/tenants", tenantId, "index.ts");
  intro("Link tenant to EAS");
  const exitCode = await runTenantEasCli({
    argv: process.argv.slice(2),
    getTenant,
    collectSelection: async (tenant) => {
      const action = await select({
        message: "EAS project setup",
        options: [
          { value: "create", label: "Create a new Expo project" },
          { value: "link", label: "Link an existing Expo project" },
          { value: "skip", label: "Skip for now" },
        ],
      });
      if (isCancel(action) || action === "skip") return null;
      if (action === "link") {
        const projectId = await text({ message: "Expo project UUID" });
        if (isCancel(projectId)) return null;
        const normalizedProjectId = String(projectId).trim();
        const approved = await confirm({
          message: `Link ${tenant.slug} to Expo project ${normalizedProjectId}?`,
          initialValue: false,
        });
        return approved === true ? { kind: "link", projectId: normalizedProjectId } : null;
      }
      const authenticated = await getAuthenticatedExpoUser(runProcess, frontendRoot);
      const owner = await text({ message: "Expo owner", initialValue: authenticated });
      if (isCancel(owner)) return null;
      const approved = await confirm({
        message: `Create Expo project ${String(owner).trim()}/${tenant.slug}?`,
        initialValue: false,
      });
      return approved === true ? { kind: "create", owner: String(owner).trim() } : null;
    },
    resolveProject: async (tenant, selection) => {
      if (selection.kind === "skip") throw new Error("Skip does not resolve an EAS project");
      const request = {
        displayName: tenant.displayName,
        slug: tenant.slug,
      };
      if (selection.kind === "create") {
        return createEasProject(runProcess, { ...request, owner: selection.owner });
      }
      return verifyLinkedEasProject(runProcess, { ...request, projectId: selection.projectId });
    },
    readTenantIndex: (tenantId) => readFile(indexPath(tenantId), "utf8"),
    writeTenantIndex: async (tenantId, source) => {
      const target = indexPath(tenantId);
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, source, "utf8");
      await rename(temporary, target);
    },
    replaceTenantEasBlock,
    runFastPreflight: (tenantId) => runFastPreflight(frontendRoot, tenantId),
    readRecovery: async (tenantId) => {
      const recovery = await readTenantRecovery(path.join(frontendRoot, ".tenant-add"), tenantId);
      if (!recovery) return null;
      const approved = await confirm({
        message: `Resume recovered EAS project ${recovery.owner}/${recovery.slug} (${recovery.projectId})?`,
        initialValue: true,
      });
      if (approved !== true) {
        throw new Error("Recovery retained; no new Expo project was created");
      }
      return recovery;
    },
    writeRecovery: (identity, tenantId) =>
      writeTenantRecovery(path.join(frontendRoot, ".tenant-add"), {
        schemaVersion: 1,
        tenantId,
        owner: identity.owner,
        slug: identity.slug,
        projectId: identity.projectId,
        updateUrl: identity.updateUrl,
        createdAt: new Date().toISOString(),
      }),
    removeRecovery: (tenantId) =>
      removeTenantRecovery(path.join(frontendRoot, ".tenant-add"), tenantId),
    writeOutput: (value) => process.stdout.write(value),
  });
  outro("Tenant EAS setup complete.");
  return exitCode;
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain)
  void runDefaultCli()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      cancel(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
