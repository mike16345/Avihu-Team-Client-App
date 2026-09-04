import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { createExpoConfig } from "../../config/createExpoConfig";
import { registerTransientTenant } from "../../config/tenants/registry";
import { generateTenantAssets } from "../assets/generate";
import { getTenantAssetPaths } from "../assets/paths";
import { validateTenantAssets } from "../assets/validate";
import { normalizeOrCreateLogo } from "./logo";
import {
  addRepositoryTenantToRegistry,
  removeRepositoryTenantFromRegistry,
} from "./registryEditor";
import { renderTenantFiles } from "./renderTenantFiles";
import type { TenantAddAnswers, TenantAddResult } from "./types";
import { createTenantConfig } from "./validation";
import { loadThemeSelection } from "./themeInput";

const exists = async (target: string) =>
  access(target)
    .then(() => true)
    .catch(() => false);
const execFileAsync = promisify(execFile);

export const scaffoldTenant = async (
  answers: TenantAddAnswers,
  frontendRoot = process.cwd()
): Promise<TenantAddResult> => {
  const loadedTheme = await loadThemeSelection(answers.themeSelection);
  const tenant = createTenantConfig(answers, loadedTheme.recipe);
  const modulePath = path.join(
    frontendRoot,
    "config/tenants",
    tenant.kind === "local" ? ".local" : "",
    tenant.id
  );
  const declaredAssetDirectory = path.resolve(frontendRoot, tenant.assets.icon, "../..");
  const stagingParent = path.join(frontendRoot, ".tenant-add", "staging");
  await mkdir(stagingParent, { recursive: true });
  const stagingRoot = await mkdtemp(path.join(stagingParent, `${tenant.id}-`));
  const stagedModulePath = path.join(
    stagingRoot,
    "config/tenants",
    tenant.kind === "local" ? ".local" : "",
    tenant.id
  );
  const stagedAssetsRoot = path.join(
    stagingRoot,
    "config/tenants/assets",
    tenant.kind === "local" ? ".local" : ""
  );
  const stagedAssetDirectory = path.join(stagedAssetsRoot, tenant.id);
  let unregisterTransientTenant: (() => void) | undefined;
  const previousAssetsRoot = process.env.TENANT_ASSETS_ROOT;

  if (await exists(modulePath)) throw new Error(`Tenant module already exists: ${modulePath}`);
  if (await exists(declaredAssetDirectory)) {
    throw new Error(`Tenant asset directory already exists: ${declaredAssetDirectory}`);
  }

  try {
    await mkdir(stagedModulePath, { recursive: true });
    for (const [fileName, source] of Object.entries(
      renderTenantFiles(tenant, loadedTheme.recipe)
    )) {
      await writeFile(path.join(stagedModulePath, fileName), source, { encoding: "utf8", flag: "wx" });
    }

    unregisterTransientTenant = registerTransientTenant(tenant);
    process.env.TENANT_ASSETS_ROOT = stagedAssetsRoot;
    const paths = getTenantAssetPaths(tenant.id);
    const logo = await normalizeOrCreateLogo({
      tenantId: tenant.id,
      primaryColor: tenant.brand.primaryColor,
      onPrimaryColor: tenant.theme.colors.onPrimary,
      logoPath: answers.logoPath,
    });
    await mkdir(paths.sourceDirectory, { recursive: true });
    await writeFile(paths.sourceIcon, logo.contents, { flag: "wx" });
    await generateTenantAssets(tenant.id);
    const failures = (await validateTenantAssets(tenant.id)).filter(({ ok }) => !ok);
    if (failures.length > 0) {
      throw new Error(`Asset validation failed: ${failures.map(({ name }) => name).join(", ")}`);
    }
    for (const environment of ["development", "preview", "production"] as const) {
      createExpoConfig({ baseConfig: {}, tenant, environment, processEnv: {} });
    }

    return {
      tenant,
      modulePath,
      assetDirectory: declaredAssetDirectory,
      stagingRoot,
      stagedModulePath,
      stagedAssetDirectory,
      logoSource: logo.source,
      launchCommand:
        `npm run app -- start --tenant ${tenant.id} ` + "--environment development --yes",
    };
  } catch (error) {
    await rm(stagingRoot, { recursive: true, force: true });
    throw error;
  } finally {
    if (previousAssetsRoot === undefined) delete process.env.TENANT_ASSETS_ROOT;
    else process.env.TENANT_ASSETS_ROOT = previousAssetsRoot;
    unregisterTransientTenant?.();
  }
};

export const discardStagedTenant = (result: TenantAddResult) =>
  rm(result.stagingRoot, { recursive: true, force: true });

export const publishStagedTenant = async (
  result: TenantAddResult,
  frontendRoot: string,
  verify: (tenantId: string) => Promise<void>
) => {
  const registryPath = path.join(frontendRoot, "config/tenants/registry.ts");
  let registryBefore = await readFile(registryPath, "utf8");
  let registryAfter =
    result.tenant.kind === "repository"
      ? addRepositoryTenantToRegistry(registryBefore, result.tenant.id)
      : registryBefore;
  const writeRegistry = async (source: string) => {
    const temporary = `${registryPath}.${process.pid}.tmp`;
    await writeFile(temporary, source, "utf8");
    await rename(temporary, registryPath);
  };
  let modulePublished = false;
  let assetsPublished = false;
  let registryPublished = false;
  try {
    if ((await exists(result.modulePath)) || (await exists(result.assetDirectory))) {
      throw new Error(`Tenant ${result.tenant.id} was created while onboarding was staged`);
    }
    await mkdir(path.dirname(result.modulePath), { recursive: true });
    await mkdir(path.dirname(result.assetDirectory), { recursive: true });
    await rename(result.stagedModulePath, result.modulePath);
    modulePublished = true;
    await rename(result.stagedAssetDirectory, result.assetDirectory);
    assetsPublished = true;
    if (result.tenant.kind === "repository") {
      const latestRegistry = await readFile(registryPath, "utf8");
      if (latestRegistry !== registryBefore) {
        registryBefore = latestRegistry;
        registryAfter = addRepositoryTenantToRegistry(latestRegistry, result.tenant.id);
      }
      await writeRegistry(registryAfter);
      registryPublished = true;
    } else {
      for (const ignoredPath of [
        path.join(result.modulePath, "index.ts"),
        path.join(result.assetDirectory, "source/app-icon.png"),
      ]) {
        await execFileAsync("git", ["check-ignore", "-q", ignoredPath], { cwd: frontendRoot });
      }
    }
    await verify(result.tenant.id);
    await rm(result.stagingRoot, { recursive: true, force: true });
  } catch (error) {
    if (registryPublished) {
      const current = await readFile(registryPath, "utf8");
      await writeRegistry(
        current === registryAfter
          ? registryBefore
          : removeRepositoryTenantFromRegistry(current, result.tenant.id)
      );
    }
    if (assetsPublished) await rm(result.assetDirectory, { recursive: true, force: true });
    if (modulePublished) await rm(result.modulePath, { recursive: true, force: true });
    await rm(result.stagingRoot, { recursive: true, force: true });
    throw error;
  }
};
