import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { createExpoConfig } from "../../config/createExpoConfig";
import { registerTransientTenant } from "../../config/tenants/registry";
import { generateTenantAssets } from "../assets/generate";
import { getTenantAssetPaths } from "../assets/paths";
import { validateTenantAssets } from "../assets/validate";
import { normalizeOrCreateLogo } from "./logo";
import { addRepositoryTenantToRegistry } from "./registryEditor";
import { renderTenantFiles } from "./renderTenantFiles";
import { themeRecipeV1Schema } from "../../config/tenants/themeRecipe";
import type { TenantAddAnswers, TenantAddResult } from "./types";
import { createTenantConfig } from "./validation";

const exists = async (target: string) =>
  access(target)
    .then(() => true)
    .catch(() => false);
const execFileAsync = promisify(execFile);

export const scaffoldTenant = async (
  answers: TenantAddAnswers,
  frontendRoot = process.cwd(),
  verify?: (tenantId: string) => Promise<void>
): Promise<TenantAddResult> => {
  const tenant = createTenantConfig(answers);
  const modulePath = path.join(
    frontendRoot,
    "config/tenants",
    tenant.kind === "local" ? ".local" : "",
    tenant.id
  );
  const registryPath = path.join(frontendRoot, "config/tenants/registry.ts");
  const registryBefore = await readFile(registryPath, "utf8");
  const created: string[] = [];
  let unregisterTransientTenant: (() => void) | undefined;

  if (await exists(modulePath)) throw new Error(`Tenant module already exists: ${modulePath}`);

  try {
    await mkdir(path.dirname(modulePath), { recursive: true });
    await mkdir(modulePath, { recursive: false });
    created.push(modulePath);
    const recipe = themeRecipeV1Schema.parse({
      schemaVersion: 1,
      foundation: {
        primary: tenant.theme.colors.primary,
        onPrimary: tenant.theme.colors.onPrimary,
        accent: tenant.theme.colors.accent,
        onAccent: tenant.theme.colors.onAccent,
        background: tenant.theme.colors.background,
        onBackground: tenant.theme.colors.onBackground,
      },
      overrides: tenant.theme.colors,
    });
    for (const [fileName, source] of Object.entries(renderTenantFiles(tenant, recipe))) {
      await writeFile(path.join(modulePath, fileName), source, { encoding: "utf8", flag: "wx" });
    }

    if (tenant.kind === "repository") {
      await writeFile(
        registryPath,
        addRepositoryTenantToRegistry(registryBefore, tenant.id),
        "utf8"
      );
      unregisterTransientTenant = registerTransientTenant(tenant);
    }

    const paths = getTenantAssetPaths(tenant.id);
    if (await exists(paths.tenantDirectory)) {
      throw new Error(`Tenant asset directory already exists: ${paths.tenantDirectory}`);
    }
    const logo = await normalizeOrCreateLogo({
      tenantId: tenant.id,
      primaryColor: tenant.brand.primaryColor,
      onPrimaryColor: tenant.theme.colors.onPrimary,
      logoPath: answers.logoPath,
    });
    await mkdir(paths.sourceDirectory, { recursive: true });
    created.push(paths.tenantDirectory);
    await writeFile(paths.sourceIcon, logo.contents, { flag: "wx" });
    if (tenant.kind === "local") {
      for (const ignoredPath of [path.join(modulePath, "index.ts"), paths.sourceIcon]) {
        await execFileAsync("git", ["check-ignore", "-q", ignoredPath], {
          cwd: frontendRoot,
        });
      }
    }
    await generateTenantAssets(tenant.id);
    const failures = (await validateTenantAssets(tenant.id)).filter(({ ok }) => !ok);
    if (failures.length > 0) {
      throw new Error(`Asset validation failed: ${failures.map(({ name }) => name).join(", ")}`);
    }
    for (const environment of ["development", "preview", "production"] as const) {
      createExpoConfig({ baseConfig: {}, tenant, environment, processEnv: {} });
    }
    await verify?.(tenant.id);

    return {
      tenant,
      modulePath,
      assetDirectory: paths.tenantDirectory,
      logoSource: logo.source,
      launchCommand:
        `npm run app -- start --tenant ${tenant.id} ` + "--environment development --yes",
    };
  } catch (error) {
    if (tenant.kind === "repository") await writeFile(registryPath, registryBefore, "utf8");
    for (const target of created.reverse()) await rm(target, { recursive: true, force: true });
    throw error;
  } finally {
    unregisterTransientTenant?.();
  }
};
