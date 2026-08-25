# Tenant Onboarding UX and EAS Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual semantic-color and Expo UUID entry with preset/JSON theme recipes, compact tenant folders, and safe Create/Link/Skip EAS setup while preserving Avihu exactly.

**Architecture:** A pure versioned recipe compiler expands six foundation colors plus strict overrides into the existing complete tenant theme. Tenant source is split into `index.ts`, `theme.ts`, and `features.ts`; EAS identity becomes linked/pending state, and an injected EAS adapter runs only in an isolated temporary Expo workspace. The existing transactional scaffold validates local work before optional remote creation and writes a non-secret ignored recovery record if remote creation succeeds before local publication fails.

**Tech Stack:** Expo 53, React Native 0.79, TypeScript 5.8 strict mode, Zod 3, Vitest 3, Sharp 0.35, `@clack/prompts` 1.7, pinned `eas-cli@16.27.0`, existing asset/preflight/app-control tooling.

**Spec:** `docs/superpowers/specs/2026-08-25-tenant-onboarding-ux-eas-design.md`

## Global Constraints

- Preserve Avihu's exact app identity, resolved Expo configuration, plugin composition, theme values, enabled JavaScript defaults, native capabilities, RTL behavior, asset hashes, and release behavior.
- Do not add backend entitlement integration, a hosted theme editor, signing/credential automation, EAS environment secrets, builds, updates, submissions, or store operations.
- Automated tests must never create, link, or delete a real EAS project.
- EAS project creation must have a dedicated confirmation immediately before the external command.
- EAS CLI must run project initialization only inside an invocation-owned temporary workspace.
- Never store credentials, access tokens, environment values, or raw authentication output in tenant files or recovery files.
- Never auto-delete a remotely created EAS project.
- Pending and local tenants must fail release/build/update/EAS actions before starting a child process.
- Keep JavaScript feature defaults and native binary capabilities separate; neither a recipe nor an entitlement override may imply an absent native package.
- Continue using the existing deterministic asset generator, Expo resolver, registry markers, app-control path, and shared preflight suites.
- Keep the ignored local test tenant and all `.tenant-add` staging/recovery files out of Git.
- Use existing Vitest infrastructure and Prettier; add no test framework or theme dependency.
- Perform no merge, push, real EAS initialization, EAS build/update, or store action.

---

### Task 1: Add versioned theme recipes and built-in presets

**Files:**

- Create: `frontend/config/tenants/themeRecipe.ts`
- Create: `frontend/config/tenants/themePresets.ts`
- Create: `frontend/config/__tests__/themeRecipe.test.ts`
- Modify: `frontend/config/tenants/theme.ts`
- Modify: `frontend/config/tenants/types.ts`

**Interfaces:**

- Produces: `themeRecipeV1Schema`, `ThemeRecipeV1`, `ThemeColorOverrides`.
- Produces: `THEME_PRESET_IDS`, `ThemePresetId`, `getThemePreset(id)`.
- Produces: `createTenantTheme(recipe): TenantTheme` and `mergeThemeColorOverrides(base, overrides)`.
- Preserves: the complete strict `tenantThemeSchema` as the final runtime contract.

- [ ] **Step 1: Write failing recipe-schema and deterministic-expansion tests**

Create `frontend/config/__tests__/themeRecipe.test.ts` with exact catalog, version, strictness,
contrast, determinism, and override assertions:

```ts
import { describe, expect, it } from "vitest";
import { createTenantTheme, themeRecipeV1Schema } from "../tenants/themeRecipe";
import { THEME_PRESET_IDS, getThemePreset } from "../tenants/themePresets";
import { tenantThemeSchema } from "../tenants/theme";

describe("tenant theme recipes", () => {
  it("owns a small stable preset catalog", () => {
    expect(THEME_PRESET_IDS).toEqual(["avihu", "ivory-orange-blue", "violet-amber"]);
  });

  it("expands the same recipe deterministically into a complete strict theme", () => {
    const recipe = getThemePreset("ivory-orange-blue");
    const first = createTenantTheme(recipe);
    expect(createTenantTheme(recipe)).toEqual(first);
    expect(tenantThemeSchema.parse(first)).toEqual(first);
    expect(first.colors.primary).toBe("#174A7E");
    expect(first.colors.accent).toBe("#E97824");
    expect(first.colors.diet.card).toBe("#FFF9ED");
    expect(first.colors.graph.line).toBe("#E97824");
  });

  it("applies strict nested overrides after expansion", () => {
    const recipe = {
      ...getThemePreset("violet-amber"),
      overrides: { scanner: { viewfinder: "#21A179" } },
    };
    expect(createTenantTheme(recipe).colors.scanner.viewfinder).toBe("#21A179");
    expect(() =>
      themeRecipeV1Schema.parse({ ...recipe, overrides: { scanner: { unknown: "#FFFFFF" } } })
    ).toThrow();
  });

  it("rejects unsupported versions and inaccessible foundation contrast", () => {
    const recipe = getThemePreset("violet-amber");
    expect(() => themeRecipeV1Schema.parse({ ...recipe, schemaVersion: 2 })).toThrow();
    expect(() =>
      themeRecipeV1Schema.parse({
        ...recipe,
        foundation: { ...recipe.foundation, primary: "#FFFFFF", onPrimary: "#FFFFFF" },
      })
    ).toThrow(/contrast/u);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the recipe modules are missing**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/themeRecipe.test.ts
```

Expected: FAIL because `themeRecipe.ts` and `themePresets.ts` do not exist.

- [ ] **Step 3: Export the color-object schema and define the strict recipe schema**

In `theme.ts`, export the existing `tenantColorSchema` and strict colors object as
`tenantThemeColorsSchema`, then build `tenantThemeSchema` from it. In `themeRecipe.ts`, define these
exact public types and validation:

```ts
export const themeFoundationSchema = z
  .object({
    primary: tenantColorSchema,
    onPrimary: tenantColorSchema,
    accent: tenantColorSchema,
    onAccent: tenantColorSchema,
    background: tenantColorSchema,
    onBackground: tenantColorSchema,
  })
  .strict();

export const themeColorOverridesSchema = tenantThemeColorsSchema.deepPartial().strict();

function validateFoundationContrast(recipe: ThemeRecipeV1, context: z.RefinementCtx): void {
  validateContrastPair(
    context,
    "foundation.primary",
    recipe.foundation.primary,
    recipe.foundation.onPrimary
  );
  validateContrastPair(
    context,
    "foundation.accent",
    recipe.foundation.accent,
    recipe.foundation.onAccent
  );
  validateContrastPair(
    context,
    "foundation.background",
    recipe.foundation.background,
    recipe.foundation.onBackground
  );
}

export const themeRecipeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    foundation: themeFoundationSchema,
    overrides: themeColorOverridesSchema.optional(),
  })
  .strict()
  .superRefine(validateFoundationContrast);

export type ThemeRecipeV1 = z.infer<typeof themeRecipeV1Schema>;
export type ThemeColorOverrides = z.infer<typeof themeColorOverridesSchema>;
```

Define `validateContrastPair` beside the existing exported WCAG ratio helper, require a minimum
4.5:1 ratio for each named pair, and add a Zod issue at the named foundation path. Reuse those two
helpers instead of keeping a second implementation in `tools/tenant-add/validation.ts`.

- [ ] **Step 4: Implement deterministic semantic expansion and strict deep merging**

Implement immutable recursive merging that rejects arrays and validates the final result:

```ts
export const mergeThemeColorOverrides = (
  base: TenantTheme["colors"],
  overrides: ThemeColorOverrides = {}
): TenantTheme["colors"] => {
  const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
  const merge = (left: Record<string, unknown>, right: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(left).map(([key, value]) => {
        const override = right[key];
        if (override === undefined) return [key, value];
        if (isPlainObject(value) && isPlainObject(override)) return [key, merge(value, override)];
        return [key, override];
      })
    );
  return tenantThemeColorsSchema.parse(
    merge(base as Record<string, unknown>, overrides as Record<string, unknown>)
  );
};

export const createTenantTheme = (input: ThemeRecipeV1): TenantTheme => {
  const recipe = themeRecipeV1Schema.parse(input);
  const colors = createFoundationColors(recipe.foundation);
  return tenantThemeSchema.parse({ colors: mergeThemeColorOverrides(colors, recipe.overrides) });
};
```

`createFoundationColors` must explicitly populate every current theme leaf. Use the existing
violet/amber expansion from `tools/tenant-add/validation.ts` as the initial mapping, extend it across
all strict groups, and remove that duplicate expansion only after Task 4 switches onboarding to the
shared compiler.

- [ ] **Step 5: Define the three immutable built-in recipes**

In `themePresets.ts`, use this exact catalog and return deep clones so callers cannot mutate the
catalog. The Avihu recipe must copy the current committed Avihu semantic colors into `overrides`;
it must not import `avihuTenant`, because Task 3 makes Avihu consume this preset and that import
would create a cycle.

```ts
export const THEME_PRESET_IDS = ["avihu", "ivory-orange-blue", "violet-amber"] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

const presets = {
  "ivory-orange-blue": {
    schemaVersion: 1,
    foundation: {
      primary: "#174A7E",
      onPrimary: "#FFFFFF",
      accent: "#E97824",
      onAccent: "#FFFFFF",
      background: "#FFF9ED",
      onBackground: "#17212B",
    },
  },
  "violet-amber": {
    schemaVersion: 1,
    foundation: {
      primary: "#5B21B6",
      onPrimary: "#FFFFFF",
      accent: "#F59E0B",
      onAccent: "#1F1300",
      background: "#FFF7ED",
      onBackground: "#2E1065",
    },
  },
  avihu: avihuThemeRecipe,
} satisfies Record<ThemePresetId, ThemeRecipeV1>;

export const getThemePreset = (id: ThemePresetId): ThemeRecipeV1 => structuredClone(presets[id]);
```

Populate `avihuThemeRecipe.overrides` from the exact current `avihuTenant.theme.colors`, not from
newly derived approximations.

- [ ] **Step 6: Run recipe tests, full typecheck, and commit**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/themeRecipe.test.ts src/themes/__tests__/tenantTheme.test.ts
npm run typecheck
```

Expected: PASS.

Commit:

```sh
git add frontend/config/tenants/theme.ts frontend/config/tenants/themeRecipe.ts frontend/config/tenants/themePresets.ts frontend/config/tenants/types.ts frontend/config/__tests__/themeRecipe.test.ts
git commit -m "feat: add tenant theme recipes and presets"
```

---

### Task 2: Replace placeholder Expo identity with linked/pending EAS state

**Files:**

- Modify: `frontend/config/tenants/schema.ts`
- Modify: `frontend/config/tenants/types.ts`
- Modify: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/config/tenants/registry.ts`
- Modify: `frontend/config/createExpoConfig.ts`
- Modify: `frontend/config/__tests__/tenantRegistry.test.ts`
- Modify: `frontend/config/__tests__/createExpoConfig.test.ts`
- Modify: `frontend/tools/preflight/checks/expoConfig.ts`
- Modify: `frontend/tools/preflight/cli.ts`
- Modify: `frontend/tools/preflight/__tests__/cli.test.ts`
- Modify: `frontend/tools/app-control/actions.ts`
- Modify: `frontend/tools/app-control/__tests__/actions.test.ts`

**Interfaces:**

- Produces: `tenantEasConfigSchema`, `TenantEasConfig`, `isLinkedTenantEas(eas)`.
- Produces: `assertTenantEasActionAllowed(tenant, actionName)` for shared fail-closed policy.
- Changes: `TenantConfig.owner/projectId/updateUrl` to `TenantConfig.eas`.
- Preserves: Avihu's resolved `owner`, `extra.eas.projectId`, `updates.url`, plugins, and identities.

- [ ] **Step 1: Write failing linked/pending schema and Expo-resolution tests**

Add these cases to the existing registry and Expo tests:

```ts
expect(tenantConfigSchema.parse(avihuTenant).eas).toEqual({
  status: "linked",
  owner: "avihuteam",
  projectId: "bbbbb60d-eb47-48fb-a278-517aba8dcea2",
  updateUrl: "https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2",
});

const pendingTenant = tenantConfigSchema.parse({
  ...avihuTenant,
  id: "pending-tenant",
  slug: "pending-tenant",
  eas: { status: "pending" },
});
const pendingConfig = createExpoConfig({
  baseConfig: {},
  tenant: pendingTenant,
  environment: "development",
  processEnv: {},
});
expect(pendingConfig.owner).toBeUndefined();
expect(pendingConfig.extra?.eas).toBeUndefined();
expect(pendingConfig.updates).toBeUndefined();
```

Add action/preflight tests proving pending repository tenants and local tenants reject EAS-required
actions while development start and fast preflight remain allowed.

- [ ] **Step 2: Run focused tests and confirm the old top-level fields fail expectations**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/tenantRegistry.test.ts config/__tests__/createExpoConfig.test.ts tools/app-control/__tests__/actions.test.ts tools/preflight/__tests__/cli.test.ts
```

Expected: FAIL because `TenantConfig` still requires top-level `owner`, `projectId`, and `updateUrl`.

- [ ] **Step 3: Implement the EAS discriminated union and migrate Avihu**

In `schema.ts`:

```ts
export const tenantEasConfigSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("linked"),
      owner: tenantIdSchema,
      projectId: z.string().uuid(),
      updateUrl: z.string().url(),
    })
    .strict(),
  z.object({ status: z.literal("pending") }).strict(),
]);
```

Replace the three top-level fields with `eas: tenantEasConfigSchema`. Export:

```ts
export const isLinkedTenantEas = (
  eas: TenantEasConfig
): eas is Extract<TenantEasConfig, { status: "linked" }> => eas.status === "linked";
```

Also export the existing strict `tenantIdSchema` for recovery-path validation in Task 6.

Set Avihu's existing values under `eas: { status: "linked", ... }` without changing them.

- [ ] **Step 4: Resolve linked and pending Expo configuration explicitly**

Build the optional fields before returning `ExpoConfig`:

```ts
const easConfig = isLinkedTenantEas(tenant.eas)
  ? {
      owner: tenant.eas.owner,
      updates: { url: tenant.eas.updateUrl },
      easExtra: { eas: { projectId: tenant.eas.projectId } },
    }
  : { easExtra: {} };
```

Spread `owner` and `updates` only for linked tenants and merge `easExtra` into `extra`. Update the
preflight Expo-config check to compare linked values and assert all three are absent for pending
tenants.

- [ ] **Step 5: Centralize pending/local EAS action policy**

Add a pure shared guard in `config/tenants/eas.ts` or `schema.ts`:

```ts
export const assertTenantEasActionAllowed = (tenant: TenantConfig, actionName: string) => {
  if (tenant.kind === "local") {
    throw new Error(`Local tenant "${tenant.id}" cannot run ${actionName}`);
  }
  if (tenant.eas.status === "pending") {
    throw new Error(
      `Tenant "${tenant.id}" has pending EAS setup and cannot run ${actionName}. ` +
        `Run: npm run tenant:eas -- --tenant ${tenant.id}`
    );
  }
};
```

Use it from app-control for build/update and from preflight for release/eas. Keep the existing local
non-development native-run prohibition. Registry project-ID collision claims apply only to linked
tenants.

- [ ] **Step 6: Run focused tests, Avihu Expo snapshots, and typecheck**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/tenantRegistry.test.ts config/__tests__/createExpoConfig.test.ts tools/app-control/__tests__/actions.test.ts tools/preflight/__tests__/cli.test.ts
npm run typecheck
APP_TENANT=avihu APP_ENV=production npx expo config --type public --json
```

Expected: tests/typecheck PASS, and Avihu still resolves owner `avihuteam`, project ID
`bbbbb60d-eb47-48fb-a278-517aba8dcea2`, and its current update URL.

- [ ] **Step 7: Commit EAS state architecture**

```sh
git add frontend/config frontend/tools/app-control frontend/tools/preflight
git commit -m "feat: model pending and linked tenant EAS state"
```

---

### Task 3: Split tenant source into focused folders

**Files:**

- Create: `frontend/config/tenants/avihu/index.ts`
- Create: `frontend/config/tenants/avihu/theme.ts`
- Create: `frontend/config/tenants/avihu/features.ts`
- Delete: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/config/tenants/localRegistry.ts`
- Modify: `frontend/config/tenants/registry.ts`
- Modify: `frontend/config/__tests__/tenantRegistry.test.ts`
- Modify: `frontend/tools/tenant-add/renderTenantModule.ts`
- Create: `frontend/tools/tenant-add/renderTenantFiles.ts`
- Modify: `frontend/tools/tenant-add/__tests__/renderTenantModule.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/renderTenantFiles.test.ts`
- Modify: `frontend/tools/tenant-add/scaffold.ts`

**Interfaces:**

- Produces: `renderTenantFiles(tenant, recipe): Record<"index.ts" | "theme.ts" | "features.ts", string>`.
- Changes: local discovery from `.local/*.ts` to `.local/<tenant-id>/index.ts`.
- Preserves: imports of `config/tenants/avihu` through directory `index.ts` resolution.

- [ ] **Step 1: Write failing directory-discovery and three-file rendering tests**

Replace the temporary flat local fixtures with directories and assert exact behavior:

```ts
await mkdir(path.join(root, "beta"));
await writeFile(path.join(root, "beta", "index.ts"), renderFixtureTenant("beta"));
await writeFile(path.join(root, "beta", "theme.ts"), renderFixtureTheme());
await writeFile(path.join(root, "beta", "features.ts"), renderFixtureFeatures());
expect(loadLocalTenants(root).map(({ id }) => id)).toEqual(["alpha", "beta"]);
```

Add cases for symlink tenant directory, missing `index.ts`, unexpected tenant ID/directory mismatch,
and a non-directory entry. Add rendering assertions:

```ts
expect(Object.keys(renderTenantFiles(tenant, recipe)).sort()).toEqual([
  "features.ts",
  "index.ts",
  "theme.ts",
]);
expect(files["index.ts"]).toContain('import { tenantTheme } from "./theme"');
expect(files["index.ts"]).toContain(
  'import { featureDefaults, nativeCapabilities } from "./features"'
);
expect(files["theme.ts"]).toContain("createTenantTheme");
expect(files["features.ts"]).toContain("satisfies TenantFeatureDefaults");
```

- [ ] **Step 2: Run focused tests and confirm flat discovery/rendering fails**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/tenantRegistry.test.ts tools/tenant-add/__tests__/renderTenantModule.test.ts tools/tenant-add/__tests__/renderTenantFiles.test.ts
```

Expected: FAIL because discovery and rendering still assume one flat module.

- [ ] **Step 3: Move Avihu into a folder without changing its exported contract**

Create:

```ts
// config/tenants/avihu/theme.ts
import { createTenantTheme } from "../themeRecipe";
import { avihuThemeRecipe } from "../themePresets";
export const tenantTheme = createTenantTheme(avihuThemeRecipe);
```

```ts
// config/tenants/avihu/features.ts
import type { TenantFeatureDefaults, TenantNativeCapabilities } from "../types";
export const featureDefaults = {
  articles: true,
  chat: true,
  dietPlan: true,
  smartFoodCatalog: true,
  workoutPlan: true,
  stepTracking: true,
  progressTracking: true,
  formsAndAgreements: true,
  mediaCapture: true,
  notifications: true,
} satisfies TenantFeatureDefaults;
export const nativeCapabilities = {
  camera: true,
  photoLibrary: true,
  notifications: true,
  backgroundTasks: true,
  appleHealth: true,
  healthConnect: true,
  liveActivities: true,
} satisfies TenantNativeCapabilities;
```

`index.ts` contains the remaining exact Avihu record and imports these values. Export
`avihuTenant` under the same name. Remove `avihu.ts` only after `npm run typecheck` resolves every
existing extensionless import.

- [ ] **Step 4: Implement safe directory-only local discovery**

For every direct `.local` child: reject symlinks, require a regular directory, require regular
`index.ts`, `theme.ts`, and `features.ts`, load only `index.ts`, schema-parse exactly one exported
tenant, require `kind === "local"`, and require `tenant.id === directoryName`. Sort parsed tenants by
ID. Do not recursively execute arbitrary additional TypeScript files.

Use one path validator before module loading:

```ts
const resolveLocalTenantEntry = (root: string, directoryName: string) => {
  const tenantDirectory = path.join(root, directoryName);
  const directoryMetadata = lstatSync(tenantDirectory);
  if (directoryMetadata.isSymbolicLink() || !directoryMetadata.isDirectory()) {
    throw new Error(`Local tenant must be a regular directory: ${directoryName}`);
  }
  for (const fileName of TENANT_SOURCE_FILES) {
    const filePath = path.join(tenantDirectory, fileName);
    const metadata = lstatSync(filePath);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new Error(`Local tenant file must be regular: ${directoryName}/${fileName}`);
    }
  }
  return path.join(tenantDirectory, "index.ts");
};
```

- [ ] **Step 5: Render and transactionally publish three tenant files**

Replace the single module renderer entry point with:

```ts
export const renderTenantFiles = (
  tenant: TenantConfig,
  recipe: ThemeRecipeV1
): Record<TenantSourceFile, string> => ({
  "index.ts": renderTenantIndex(tenant),
  "theme.ts": renderTenantTheme(recipe, tenant.kind),
  "features.ts": renderTenantFeatures(tenant),
});
```

Define the file catalog beside the renderer:

```ts
export const TENANT_SOURCE_FILES = ["index.ts", "theme.ts", "features.ts"] as const;
export type TenantSourceFile = (typeof TENANT_SOURCE_FILES)[number];
```

`scaffoldTenant` journals and publishes the tenant directory as one target. A failure removes only
the invocation-created directory and restores registry bytes. Update registry generated imports to
`./<tenant-id>`.

- [ ] **Step 6: Run discovery/render/scaffold tests, typecheck, and Avihu checks**

Run:

```sh
cd frontend
npm run test:unit -- config/__tests__/tenantRegistry.test.ts tools/tenant-add/__tests__
npm run typecheck
npm run assets:check -- --tenant avihu
```

Expected: PASS; Avihu asset validation remains unchanged.

- [ ] **Step 7: Commit the tenant folder migration**

```sh
git add frontend/config/tenants frontend/config/__tests__/tenantRegistry.test.ts frontend/tools/tenant-add
git commit -m "refactor: split tenant configuration by responsibility"
```

---

### Task 4: Replace manual color prompts with presets and JSON import

**Files:**

- Modify: `frontend/tools/tenant-add/types.ts`
- Modify: `frontend/tools/tenant-add/prompts.ts`
- Create: `frontend/tools/tenant-add/themeInput.ts`
- Create: `frontend/tools/tenant-add/__tests__/themeInput.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/prompts.test.ts`
- Modify: `frontend/tools/tenant-add/validation.ts`
- Modify: `frontend/tools/tenant-add/__tests__/validation.test.ts`
- Modify: `frontend/tools/tenant-add/logo.ts`

**Interfaces:**

- Produces: `TenantThemeSelection = { kind: "preset"; presetId } | { kind: "recipe-file"; path }`.
- Produces: `loadThemeSelection(selection): Promise<{ recipe: ThemeRecipeV1; sourceLabel: string }>`.
- Produces: `createTenantIdentityFields(answers, suffix)` and `createTenantAssetDeclarations(answers, colors)` by extracting the current non-theme construction unchanged.
- Changes: `TenantAddAnswers` removes six individual color fields and adds `themeSelection`.

- [ ] **Step 1: Write failing theme-file and prompt tests**

Use temporary JSON fixtures and an injected prompt API. Assert preset ordering, recipe-file
selection, cancellation, exact validation paths, and that no individual semantic-color prompt is
issued:

```ts
expect(await loadThemeSelection({ kind: "preset", presetId: "ivory-orange-blue" })).toMatchObject({
  sourceLabel: "Ivory / Orange / Blue",
  recipe: { schemaVersion: 1 },
});
await writeFile(recipePath, JSON.stringify({ ...getThemePreset("violet-amber"), unknown: true }));
await expect(loadThemeSelection({ kind: "recipe-file", path: recipePath })).rejects.toThrow(
  /Unrecognized key.*unknown/u
);
expect(promptApi.text).not.toHaveBeenCalledWith(
  expect.objectContaining({ message: /primary color/i })
);
```

- [ ] **Step 2: Run focused tests and verify the old six-color answer shape fails**

Run:

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__/themeInput.test.ts tools/tenant-add/__tests__/prompts.test.ts tools/tenant-add/__tests__/validation.test.ts
```

Expected: FAIL because theme selection/import APIs do not exist.

- [ ] **Step 3: Define the new answer type and strict JSON loader**

Use this exact discriminated union:

```ts
export type TenantThemeSelection =
  { kind: "preset"; presetId: ThemePresetId } | { kind: "recipe-file"; path: string };

export interface TenantAddAnswers {
  // existing non-color fields remain
  themeSelection: TenantThemeSelection;
}
```

`loadThemeSelection` reads UTF-8, parses JSON with a filename-aware syntax error, validates through
`themeRecipeV1Schema`, expands through `createTenantTheme`, and returns the parsed recipe plus a
display label. It must not accept TypeScript or JavaScript theme files.

- [ ] **Step 4: Refactor prompts behind an injected `TenantPromptApi`**

Wrap the used `@clack/prompts` functions:

```ts
export interface TenantPromptApi {
  select: typeof select;
  text: typeof text;
  multiselect: typeof multiselect;
  confirm: typeof confirm;
  box: typeof box;
  cancel: typeof cancel;
  isCancel: typeof isCancel;
}
```

Keep `collectTenantAnswers(promptApi = defaultTenantPromptApi): Promise<TenantAddAnswers | null>` as
the public entry point. Call only methods on `promptApi`, check `promptApi.isCancel` after every
prompt, and return `null` before reading subsequent answers when cancellation occurs.

Theme choice options are Avihu, Ivory / Orange / Blue, Violet / Amber, and Import JSON recipe. Show
foundation colors, three contrast ratios, and override count in the summary.

- [ ] **Step 5: Build tenant config and fallback logo from the selected recipe**

Make `createTenantConfig` accept the already loaded recipe and derive `theme`, brand colors, splash,
adaptive background, notification color, and fallback-logo colors from `recipe.foundation`. Remove
the duplicate manual semantic expansion and color constants from onboarding validation.

The new construction boundary is:

```ts
export const createTenantConfig = (
  answers: TenantAddAnswers,
  recipe: ThemeRecipeV1,
  randomSuffix = randomBytes(3).toString("hex")
): TenantConfig => {
  const parsedRecipe = themeRecipeV1Schema.parse(recipe);
  const theme = createTenantTheme(parsedRecipe);
  const { primary, accent, background } = parsedRecipe.foundation;
  return tenantConfigSchema.parse({
    ...createTenantIdentityFields(answers, randomSuffix),
    eas: { status: "pending" },
    brand: { primaryColor: primary, backgroundColor: background },
    theme,
    assets: createTenantAssetDeclarations(answers, { accent, background }),
    featureDefaults: answers.featureDefaults,
    nativeCapabilities: answers.nativeCapabilities,
  });
};
```

Use this exact identity helper return type so all current identifiers, permissions, environment
identities, localization, and required-variable behavior remain owned outside theme construction:

```ts
type TenantIdentityFields = Omit<
  TenantConfig,
  "eas" | "assets" | "brand" | "theme" | "featureDefaults" | "nativeCapabilities"
>;

export const createTenantIdentityFields: (
  answers: TenantAddAnswers,
  randomSuffix: string
) => TenantIdentityFields;

export const createTenantAssetDeclarations: (
  answers: TenantAddAnswers,
  colors: { accent: string; background: string }
) => TenantConfig["assets"];
```

Extract the current inline identity/permission/environment object verbatim into
`createTenantIdentityFields`, then extract the current inline asset declarations verbatim into
`createTenantAssetDeclarations`. Change only their color inputs to the supplied foundation values;
do not duplicate either block or alter the identifier, permission, localization, or environment
rules.

- [ ] **Step 6: Run prompt/theme/validation tests and typecheck**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__/themeInput.test.ts tools/tenant-add/__tests__/prompts.test.ts tools/tenant-add/__tests__/validation.test.ts tools/tenant-add/__tests__/logo.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit simplified theme onboarding**

```sh
git add frontend/tools/tenant-add frontend/config/tenants/themeRecipe.ts frontend/config/tenants/themePresets.ts
git commit -m "feat: simplify tenant theme selection"
```

---

### Task 5: Build an isolated, injected EAS project adapter

**Files:**

- Create: `frontend/tools/eas/constants.ts`
- Modify: `frontend/tools/app-control/actions.ts`
- Create: `frontend/tools/tenant-add/eas/types.ts`
- Create: `frontend/tools/tenant-add/eas/workspace.ts`
- Create: `frontend/tools/tenant-add/eas/project.ts`
- Create: `frontend/tools/tenant-add/eas/__tests__/workspace.test.ts`
- Create: `frontend/tools/tenant-add/eas/__tests__/project.test.ts`

**Interfaces:**

- Produces: shared `EAS_CLI_ARGS = ["--yes", "eas-cli@16.27.0"]`.
- Produces: `EasProjectRunner`, `EasProjectIdentity`, `EasProjectRequest`.
- Produces: `TenantEasSelection = { kind: "create"; owner } | { kind: "link"; projectId } | { kind: "skip" }`.
- Produces: `EasWorkspaceInput` containing `displayName`, `slug`, `owner`, and optional `sourceIcon`.
- Produces: `withIsolatedEasWorkspace(input, callback)`.
- Produces: `getAuthenticatedExpoUser`, `createEasProject`, `verifyLinkedEasProject`.

- [ ] **Step 1: Write failing isolated-workspace and command tests**

Assert exact command arrays and repository isolation with a fake runner:

```ts
expect(runner).toHaveBeenCalledWith(
  expect.objectContaining({
    command: "npx",
    args: [
      "--yes",
      "eas-cli@16.27.0",
      "project:init",
      "--account",
      "acme",
      "--json",
      "--non-interactive",
      "--no-icon",
    ],
  })
);
expect(call.cwd).not.toBe(frontendRoot);
expect(await readFile(repositoryAppConfig, "utf8")).toBe(originalAppConfig);
```

Cover `whoami` unauthenticated output, malformed JSON, non-UUID project ID, owner mismatch, slug
mismatch, nonzero exit, callback exception cleanup, and source-logo copy.

- [ ] **Step 2: Run focused tests and confirm the EAS adapter is missing**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/eas/__tests__
```

Expected: FAIL because the adapter modules do not exist.

- [ ] **Step 3: Move the pinned CLI arguments into shared tooling**

Create `tools/eas/constants.ts`:

```ts
export const EAS_CLI_ARGS = ["--yes", "eas-cli@16.27.0"] as const;
```

Import it from app-control and the new adapter. Preserve existing app-control command snapshots.

- [ ] **Step 4: Define the injected process boundary and strict response parser**

```ts
export interface EasProjectRunnerInput {
  command: "npx";
  args: string[];
  cwd: string;
  env: Readonly<Record<string, string | undefined>>;
}

export type EasProjectRunner = (
  input: EasProjectRunnerInput
) => Promise<{ exitCode: number; stdout: string; stderr: string }>;

export interface EasProjectIdentity {
  owner: string;
  slug: string;
  projectId: string;
  updateUrl: string;
}

export interface EasProjectRequest {
  displayName: string;
  slug: string;
  owner: string;
  sourceIcon?: string;
}

export type TenantEasSelection =
  { kind: "create"; owner: string } | { kind: "link"; projectId: string } | { kind: "skip" };

export interface EasWorkspaceInput {
  displayName: string;
  slug: string;
  owner: string;
  sourceIcon?: string;
}
```

Parse only the documented JSON fields required to prove owner, slug, and UUID. Derive update URL as
`https://u.expo.dev/<projectId>` after UUID validation.

- [ ] **Step 5: Create and clean the minimal isolated Expo workspace**

Use `mkdtemp(path.join(os.tmpdir(), "tenant-eas-"))`, write minimal `package.json` and `app.json`
with confirmed name/slug/owner and no repository path references, copy the staged source logo when
available, and `rm` only that resolved invocation-owned directory in `finally`.

Reject a workspace path that is not inside the OS temporary root before cleanup. The callback sees
only the isolated path.

```ts
export const withIsolatedEasWorkspace = async <Result>(
  input: EasWorkspaceInput,
  callback: (workspace: string) => Promise<Result>
): Promise<Result> => {
  const temporaryRoot = await realpath(os.tmpdir());
  const workspace = await mkdtemp(path.join(temporaryRoot, "tenant-eas-"));
  try {
    await writeFile(path.join(workspace, "package.json"), JSON.stringify({ private: true }));
    await writeFile(
      path.join(workspace, "app.json"),
      JSON.stringify({ expo: { name: input.displayName, slug: input.slug, owner: input.owner } })
    );
    return await callback(workspace);
  } finally {
    if (!workspace.startsWith(`${temporaryRoot}${path.sep}`)) {
      throw new Error("Refusing to clean an EAS workspace outside the temporary root");
    }
    await rm(workspace, { recursive: true, force: true });
  }
};
```

- [ ] **Step 6: Implement whoami, Create, and Link verification**

Use the injected runner:

```ts
export const getAuthenticatedExpoUser = async (runner: EasProjectRunner, cwd: string) => {
  const result = await runner({
    command: "npx",
    args: [...EAS_CLI_ARGS, "whoami"],
    cwd,
    env: process.env,
  });
  if (result.exitCode !== 0 || !result.stdout.trim()) {
    throw new Error("Expo authentication is required. Run: eas login");
  }
  return result.stdout.trim();
};
```

Create uses `project:init --account`; Link uses `project:init --id`. Both add `--json`,
`--non-interactive`, and `--no-icon`, run inside the isolated workspace, and cross-check the result.

- [ ] **Step 7: Run adapter tests, app-control snapshots, and typecheck**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/eas/__tests__ tools/app-control/__tests__/actions.test.ts
npm run typecheck
```

Expected: PASS with no network calls because every EAS runner is fake.

- [ ] **Step 8: Commit the isolated EAS adapter**

```sh
git add frontend/tools/eas frontend/tools/app-control/actions.ts frontend/tools/tenant-add/eas
git commit -m "feat: add isolated tenant EAS project adapter"
```

---

### Task 6: Add recovery records and resumable `tenant:eas`

**Files:**

- Create: `frontend/tools/tenant-add/recovery.ts`
- Create: `frontend/tools/tenant-add/__tests__/recovery.test.ts`
- Create: `frontend/tools/tenant-add/easEditor.ts`
- Create: `frontend/tools/tenant-add/__tests__/easEditor.test.ts`
- Create: `frontend/tools/tenant-eas/prompts.ts`
- Create: `frontend/tools/tenant-eas/cli.ts`
- Create: `frontend/tools/tenant-eas/__tests__/cli.test.ts`
- Modify: `frontend/tools/tenant-add/renderTenantFiles.ts`
- Modify: `frontend/package.json`

**Interfaces:**

- Produces: `tenantRecoverySchema`, `writeTenantRecovery`, `readTenantRecovery`, `removeTenantRecovery`.
- Produces: `replaceTenantEasBlock(source, eas): string` restricted to generated markers.
- Produces: `runTenantEasCli(dependencies): Promise<number>`.
- Adds: `npm run tenant:eas -- --tenant <tenant-id>`.

- [ ] **Step 1: Write failing recovery and marker-editor tests**

Use an invocation-owned temporary `.tenant-add` root:

```ts
const recovery = {
  schemaVersion: 1,
  tenantId: "new-tenant",
  owner: "acme",
  slug: "new-tenant",
  projectId: "11111111-1111-4111-8111-111111111111",
  updateUrl: "https://u.expo.dev/11111111-1111-4111-8111-111111111111",
  createdAt: "2026-08-25T00:00:00.000Z",
};
await writeTenantRecovery(root, recovery);
expect(await readTenantRecovery(root, "new-tenant")).toEqual(recovery);
expect(JSON.stringify(recovery)).not.toMatch(/token|password|secret/iu);
```

Assert the EAS editor changes only text between `// tenant:eas:start` and
`// tenant:eas:end`, rejects missing/duplicate markers, and refuses a second linked update.

- [ ] **Step 2: Write failing resumable CLI tests**

Inject tenant lookup, prompt, EAS adapter, editor, preflight, filesystem, and output dependencies.
Cover Create, Link, cancel, unauthenticated, pending requirement, already-linked refusal, recovery
consumption, editor rollback, preflight failure, and no-secret output.

The success test must prove the stored linked state came from the verified adapter result:

```ts
expect(await runTenantEasCli(dependencies)).toBe(0);
expect(dependencies.replaceTenantEasBlock).toHaveBeenCalledWith(expect.any(String), {
  status: "linked",
  owner: "acme",
  projectId: "11111111-1111-4111-8111-111111111111",
  updateUrl: "https://u.expo.dev/11111111-1111-4111-8111-111111111111",
});
expect(dependencies.runFastPreflight).toHaveBeenCalledWith("new-tenant");
```

- [ ] **Step 3: Run focused tests and verify recovery/resume modules are missing**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__/recovery.test.ts tools/tenant-add/__tests__/easEditor.test.ts tools/tenant-eas/__tests__/cli.test.ts
```

Expected: FAIL because the modules and command do not exist.

- [ ] **Step 4: Implement the strict non-secret recovery store**

Use this exact schema:

```ts
export const tenantRecoverySchema = z
  .object({
    schemaVersion: z.literal(1),
    tenantId: tenantIdSchema,
    owner: tenantIdSchema,
    slug: tenantIdSchema,
    projectId: z.string().uuid(),
    updateUrl: z.string().url(),
    createdAt: z.string().datetime(),
  })
  .strict();
```

Resolve records only under `<frontend>/.tenant-add/recovery/<tenant-id>.json`, publish with a
same-directory temporary file plus rename, use mode `0o600` where supported, and schema-parse on
every read. Reject path traversal before filesystem access.

- [ ] **Step 5: Add stable EAS markers to generated tenant index files**

Render:

```ts
// tenant:eas:start
const tenantEas = { status: "pending" } satisfies TenantEasConfig;
// tenant:eas:end
```

`replaceTenantEasBlock` serializes linked state through the schema and replaces only the marked
constant. The tenant object uses `eas: tenantEas`.

- [ ] **Step 6: Implement `tenant:eas` orchestration**

Parse `--tenant`, require a repository tenant with pending EAS state, check recovery first, and
offer Create or Link. Before Create, display owner/slug and obtain the dedicated confirmation. On
success: edit `index.ts` transactionally, resolve all Expo environments, run fast preflight, remove
the recovery record, and print the first valid dry-run build command. Restore original index bytes
if post-edit validation fails.

Keep orchestration in one dependency-injected boundary:

```ts
export interface TenantEasCliDependencies {
  argv: string[];
  getTenant: typeof getTenant;
  collectSelection: (tenant: TenantConfig) => Promise<TenantEasSelection | null>;
  resolveProject: (
    tenant: TenantConfig,
    selection: TenantEasSelection
  ) => Promise<EasProjectIdentity>;
  readTenantIndex: (tenantId: string) => Promise<string>;
  writeTenantIndex: (tenantId: string, source: string) => Promise<void>;
  runFastPreflight: (tenantId: string) => Promise<void>;
  writeOutput: (value: string) => void;
}
```

- [ ] **Step 7: Add the package command and run focused verification**

Add:

```json
"tenant:eas": "tsx tools/tenant-eas/cli.ts"
```

Run:

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__/recovery.test.ts tools/tenant-add/__tests__/easEditor.test.ts tools/tenant-eas/__tests__/cli.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit recovery and resume support**

```sh
git add frontend/tools/tenant-add frontend/tools/tenant-eas frontend/package.json
git commit -m "feat: resume pending tenant EAS setup"
```

---

### Task 7: Integrate Create, Link, and Skip into transactional onboarding

**Files:**

- Modify: `frontend/tools/tenant-add/types.ts`
- Modify: `frontend/tools/tenant-add/prompts.ts`
- Modify: `frontend/tools/tenant-add/scaffold.ts`
- Modify: `frontend/tools/tenant-add/cli.ts`
- Create: `frontend/tools/tenant-add/__tests__/scaffold.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/cli.test.ts`
- Modify: `frontend/tools/tenant-add/__tests__/prompts.test.ts`
- Modify: `frontend/tools/tenant-add/registryEditor.ts`

**Interfaces:**

- Consumes: `TenantEasSelection`, `createEasProject`, and `verifyLinkedEasProject` from Task 5.
- Produces: dependency-injected `scaffoldTenant(input, dependencies)` with local validation before EAS calls.
- Produces: `runTenantAddCli(dependencies): Promise<number>` with dedicated external confirmation.

Define the orchestration boundary before implementing it:

```ts
export class TenantAddCancelledError extends Error {}

export interface TenantAddDependencies {
  collectEasSelection: (
    draft: TenantConfig,
    authenticatedUser?: string
  ) => Promise<TenantEasSelection | null>;
  confirmExternalCreate: (owner: string, slug: string) => Promise<boolean>;
  createEasProject: (request: EasProjectRequest) => Promise<EasProjectIdentity>;
  verifyLinkedEasProject: (projectId: string, expectedSlug: string) => Promise<EasProjectIdentity>;
  publishTenantTransaction: (input: PublishTenantTransactionInput) => Promise<void>;
  runFastPreflight: (tenantId: string) => Promise<void>;
  rollbackLocalJournal: (
    journal: TenantTransactionJournal,
    registryBefore: string | null
  ) => Promise<void>;
  writeTenantRecovery: (recoveryRoot: string, recovery: TenantRecovery) => Promise<void>;
  now: () => Date;
}
```

`PublishTenantTransactionInput` owns the staged tenant directory, staged asset directory, and
optional registry edit. `TenantTransactionJournal` records only paths and registry bytes created or
changed by this invocation. Import `TenantRecovery` from Task 6 rather than redefining its schema.

- [ ] **Step 1: Write failing prompt and orchestration-order tests**

Assert local mode selects Skip without an EAS prompt. Repository mode offers Create/Link/Skip after
theme/features, defaults Create owner to `whoami`, and confirms immediately before external Create.

Record dependency call order:

```ts
expect(calls).toEqual([
  "validate-input",
  "stage-files",
  "expand-theme",
  "generate-assets",
  "validate-assets",
  "resolve-pending-expo",
  "local-checks",
  "confirm-eas-create",
  "create-eas-project",
  "resolve-linked-expo",
  "publish",
  "fast-preflight",
]);
```

Assert no EAS dependency is called when validation/local checks fail or the confirmation is declined.

- [ ] **Step 2: Write failing rollback and remote-recovery tests**

Cover failures at staging, asset generation, local checks, EAS Create, linked resolution,
publication, registry update, and final preflight. For remote-success/local-failure:

```ts
await expect(scaffoldTenant(input, failingPublishDependencies)).rejects.toThrow(/publish/u);
expect(await readTenantRecovery(stagingRoot, input.answers.id)).toMatchObject({
  tenantId: input.answers.id,
  projectId: createdProject.projectId,
});
expect(remoteDelete).not.toHaveBeenCalled();
```

Pre-existing files/sentinels must remain byte-for-byte unchanged.

- [ ] **Step 3: Run focused tests and confirm the current scaffold order fails**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__/prompts.test.ts tools/tenant-add/__tests__/scaffold.test.ts tools/tenant-add/__tests__/cli.test.ts
```

Expected: FAIL because current onboarding requests owner/project UUID early and has no Create/Link/Skip orchestration.

- [ ] **Step 4: Define EAS selection and defer it until local validation succeeds**

The initial answer collection must not request a project UUID or owner. Scaffold validates and stages
the tenant with `eas: { status: "pending" }`; only after `localChecks` succeeds does the CLI collect
the EAS selection. This keeps invalid recipe/logo/identity attempts network-free.

Add the delayed selection dependency to the CLI boundary:

```ts
collectEasSelection: (draft: TenantConfig, authenticatedUser?: string) =>
  Promise<TenantEasSelection | null>;
```

- [ ] **Step 5: Implement explicit external confirmation and adapter calls**

For Create: run `whoami`, default owner to that username, show owner and slug, confirm, then call
`createEasProject`. For Link: confirm project ID then call `verifyLinkedEasProject`. For Skip: make no
EAS call. Convert successful results to linked EAS state and rerun all Expo environment resolution.

```ts
const toLinkedEas = (identity: EasProjectIdentity): TenantEasConfig => ({
  status: "linked",
  owner: identity.owner,
  projectId: identity.projectId,
  updateUrl: identity.updateUrl,
});

const resolveEasSelection = async (selection: TenantEasSelection) => {
  if (selection.kind === "skip") return { status: "pending" } as const;
  if (selection.kind === "link") {
    return toLinkedEas(await dependencies.verifyLinkedEasProject(selection.projectId, draft.slug));
  }
  const confirmed = await dependencies.confirmExternalCreate(selection.owner, draft.slug);
  if (!confirmed) throw new TenantAddCancelledError();
  return toLinkedEas(
    await dependencies.createEasProject({
      displayName: draft.displayName,
      slug: draft.slug,
      owner: selection.owner,
      sourceIcon: stagedSourceLogo,
    })
  );
};
```

- [ ] **Step 6: Implement staged publication and recovery boundaries**

Publish the three-file tenant directory, asset directory, and repository marker edit only after EAS
selection has resolved. Maintain an exact transaction journal. Before remote success, rollback all
invocation-created paths and registry bytes. After remote success, any local failure also writes the
recovery record and retains diagnosis staging; never invoke a delete command.

```ts
try {
  const eas = await resolveEasSelection(selection);
  if (eas.status === "linked") remoteIdentity = eas;
  await dependencies.publishTenantTransaction({
    stagedTenantDirectory,
    stagedAssetsDirectory,
    registryEdit,
  });
  await dependencies.runFastPreflight(draft.id);
} catch (error) {
  await dependencies.rollbackLocalJournal(transactionJournal, registryBefore);
  if (remoteIdentity) {
    await dependencies.writeTenantRecovery(recoveryRoot, {
      schemaVersion: 1,
      tenantId: draft.id,
      owner: remoteIdentity.owner,
      slug: draft.slug,
      projectId: remoteIdentity.projectId,
      updateUrl: remoteIdentity.updateUrl,
      createdAt: dependencies.now().toISOString(),
    });
  }
  throw error;
}
```

- [ ] **Step 7: Print concise success and pending guidance**

Success output includes theme source, logo source, tenant paths, identities, EAS state, validation
results, and launch command. Pending repository tenants print:

```text
EAS setup: pending
npm run tenant:eas -- --tenant <tenant-id>
```

Linked tenants print the owner/project ID and the first app-control dry-run build command. Do not
print environment values or raw EAS output.

- [ ] **Step 8: Run onboarding tests, full suite, and typecheck**

```sh
cd frontend
npm run test:unit -- tools/tenant-add/__tests__ tools/tenant-eas/__tests__
npm run test:unit
npm run typecheck
```

Expected: PASS with fake EAS runners only.

- [ ] **Step 9: Commit integrated onboarding**

```sh
git add frontend/tools/tenant-add frontend/tools/tenant-eas frontend/config/tenants/registry.ts
git commit -m "feat: add create link skip tenant onboarding"
```

---

### Task 8: Document and verify the simplified end-to-end journey

**Files:**

- Modify: `frontend/config/tenants/README.md`
- Modify: `frontend/docs/release-control.md`
- Modify: `Agents.md`
- Local ignored output: `frontend/config/tenants/.local/test-tenant/**`
- Local ignored output: `frontend/config/tenants/assets/.local/test-tenant/**`

**Interfaces:**

- Documents: presets, recipe JSON, overrides, folder layout, Expo owner, Create/Link/Skip, pending state, recovery, and resume.
- Verifies: Avihu preservation and a real ignored local test journey without any real EAS mutation.

- [ ] **Step 1: Update tenant and release documentation**

Add the version-1 JSON recipe example, preset list, file responsibilities, exact local/repository
commands, meaning of Expo owner, `eas login`, Create/Link/Skip, `tenant:eas`, pending release guards,
recovery path/content, and fallback-logo replacement warning. State that onboarding never creates
credentials, secrets, builds, updates, submissions, or store releases.

- [ ] **Step 2: Extend repository rules with evidenced repeated patterns**

In `Agents.md`, preserve section structure and add:

- tenant themes are authored through versioned recipes/presets and expanded into strict semantic
  runtime themes;
- tenant source responsibilities are `index.ts`, `theme.ts`, and `features.ts`;
- EAS initialization must use isolated workspaces and explicit external confirmation; and
- pending tenants cannot enter release/EAS actions.

- [ ] **Step 3: Format every file changed by this branch**

Build the changed-file list from `git diff --name-only f-multi-tenant-support...HEAD`, run Prettier
only on supported changed files, then rerun `--check` on that same list. Do not reformat unrelated
pre-existing files.

- [ ] **Step 4: Run full Avihu regression verification before regenerating local output**

```sh
cd frontend
npm run test:unit
npm run typecheck
npm run theme:audit
npm run assets:check -- --tenant avihu
APP_TENANT=avihu APP_ENV=production npx expo config --type public --json
```

Expected: all commands PASS and Avihu linked EAS identity, plugins, native identifiers, theme
snapshot, and asset hashes remain unchanged.

- [ ] **Step 5: Regenerate the ignored local test tenant through the preset flow**

Remove only the previously generated ignored `test-tenant` module/folder and matching local asset
folder, then run `npm run tenant:add`. Choose Local test, ID `test-tenant`, display name `Test
Tenant`, Violet / Amber preset, fallback logo, all JavaScript defaults, all compatible native
capabilities, forced RTL, and automatic EAS Skip.

Expected output:

```text
npm run app -- start --tenant test-tenant --environment development --yes
```

- [ ] **Step 6: Prove local folder discovery, ignored state, theme expansion, and Metro resolution**

```sh
cd frontend
git check-ignore -v config/tenants/.local/test-tenant/index.ts
git check-ignore -v config/tenants/.local/test-tenant/theme.ts
git check-ignore -v config/tenants/.local/test-tenant/features.ts
git check-ignore -v config/tenants/assets/.local/test-tenant/source/app-icon.png
APP_TENANT=test-tenant APP_ENV=development npx expo config --type public --json
APP_TENANT=test-tenant APP_ENV=development node -e 'const config=require("./metro.config.js"); console.log(config.resolver.extraNodeModules["tenant-assets"])'
npm run assets:check -- --tenant test-tenant
npm run preflight -- --tenant test-tenant --environment development
```

Expected: ignore rules match exact roots; config shows pending EAS with no fake project/update fields;
Metro resolves `.local/test-tenant/generated`; assets and fast preflight PASS.

- [ ] **Step 7: Prove pending/local release guards without child execution**

Run app-control dry-run probes for build and update plus direct release/EAS preflight probes. Expected:
each exits nonzero before its process runner and prints either the local-only rule or
`npm run tenant:eas -- --tenant <id>` remediation. Do not run a build, update, or release suite.

- [ ] **Step 8: Run final branch verification**

```sh
git diff --check f-multi-tenant-support...HEAD
cd frontend
npm run test:unit
npm run typecheck
npm run theme:audit
npm run assets:check -- --tenant avihu
npm run assets:check -- --tenant test-tenant
```

Expected: no whitespace errors; all commands PASS; `git status --short` contains no ignored local
tenant, staging, or recovery output.

- [ ] **Step 9: Commit documentation and request read-only review**

```sh
git add Agents.md frontend/config/tenants/README.md frontend/docs/release-control.md
git commit -m "docs: explain simplified tenant onboarding"
```

Use `superpowers:requesting-code-review`, address validated findings, rerun affected verification,
and leave the ignored `test-tenant` available for manual launch. Do not merge or push.
