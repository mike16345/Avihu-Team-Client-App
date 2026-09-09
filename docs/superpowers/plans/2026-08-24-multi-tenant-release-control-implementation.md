# Multi-Tenant Release Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tenant-aware control center, deterministic app-asset pipeline, layered release preflight, and Android production-readiness checks for the shared Expo application.

**Architecture:** A typed tenant registry is the source of all public brand and native identity configuration. A TypeScript CLI provides interactive and non-interactive actions, while a shared check engine powers local preflight, EAS hooks, and future CI. Expo Continuous Native Generation remains authoritative; ignored local `ios/` and `android/` folders are validated as disposable generated output.

**Tech Stack:** Expo SDK 53, TypeScript, Vitest, Zod, `tsx`, `@clack/prompts`, `sharp`, `fast-glob`, EAS Build lifecycle hooks, Android R8.

**Spec:** `docs/superpowers/specs/2026-08-24-multi-tenant-release-control-design.md`

## Global Constraints

- The first and only initially registered tenant ID is `avihu`.
- Every action requires deliberate tenant selection; no command silently defaults to Avihu.
- Tenant TypeScript files contain no secret values.
- Preview and production may share the Avihu store identity only through an explicit tenant declaration.
- `ios/` and `android/` remain ignored generated directories and are never made source-of-truth configuration.
- Asset cleanup deletes only proven-unused or stale generated files; ambiguous assets remain.
- Standard R8 and resource shrinking are enabled only for release builds; R8 full mode remains disabled.
- Portrait remains an accepted warning; large-screen support is not redesigned in this plan.
- No build, update, submission, credential change, or store mutation occurs without an explicit user action.
- Existing route names, API contracts, persisted keys, Hebrew copy, and RTL behavior remain unchanged.

---

### Task 1: Establish a deterministic, SDK-compatible tooling baseline

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/vitest.config.ts`
- Modify: `frontend/src/utils/__tests__/formPresets.test.ts`
- Modify: `frontend/src/utils/formPresets.ts`
- Modify: `frontend/src/components/DietPlanV2/__tests__/dietPlanV2Consumption.test.ts`

**Interfaces:**
- Produces: Node 20-compatible tooling dependencies and a unit suite that passes independently of the machine timezone.
- Produces: `getDateOccurrenceKey(date: Date | string): string` preserving the calendar portion of ISO date strings.
- Consumes: Existing Expo SDK 53 dependency validation.

- [ ] **Step 1: Confirm the existing failing calendar-date regression test**

Use the existing assertion in `formPresets.test.ts` as the regression contract:

```ts
expect(
  getOccurrenceKeyForForm({
    ...baseForm,
    showOn: "2026-06-03T00:00:00.000Z",
  })
).toBe("2026-06-03");
```

- [ ] **Step 2: Verify the regression under a west-of-UTC timezone**

Run:

```bash
TZ=America/New_York npx vitest run src/utils/__tests__/formPresets.test.ts
```

Expected: the existing test fails with `2026-06-02` before implementation.

- [ ] **Step 3: Preserve ISO calendar dates and retain Date-object local formatting**

Implement in `formPresets.ts`:

```ts
const ISO_CALENDAR_DATE = /^(\d{4}-\d{2}-\d{2})(?:T|$)/;

export const getDateOccurrenceKey = (date: Date | string) => {
  if (typeof date === "string") {
    const calendarDate = ISO_CALENDAR_DATE.exec(date)?.[1];
    if (calendarDate) return calendarDate;
  }

  return moment(date).format("YYYY-MM-DD");
};
```

- [ ] **Step 4: Make the 3 a.m. tests express local-time business semantics**

Replace UTC-string constructors in `dietPlanV2Consumption.test.ts` with local constructors:

```ts
expect(getDietPlanV2DayKey(new Date(2026, 7, 12, 2, 59))).toBe("2026-08-11");
expect(getDietPlanV2DayKey(new Date(2026, 7, 12, 3, 0))).toBe("2026-08-12");
expect(getMillisecondsUntilDietPlanV2DayChange(new Date(2026, 7, 12, 2, 59, 59))).toBe(1_000);
expect(getMillisecondsUntilDietPlanV2DayChange(new Date(2026, 7, 12, 3, 0, 1))).toBe(86_399_000);
```

- [ ] **Step 5: Verify timezone independence**

Run the complete unit suite twice:

```bash
TZ=UTC npm run test:unit
TZ=America/New_York npm run test:unit
```

Expected: both runs pass with 102 or more tests and zero failures.

- [ ] **Step 6: Align Expo packages and install control-system tooling**

Use Expo’s compatibility installer, remove the project-local EAS CLI, and add exact Node 20-compatible development dependencies:

```bash
npx expo install expo@~53.0.27 expo-constants@~17.1.8 expo-notifications@~0.31.5 expo-updates@~0.28.18 expo-build-properties@~0.14.8
npm uninstall eas-cli
npm install --save-dev @clack/prompts@1.7.0 fast-glob@3.3.3 sharp@0.35.3 tsx@4.23.12
```

- [ ] **Step 7: Allow Vitest to discover tooling tests**

Change `vitest.config.ts` so `test.dir` is `.` and the includes are:

```ts
include: [
  "src/**/__tests__/**/*.test.ts",
  "src/**/__tests__/**/*.test.tsx",
  "config/**/__tests__/**/*.test.ts",
  "tools/**/__tests__/**/*.test.ts",
],
```

- [ ] **Step 8: Verify the baseline health checks**

Run:

```bash
npm run typecheck
npm run test:unit
npx expo install --check
npx --yes expo-doctor@1.20.2
```

Expected: TypeScript, unit tests, and Expo package compatibility pass. Expo Doctor may still report the explicitly tracked native-library maintenance warnings; record their exact output for the policy task.

- [ ] **Step 9: Commit the baseline**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/utils/formPresets.ts frontend/src/utils/__tests__/formPresets.test.ts frontend/src/components/DietPlanV2/__tests__/dietPlanV2Consumption.test.ts
git commit -m "chore: stabilize release tooling baseline"
```

---

### Task 2: Add the typed tenant registry and pure Expo config resolver

**Files:**
- Create: `frontend/config/tenants/types.ts`
- Create: `frontend/config/tenants/schema.ts`
- Create: `frontend/config/tenants/avihu.ts`
- Create: `frontend/config/tenants/registry.ts`
- Create: `frontend/config/createExpoConfig.ts`
- Create: `frontend/config/__tests__/createExpoConfig.test.ts`
- Modify: `frontend/app.config.ts`
- Modify: `frontend/tsconfig.json`
- Modify: `frontend/src/services/apiKey.ts`
- Create: `frontend/src/services/__tests__/apiKey.test.ts`

**Interfaces:**
- Produces: `TenantConfig`, `TenantEnvironment`, `TenantFeatureFlags`.
- Produces: `getTenant(tenantId: string): TenantConfig` and `listTenants(): TenantConfig[]`.
- Produces: `createExpoConfig(input: CreateExpoConfigInput): ExpoConfig` as a pure function.
- Consumes: `APP_TENANT` and `APP_ENV` only at the thin `app.config.ts` boundary.

- [ ] **Step 1: Write failing registry and configuration tests**

Create tests that require:

```ts
expect(listTenants().map(({ id }) => id)).toEqual(["avihu"]);
expect(() => getTenant("missing")).toThrowError('Unknown tenant "missing"');

const development = createExpoConfig({
  baseConfig: {},
  tenant: getTenant("avihu"),
  environment: "development",
  processEnv: {},
});
expect(development.android?.package).toBe("com.avihuteam.avihuteam.dev");
expect(development.ios?.bundleIdentifier).toBe("com.avihuteam.avihuteam.dev");

const production = createExpoConfig({
  baseConfig: {},
  tenant: getTenant("avihu"),
  environment: "production",
  processEnv: {},
});
expect(production.android?.package).toBe("com.avihuteam.avihuteam");
expect(production.extra?.tenant).toMatchObject({ id: "avihu", environment: "production" });
expect(JSON.stringify(production.extra)).not.toContain("API_TOKEN");
```

- [ ] **Step 2: Verify the tenant tests fail because the modules do not exist**

Run:

```bash
npx vitest run config/__tests__/createExpoConfig.test.ts
```

Expected: failure resolving `createExpoConfig` or tenant registry modules.

- [ ] **Step 3: Define the tenant schema and derived types**

Use Zod to validate IDs, semantic app versions, identifiers, schemes, asset paths, permissions,
feature flags, required environment-variable names, and environment records. Define:

```ts
export const TENANT_ENVIRONMENTS = ["development", "preview", "production"] as const;
export type TenantEnvironment = (typeof TENANT_ENVIRONMENTS)[number];
export type TenantConfig = z.infer<typeof tenantConfigSchema>;
```

Environment identity records must include `iosBundleIdentifier`, `androidPackage`, and `scheme`.
The schema must reject embedded secret values and permit an explicit
`allowSharedStoreIdentity: true` for Avihu preview/production.

- [ ] **Step 4: Create the Avihu configuration**

Move the current app name, version `2.4.0`, slug, owner, project ID, update URL, Hebrew permission
copy, package IDs, scheme, portrait policy, Android SDK values, public feature flags, and required
environment-variable names into `avihu.ts`. Keep development identity suffixed `.dev`; declare the
current preview/production shared identity explicitly.

- [ ] **Step 5: Implement registry lookup and pure Expo config composition**

Create a fixed registry:

```ts
const tenantRegistry = tenantConfigSchema.array().parse([avihuTenant]);

export const listTenants = () => [...tenantRegistry];
export const getTenant = (tenantId: string) => {
  const tenant = tenantRegistry.find(({ id }) => id === tenantId);
  if (!tenant) throw new Error(`Unknown tenant "${tenantId}"`);
  return tenant;
};
```

Compose one `expo-build-properties` entry containing SDK and release-shrinking settings. Use tenant
asset paths for icon, adaptive icon, notification icon, and splash. Put only public tenant metadata
and feature flags in `extra.tenant`; retain existing non-secret runtime API configuration through a
separate explicit allowlist. Values required inside the shipped client are public-by-design and use
static `EXPO_PUBLIC_*` references; server-side secrets are rejected from Expo `extra`.

Update `apiKey.ts` to read `process.env.EXPO_PUBLIC_API_AUTH_TOKEN` through a small exported helper
in every environment instead of copying `API_KEY` into Expo `extra.API_TOKEN`. The test must prove a
missing client key fails clearly and a supplied public client key is returned without being logged.

- [ ] **Step 6: Reduce `app.config.ts` to environment resolution**

The boundary must reject absent or invalid `APP_TENANT` and derive `APP_ENV` from an explicit
`development | preview | production` value:

```ts
const tenantId = process.env.APP_TENANT;
if (!tenantId) throw new Error("APP_TENANT is required. Run `npm run app` to select a tenant.");

return createExpoConfig({
  baseConfig: config,
  tenant: getTenant(tenantId),
  environment: parseTenantEnvironment(process.env.APP_ENV),
  processEnv: process.env,
});
```

- [ ] **Step 7: Verify all tenant configuration snapshots**

Run:

```bash
npx vitest run config/__tests__/createExpoConfig.test.ts
APP_TENANT=avihu APP_ENV=development npx expo config --type public --json
APP_TENANT=avihu APP_ENV=preview npx expo config --type public --json
APP_TENANT=avihu APP_ENV=production npx expo config --type public --json
```

Expected: tests pass; each Expo config resolves the intended identity; output contains no private
token values.

- [ ] **Step 8: Commit the tenant foundation**

```bash
git add frontend/config frontend/app.config.ts frontend/tsconfig.json
git commit -m "feat: add typed tenant configuration"
```

---

### Task 3: Build the safe interactive and non-interactive control center

**Files:**
- Create: `frontend/tools/app-control/types.ts`
- Create: `frontend/tools/app-control/arguments.ts`
- Create: `frontend/tools/app-control/actions.ts`
- Create: `frontend/tools/app-control/prompts.ts`
- Create: `frontend/tools/app-control/processRunner.ts`
- Create: `frontend/tools/app-control/cli.ts`
- Create: `frontend/tools/app-control/__tests__/arguments.test.ts`
- Create: `frontend/tools/app-control/__tests__/actions.test.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `parseAppArguments(argv: string[]): ParsedAppArguments`.
- Produces: `resolveAction(selection: AppSelection): CommandSpec`.
- Produces: `runCommand(spec: CommandSpec): Promise<number>`.
- Consumes: tenant registry and later invokes preflight/asset commands through stable action names.

- [ ] **Step 1: Write failing non-interactive safety tests**

Cover these behaviors:

```ts
expect(() => parseAppArguments(["build", "android", "--profile", "production", "--yes"]))
  .toThrowError("--tenant is required in non-interactive mode");

expect(parseAppArguments([
  "build", "android", "--tenant", "avihu", "--profile", "production", "--yes",
])).toMatchObject({
  action: "build",
  platform: "android",
  tenantId: "avihu",
  environment: "production",
  confirmed: true,
});
```

Also assert that an unknown tenant, unsupported action/platform pair, or `--yes` with incomplete
arguments fails before process execution.

- [ ] **Step 2: Verify the CLI tests fail because the parser is missing**

Run:

```bash
npx vitest run tools/app-control/__tests__/arguments.test.ts
```

Expected: module-resolution failure.

- [ ] **Step 3: Implement pure argument and action resolution**

Use `node:util.parseArgs` for flags and positional arguments. Model actions as a discriminated union.
Return command specs as argument arrays, never shell strings:

```ts
export interface CommandSpec {
  command: string;
  args: string[];
  env: Record<string, string>;
  label: string;
}
```

Pin EAS invocation to `npx --yes eas-cli@16.27.0` in one exported constant. Include `APP_TENANT`
and `APP_ENV` in every child environment.

- [ ] **Step 4: Implement the Clack selector and confirmation**

Use `@clack/prompts` for tenant, action, platform, and environment/profile selection. Print a boxed
summary containing tenant name, action, environment, platform, package/bundle identity, and the
equivalent non-interactive command. Cancellation exits zero without running a child process.

- [ ] **Step 5: Implement process execution without shell interpolation**

Use `spawn(command, args, { stdio: "inherit", env: { ...process.env, ...spec.env } })`. Preserve
signals and child exit codes. Never log environment values.

- [ ] **Step 6: Wire the friendly entry point**

Add:

```json
"app": "tsx tools/app-control/cli.ts"
```

Keep legacy scripts temporarily, but have the documentation mark `npm run app` as authoritative.

- [ ] **Step 7: Verify selector and dry-run behavior**

Add `--dry-run` support and run:

```bash
npm run app -- preflight --tenant avihu --environment development --yes --dry-run
npm run app -- build android --tenant avihu --profile production --yes --dry-run
```

Expected: both print correct commands and identities without invoking Expo or EAS. Running a
non-interactive command without `--tenant` exits non-zero with one remediation line.

- [ ] **Step 8: Commit the control center**

```bash
git add frontend/tools/app-control frontend/package.json frontend/package-lock.json
git commit -m "feat: add tenant app control center"
```

---

### Task 4: Implement the preflight result engine and release policy

**Files:**
- Create: `frontend/tools/preflight/types.ts`
- Create: `frontend/tools/preflight/policy.ts`
- Create: `frontend/tools/preflight/engine.ts`
- Create: `frontend/tools/preflight/renderHuman.ts`
- Create: `frontend/tools/preflight/renderJson.ts`
- Create: `frontend/tools/preflight/release-policy.json`
- Create: `frontend/tools/preflight/__tests__/engine.test.ts`
- Create: `frontend/tools/preflight/__tests__/policy.test.ts`

**Interfaces:**
- Produces: `CheckResult`, `CheckDefinition`, `PreflightReport`, `runChecks`, and `applyPolicy`.
- Produces: stable statuses `pass | warn | fail` and process exit code `0 | 1`.
- Consumes: no Expo or filesystem implementation details in the engine itself.

- [ ] **Step 1: Write failing result aggregation tests**

Require that:

```ts
const report = await runChecks([
  async () => ({ status: "pass", check: "one", summary: "ok" }),
  async () => ({ status: "fail", check: "two", summary: "broken", remediation: "Fix two" }),
]);
expect(report.counts).toEqual({ pass: 1, warn: 0, fail: 1 });
expect(report.exitCode).toBe(1);
```

Test deterministic ordering even when checks resolve concurrently. Test policy promotion,
acknowledged warnings, expired acknowledgement failure, and JSON serialization without ANSI.

- [ ] **Step 2: Verify engine tests fail because the engine is absent**

Run:

```bash
npx vitest run tools/preflight/__tests__/engine.test.ts tools/preflight/__tests__/policy.test.ts
```

Expected: missing-module failures.

- [ ] **Step 3: Implement the engine and renderers**

Each check receives immutable context and returns exactly one `CheckResult`. Catch unexpected check
exceptions and convert them to failures with the check ID. The human renderer groups PASS, WARN,
and FAIL and prints remediation only for non-pass results. JSON output includes schema version,
tenant, environment, timestamp, counts, results, and exit code.

- [ ] **Step 4: Encode current policy explicitly**

Create entries for:

- `android.large-screen-adaptability`: acknowledged warning with reason “Phone-first portrait product; maintain usability when Android overrides restrictions.” Review on `2027-01-15`.
- `dependencies.native-maintenance`: warning listing Health and wheel-picker ownership.
- Tenant selection, identity drift, tests, Expo compatibility, assets, R8, and edge-to-edge: failure for release mode.

Do not suppress results; policy changes severity while preserving evidence in reports.

- [ ] **Step 5: Verify engine behavior**

Run:

```bash
npx vitest run tools/preflight/__tests__/engine.test.ts tools/preflight/__tests__/policy.test.ts
```

Expected: all engine and policy tests pass.

- [ ] **Step 6: Commit the engine**

```bash
git add frontend/tools/preflight
git commit -m "feat: add release preflight engine"
```

---

### Task 5: Add tenant, environment, Expo, and generated-native checks

**Files:**
- Create: `frontend/tools/preflight/checks/tenantConfig.ts`
- Create: `frontend/tools/preflight/checks/environment.ts`
- Create: `frontend/tools/preflight/checks/expoConfig.ts`
- Create: `frontend/tools/preflight/checks/nativeDrift.ts`
- Create: `frontend/tools/preflight/__tests__/configurationChecks.test.ts`
- Create: `frontend/tools/preflight/contexts.ts`

**Interfaces:**
- Produces: `createPreflightContext(options): Promise<PreflightContext>`.
- Produces check IDs `tenant.config`, `tenant.environment`, `expo.config`, and `native.drift`.
- Consumes: tenant registry and pure Expo config resolver from Task 2.

- [ ] **Step 1: Write fixture-driven failing checks**

Use temporary directories to assert:

- Missing required environment names are reported without values.
- Preview/production shared identity passes only because Avihu declares it.
- Duplicate plugin names fail.
- A local Android `gradle.properties` target SDK differing from resolved config fails.
- Missing ignored native folders pass with “clean generation required” details.

- [ ] **Step 2: Verify configuration-check tests fail**

Run:

```bash
npx vitest run tools/preflight/__tests__/configurationChecks.test.ts
```

Expected: missing check implementations.

- [ ] **Step 3: Implement checks using structured config wherever possible**

Call the pure config resolver directly for tenant checks. Read generated Gradle properties,
Android manifest, Android styles, iOS project settings, and Info.plist only when those local folders
exist. Compare package ID, bundle ID, target SDK, compile SDK, edge-to-edge, orientation, R8 flags,
and configured asset references.

- [ ] **Step 4: Verify no secret leakage**

Add a test environment containing `EXPO_PUBLIC_API_AUTH_TOKEN=super-secret-value` and assert that
neither the human nor JSON report contains `super-secret-value`.

- [ ] **Step 5: Run the check tests**

```bash
npx vitest run tools/preflight/__tests__/configurationChecks.test.ts
```

Expected: all pass.

- [ ] **Step 6: Commit configuration checks**

```bash
git add frontend/tools/preflight frontend/config
git commit -m "feat: validate tenant and native configuration"
```

---

### Task 6: Add deterministic tenant asset generation and validation

**Files:**
- Add binary source: `frontend/config/tenants/assets/avihu/source/app-icon.png`
- Create: `frontend/tools/assets/types.ts`
- Create: `frontend/tools/assets/paths.ts`
- Create: `frontend/tools/assets/generate.ts`
- Create: `frontend/tools/assets/validate.ts`
- Create: `frontend/tools/assets/cli.ts`
- Create: `frontend/tools/assets/__tests__/generate.test.ts`
- Create: `frontend/tools/assets/__tests__/validate.test.ts`
- Modify: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/metro.config.js`
- Modify: `frontend/tsconfig.json`
- Modify: `frontend/src/screens/SplashScreen.tsx`
- Modify: `frontend/src/components/Login/Login.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/steps/HealthOnboardingCard.tsx`
- Modify: `frontend/src/components/Icon/AppIcon.tsx`
- Modify: `frontend/src/components/chat/ChatHeader.tsx`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `generateTenantAssets(tenantId: string): Promise<AssetManifest>`.
- Produces: `validateTenantAssets(tenantId: string): Promise<CheckResult[]>`.
- Produces generated paths for Apple icon, Android legacy/adaptive inputs, notification icon, splash, previews, and `manifest.json`.
- Consumes: `/Users/michael/Downloads/לוגו מותג אפליקציה .png` once as Avihu source artwork.

- [ ] **Step 1: Write failing image-constraint tests with generated fixtures**

Use Sharp-created temporary fixtures to assert:

- Apple output is 1024×1024 RGB/RGBA with no alpha channel.
- Adaptive foreground is square, has transparency, and fits the configured safe-zone ratio.
- Notification output has alpha, uses only transparent/opaque white pixels, and contains visible pixels.
- Manifest hashes change when source bytes change.
- Generation from identical input is byte/metadata deterministic.

- [ ] **Step 2: Verify asset tests fail because generation is absent**

Run:

```bash
npx vitest run tools/assets/__tests__/generate.test.ts tools/assets/__tests__/validate.test.ts
```

Expected: missing-module failures.

- [ ] **Step 3: Import the supplied source artwork without altering it**

Copy the exact 2000×2000 RGBA source bytes to the tenant source folder and record its SHA-256 in
the first generated manifest. Do not overwrite or modify the Downloads copy.

- [ ] **Step 4: Implement deterministic platform transformations**

Use Sharp with explicit dimensions, fit modes, background colors, color space, and metadata
stripping. Apple output flattens alpha onto the tenant background. Android adaptive output centers
the full supplied artwork inside the adaptive safe region with transparent outside and a separate
white background. Notification output derives a white alpha mask from non-background artwork
pixels. Previews apply masks only for inspection and are never referenced by Expo config.

- [ ] **Step 5: Write the generated manifest atomically**

Manifest schema includes generator version `1`, tenant ID, source SHA-256, each output’s SHA-256,
dimensions, alpha state, color space, and relative path. Generate into a temporary directory and
rename only after every output validates.

- [ ] **Step 6: Wire tenant configuration and package scripts**

Add:

```json
"assets:generate": "tsx tools/assets/cli.ts generate",
"assets:check": "tsx tools/assets/cli.ts check"
```

Point Avihu Expo icon, adaptive foreground/background, splash, and notification configuration at
generated tenant assets. Configure Metro’s `extraNodeModules` to map the virtual `tenant-assets`
module to `config/tenants/assets/<APP_TENANT>/generated` and fail clearly when `APP_TENANT` is absent
or the directory does not exist. Add the corresponding TypeScript path for asset-module typing.
Replace shared-code imports of `@assets/app-logo.png` and `@assets/app-icon.png` with
`tenant-assets/runtime-logo.png` so a binary includes only the selected tenant’s runtime branding.

- [ ] **Step 7: Generate and inspect Avihu outputs**

Run:

```bash
npm run assets:generate -- --tenant avihu
npm run assets:check -- --tenant avihu
```

Expected: validation passes. Open Apple, Android circle/squircle, and notification previews and
confirm the source design is intact, centered, and not clipped.

- [ ] **Step 8: Commit source, generator, and generated assets**

```bash
git add frontend/config/tenants frontend/tools/assets frontend/package.json frontend/package-lock.json
git commit -m "feat: generate tenant app assets"
```

---

### Task 7: Implement conservative unused-asset auditing and cleanup

**Files:**
- Create: `frontend/tools/assets/references.ts`
- Create: `frontend/tools/assets/audit.ts`
- Create: `frontend/tools/assets/allowlist.ts`
- Create: `frontend/tools/assets/__tests__/audit.test.ts`
- Modify: `frontend/tools/assets/cli.ts`
- Modify: `frontend/package.json`
- Delete: only files classified as proven unused by the completed audit

**Interfaces:**
- Produces: `auditAssets(options): Promise<AssetAuditReport>`.
- Produces classifications `used | stale-generated | proven-unused | ambiguous`.
- Consumes: TS/JS imports, static requires, Expo/tenant configuration, plugin/native-template references, font loaders, and explicit allowlist patterns.

- [ ] **Step 1: Write failing fixture tests for safe classification**

Create fixtures covering alias imports, relative imports, static `require`, tenant config paths,
generated-manifest outputs, dynamic string construction, and ignored build directories. Assert that
dynamic candidates are ambiguous, not unused, and that cleanup removes only stale-generated and
proven-unused files.

- [ ] **Step 2: Verify audit tests fail because the auditor is absent**

Run:

```bash
npx vitest run tools/assets/__tests__/audit.test.ts
```

Expected: missing-module failure.

- [ ] **Step 3: Implement reference collection and classification**

Use `fast-glob` with explicit source roots and exclusions. Parse import/require text conservatively;
when an expression cannot resolve statically, match its stable directory prefix and classify
potential targets ambiguous. Treat tenant source artwork and active generated-manifest outputs as
used.

- [ ] **Step 4: Add report-only and confirmed cleanup modes**

Expose:

```text
npm run assets:audit -- --tenant avihu
npm run assets:audit -- --tenant avihu --clean
npm run assets:audit -- --tenant avihu --clean --yes
```

Interactive `--clean` displays exact paths and asks for confirmation. Non-interactive cleanup
requires `--yes`. Reject paths outside approved asset roots after resolving real paths.

- [ ] **Step 5: Audit the real repository and verify every deletion candidate**

Run report-only mode, then corroborate each proposed deletion with `rg`, Expo config, tenant config,
font loading, and generated manifests. Add justified dynamic paths to `allowlist.ts`; never add an
allowlist entry merely to silence an unexplained result.

- [ ] **Step 6: Remove proven-unused assets**

Run confirmed cleanup only after the report contains no unexplained candidate. Review `git diff
--stat` and ensure no source file outside approved asset roots changed.

- [ ] **Step 7: Verify app references and asset checks**

Run:

```bash
npm run assets:check -- --tenant avihu
npm run typecheck
npm run test:unit
```

Expected: all pass after cleanup.

- [ ] **Step 8: Commit the auditor and recoverable deletions**

```bash
git add -A frontend/assets frontend/config/tenants/assets frontend/tools/assets frontend/package.json
git commit -m "chore: audit and remove unused app assets"
```

---

### Task 8: Compose fast and release preflight commands

**Files:**
- Create: `frontend/tools/preflight/processCheck.ts`
- Create: `frontend/tools/preflight/checks/projectHealth.ts`
- Create: `frontend/tools/preflight/checks/assets.ts`
- Create: `frontend/tools/preflight/checks/androidRelease.ts`
- Create: `frontend/tools/preflight/checks/iosRelease.ts`
- Create: `frontend/tools/preflight/checks/artifacts.ts`
- Create: `frontend/tools/preflight/suites.ts`
- Create: `frontend/tools/preflight/cli.ts`
- Create: `frontend/tools/preflight/__tests__/suites.test.ts`
- Modify: `frontend/tools/app-control/actions.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `createFastSuite(context)` and `createReleaseSuite(context)`.
- Produces commands `preflight`, `preflight:release`, and `preflight:eas`.
- Consumes: check engine, configuration checks, asset validation, and injected subprocess runner.

- [ ] **Step 1: Write failing suite-composition tests**

Assert that fast mode includes tenant, environment, TypeScript, unit tests, Expo Doctor, Expo
install check, assets, Expo config, native drift, Android policy, and iOS policy. Assert release mode
is a strict superset and includes clean prebuild, Android lint/bundle, JS export analysis, iOS
validation on macOS, artifact mappings, and optional smoke infrastructure.

- [ ] **Step 2: Verify suite tests fail**

Run:

```bash
npx vitest run tools/preflight/__tests__/suites.test.ts
```

Expected: missing suite implementation.

- [ ] **Step 3: Implement subprocess checks with dependency injection**

Process checks accept a runner so tests return controlled stdout, stderr, and exit status. Production
uses argument-array spawning. Convert non-zero commands into check failures with short captured
evidence and exact remediation; do not dump environment values.

- [ ] **Step 4: Implement fast checks**

Use the project’s existing scripts plus the centrally pinned Doctor version:

```text
npx --yes expo-doctor@1.20.2
npx expo install --check
```

Parse only stable evidence needed for the report. Preserve full logs in a timestamped ignored
`.preflight/` directory and print its path on failure.

- [ ] **Step 5: Implement release-only platform checks**

Release mode generates native projects cleanly for the selected tenant, runs Android release lint
and bundle assembly, validates the AAB with available Android SDK tools, records AAB/mapping sizes,
exports production JavaScript with source maps, and performs iOS project/config checks on macOS.
When an optional SDK tool is absent, return a warning with the exact install instruction.

- [ ] **Step 6: Add scripts and app-control actions**

Add:

```json
"preflight": "tsx tools/preflight/cli.ts fast",
"preflight:release": "tsx tools/preflight/cli.ts release",
"preflight:eas": "tsx tools/preflight/cli.ts eas --json .preflight/eas-report.json"
```

Ensure `npm run app` maps its preflight actions to these same scripts.

- [ ] **Step 7: Run fast preflight in human and JSON modes**

```bash
npm run preflight -- --tenant avihu --environment development
npm run preflight -- --tenant avihu --environment development --json .preflight/report.json
```

Expected: human output is concise; JSON parses; both return the same counts and exit code.

- [ ] **Step 8: Commit the composed preflight**

```bash
git add frontend/tools/preflight frontend/tools/app-control frontend/package.json frontend/package-lock.json frontend/.gitignore
git commit -m "feat: add layered app release preflight"
```

---

### Task 9: Wire EAS safely without duplicating tenant logic

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/eas.json`
- Modify: `frontend/tools/app-control/actions.ts`
- Create: `frontend/config/tenants/README.md`
- Create: `frontend/docs/release-control.md`

**Interfaces:**
- Produces: EAS post-install validation through `eas-build-post-install`.
- Produces: documented external requirement that each tenant’s EAS project defines `APP_TENANT` in development, preview, and production environments.
- Consumes: the same non-interactive preflight and tenant config used locally.

- [ ] **Step 1: Add an action test for EAS environment propagation**

Assert that an Avihu production build resolves to an argument array equivalent to:

```text
npx --yes eas-cli@16.27.0 build --platform android --profile production
```

and child environment contains `APP_TENANT=avihu` and `APP_ENV=production`.

- [ ] **Step 2: Verify the new action test fails before integration**

Run:

```bash
npx vitest run tools/app-control/__tests__/actions.test.ts
```

Expected: the EAS build action lacks the required environment contract.

- [ ] **Step 3: Add the EAS lifecycle hook**

Add to package scripts:

```json
"eas-build-post-install": "npm run preflight:eas"
```

`preflight:eas` must not recursively launch EAS or require interactive input. It validates the
selected tenant, environment, dependencies, config, assets, typecheck, and tests before native
compilation.

Set non-secret `APP_ENV` values directly in the matching `eas.json` profiles: `development`,
`preview`, and `production`. `APP_TENANT` remains scoped to each tenant’s EAS project environment so
the same shared profiles work for future projects.

- [ ] **Step 4: Document tenant EAS setup without mutating external projects**

Document exact symbolic environment names each project needs, how to set `APP_TENANT`, how to run
the selector, how preview/production identity sharing is declared, and how to verify with `eas env:list`.
Do not create or modify EAS environment values during implementation.

- [ ] **Step 5: Verify EAS configuration locally**

Run dry-run control-center commands for Android and iOS preview/production. Resolve Expo config for
each Avihu environment and confirm EAS project ID, bundle ID, package name, and update URL.

- [ ] **Step 6: Commit EAS integration and operator docs**

```bash
git add frontend/package.json frontend/eas.json frontend/tools/app-control frontend/config/tenants/README.md frontend/docs/release-control.md
git commit -m "chore: wire tenant preflight into EAS"
```

---

### Task 10: Enable and verify standard Android R8/resource shrinking

**Files:**
- Modify: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/config/createExpoConfig.ts`
- Modify: `frontend/config/__tests__/createExpoConfig.test.ts`
- Modify: `frontend/tools/preflight/checks/androidRelease.ts`
- Modify: `frontend/tools/preflight/__tests__/configurationChecks.test.ts`
- Modify: `frontend/docs/release-control.md`

**Interfaces:**
- Produces release Expo build properties `enableProguardInReleaseBuilds: true` and `enableShrinkResourcesInReleaseBuilds: true`.
- Produces R8 mapping-file and artifact-size checks.
- Consumes: Expo build-properties `~0.14.8` and clean native generation.

- [ ] **Step 1: Add failing release-optimization tests**

Require production/preview Expo config to contain one build-properties plugin with:

```ts
{
  android: {
    compileSdkVersion: 36,
    targetSdkVersion: 36,
    minSdkVersion: 26,
    enableProguardInReleaseBuilds: true,
    enableShrinkResourcesInReleaseBuilds: true,
  },
}
```

Require development config to keep release optimization settings harmless to debug builds. Add a
generated-Gradle fixture where either flag is false and assert a release preflight failure.

- [ ] **Step 2: Verify R8 tests fail before configuration change**

Run:

```bash
npx vitest run config/__tests__/createExpoConfig.test.ts tools/preflight/__tests__/configurationChecks.test.ts
```

Expected: missing or false release optimization assertions fail.

- [ ] **Step 3: Enable standard R8 and resource shrinking**

Set the two supported Expo build-properties flags. Do not add `android.enableR8.fullMode`, broad
keep rules, or `-dontobfuscate`.

- [ ] **Step 4: Generate Android cleanly and inspect effective flags**

Run selected-tenant prebuild into the ignored native directory. Verify generated
`android/gradle.properties` and `android/app/build.gradle` enable R8 and resource shrinking only for
release.

- [ ] **Step 5: Build a release AAB and retain diagnostics**

Run the full Android release check. Confirm AAB exists, R8 `mapping.txt` exists, and the report
records sizes. If a native integration fails under R8, reproduce it, add the narrowest keep rule,
and document the affected library and rule rationale before rebuilding.

- [ ] **Step 6: Smoke-test R8-sensitive integrations**

On an available device/emulator, exercise startup/login, scanner, Health Connect, notification
registration, background task registration, diet history, PDF, signature, and update startup.
Record unavailable credential/personal-data flows as manual release checklist items, not false passes.

- [ ] **Step 7: Commit verified R8 configuration**

```bash
git add frontend/config frontend/tools/preflight frontend/docs/release-control.md
git commit -m "perf: enable Android release shrinking"
```

---

### Task 11: Migrate Android edge-to-edge handling without redesigning screens

**Files:**
- Modify: `frontend/src/styles/useSpacingStyles.tsx`
- Modify: `frontend/src/components/WorkoutPlan/RecordExercise/WheelSetInput.tsx`
- Modify: `frontend/config/createExpoConfig.ts`
- Modify: `frontend/config/__tests__/createExpoConfig.test.ts`
- Modify: `frontend/tools/preflight/checks/androidRelease.ts`
- Modify: `frontend/tools/preflight/__tests__/configurationChecks.test.ts`
- Create: `frontend/src/utils/__tests__/safeAreaSpacing.test.ts`
- Create: `frontend/src/utils/safeAreaSpacing.ts`

**Interfaces:**
- Produces: `getSafeAreaPadding(insets, minimumBottom): { paddingTop: number; paddingBottom: number }`.
- Consumes: `react-native-safe-area-context` from the existing root provider.
- Removes: layout dependence on `StatusBar.currentHeight` and fixed iOS top-bar height.

- [ ] **Step 1: Write failing safe-area calculation tests**

Require:

```ts
expect(getSafeAreaPadding({ top: 47, bottom: 34 }, 24)).toEqual({
  paddingTop: 47,
  paddingBottom: 34,
});
expect(getSafeAreaPadding({ top: 24, bottom: 0 }, 24)).toEqual({
  paddingTop: 24,
  paddingBottom: 24,
});
```

- [ ] **Step 2: Verify safe-area tests fail because the helper is absent**

Run:

```bash
npx vitest run src/utils/__tests__/safeAreaSpacing.test.ts
```

Expected: missing-module failure.

- [ ] **Step 3: Implement pure padding calculation and use live insets**

Implement the pure helper using `Math.max`. In `useSpacingStyles`, call `useSafeAreaInsets()` and
replace fixed `pdStatusBar`/`pdBottomBar` values with the helper results. Keep the existing style
names so all consumers migrate without route or layout API churn.

- [ ] **Step 4: Remove the remaining direct status-bar calculation**

Update `WheelSetInput.tsx` to use safe-area insets and named constants. Search again:

```bash
rg -n "StatusBar\.currentHeight|windowOptOutEdgeToEdgeEnforcement|statusBarColor" src app.config.ts
```

Expected: no application-controlled manual status-bar height or Android opt-out remains.

- [ ] **Step 5: Enable Expo edge-to-edge and strengthen checks**

Set `android.edgeToEdgeEnabled: true` in resolved Expo config. Add tests that fail release preflight
when generated Gradle properties opt out, styles contain `windowOptOutEdgeToEdgeEnforcement`, or
app source uses `StatusBar.currentHeight`.

- [ ] **Step 6: Verify clean generated native configuration**

Regenerate Android and confirm `expo.edgeToEdgeEnabled=true`, absence of the opt-out style, and no
fixed status-bar color. Run TypeScript, unit tests, and Android lint.

- [ ] **Step 7: Perform focused visual regression checks**

Test Android 15/16 with gesture and three-button navigation across headers, bottom tabs, modals,
scrolling diet/workout/article/agreement screens, barcode camera, display cutout, and keyboard forms.
Check for content overlap and double padding. Fix only affected inset ownership; do not redesign.

- [ ] **Step 8: Commit edge-to-edge migration**

```bash
git add frontend/src/styles/useSpacingStyles.tsx frontend/src/components/WorkoutPlan/RecordExercise/WheelSetInput.tsx frontend/src/utils frontend/config frontend/tools/preflight
git commit -m "fix: migrate Android layouts to edge-to-edge"
```

---

### Task 12: Add the development tenant badge and finish operator documentation

**Files:**
- Create: `frontend/src/config/runtimeTenant.ts`
- Create: `frontend/src/config/__tests__/runtimeTenant.test.ts`
- Create: `frontend/src/components/dev/TenantEnvironmentBadge.tsx`
- Modify: `frontend/App.tsx`
- Modify: `frontend/config/createExpoConfig.ts`
- Modify: `frontend/docs/release-control.md`
- Modify: `frontend/README.md`
- Modify: `Agents.md` only if the tenant pattern is now evidenced in 3 or more consumers

**Interfaces:**
- Produces: `getRuntimeTenant(constants): PublicTenantRuntimeConfig` with strict validation.
- Produces: `TenantEnvironmentBadge` visible only for development/internal-preview binary config.
- Consumes: public `extra.tenant` snapshot from Task 2.

- [ ] **Step 1: Write failing runtime-config visibility tests**

Assert valid parsing and rejection of missing tenant metadata. Assert badge visibility is true only
when binary configuration explicitly carries `showEnvironmentBadge: true`; production config must
set it false regardless of process environment.

- [ ] **Step 2: Verify runtime tests fail because the helper is absent**

Run:

```bash
npx vitest run src/config/__tests__/runtimeTenant.test.ts
```

Expected: missing-module failure.

- [ ] **Step 3: Implement runtime config and unobtrusive badge**

Parse only tenant ID, display name, environment, brand colors, feature flags, and badge flag. Render
a small pointer-events-none badge above app content with safe-area positioning and shared text/theme
primitives. Do not render it when the production binary config disables it.

- [ ] **Step 4: Complete operator documentation**

Document:

- Starting and running a tenant
- Fast versus release preflight
- Preview and production build confirmation
- Tenant onboarding checklist
- Asset source replacement, regeneration, validation, and cleanup
- EAS secret/environment setup
- Interpreting warnings versus failures
- R8 mapping and artifact locations
- Edge-to-edge and device smoke checklist
- Recovery from stale generated native folders

- [ ] **Step 5: Run the full local verification matrix**

Run:

```bash
npm run typecheck
TZ=UTC npm run test:unit
TZ=America/New_York npm run test:unit
npx expo install --check
npx --yes expo-doctor@1.20.2
npm run assets:check -- --tenant avihu
npm run preflight -- --tenant avihu --environment development
npm run app -- build android --tenant avihu --profile production --yes --dry-run
npm run app -- build ios --tenant avihu --profile production --yes --dry-run
```

Expected: all blocking checks pass. Remaining native-maintenance and portrait/large-screen findings
appear only as documented warnings.

- [ ] **Step 6: Run full release validation where local platform tooling permits**

Run the full Avihu Android production preflight and macOS iOS validation. Record any device-only
manual checks accurately; do not mark unavailable checks as passes.

- [ ] **Step 7: Review final scope and commit**

Inspect `git diff`, confirm no secret values or unrelated user files entered the changes, confirm
only audit-proven assets were deleted, then commit:

```bash
git add frontend/src/config frontend/src/components/dev frontend/App.tsx frontend/docs frontend/README.md Agents.md
git commit -m "docs: finalize tenant release operations"
```
