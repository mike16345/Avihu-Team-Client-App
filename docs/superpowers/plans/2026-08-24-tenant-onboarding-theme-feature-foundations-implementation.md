# Tenant Onboarding, Theme, and Feature Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe end-to-end tenant onboarding command and move white-label identity, semantic theme values, JavaScript feature defaults, and native capabilities into the validated tenant contract without changing Avihu behavior.

**Architecture:** Extend the existing tenant registry and Expo snapshot instead of adding a parallel configuration path. Repository tenants remain committed TypeScript modules; local tenants are discovered from ignored TypeScript modules by Node-only tooling. Runtime UI receives a strict public snapshot, while onboarding composes small validation, logo, scaffold, registry-edit, and verification units around the existing asset and preflight systems.

**Tech Stack:** Expo 53, React Native 0.79, TypeScript 5.8 strict mode, Zod 3, Vitest 3, Sharp 0.35, `@clack/prompts`, existing app-control/assets/preflight tools.

**Spec:** `docs/superpowers/specs/2026-08-24-tenant-onboarding-theme-feature-foundations-design.md`

## Global Constraints

- Start from branch `codex/tenant-onboarding-foundations`, whose parent is verified `f-multi-tenant-support` containing merge `73a721b` and release-control tip `616bc5d`.
- Preserve every existing Avihu route, query key, API endpoint, store key, Hebrew string, RTL behavior, native identifier, plugin, permission, and visible color.
- Keep every Avihu JavaScript feature default enabled; do not gate screens or navigation in this change.
- Do not implement a backend, remote-config client, React Query entitlement hook, or entitlement provider.
- Never let JavaScript entitlement overrides enable a native capability absent from the binary.
- Repository tenants are reviewable Git changes; local tenant configuration and assets are ignored and local-only.
- Reuse `generateTenantAssets`, `validateTenantAssets`, `createExpoConfig`, app control, and fast preflight.
- Use existing Vitest infrastructure; do not add a test framework.
- Use `@/`, `@assets/`, and `@config/` aliases for cross-folder application imports.
- Keep source files focused and generally below 350–400 lines.
- Perform no EAS build, update, store submission, merge, or push.

---

### Task 1: Separate tenant theme, localization, JavaScript defaults, and native capabilities

**Files:**
- Create: `frontend/config/tenants/features.ts`
- Create: `frontend/config/tenants/theme.ts`
- Modify: `frontend/config/tenants/schema.ts`
- Modify: `frontend/config/tenants/types.ts`
- Modify: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/config/createExpoConfig.ts`
- Test: `frontend/config/__tests__/tenantRegistry.test.ts`
- Test: `frontend/config/__tests__/createExpoConfig.test.ts`

**Interfaces:**
- Produces: `TENANT_FEATURE_KEYS`, `TenantFeatureKey`, `TenantFeatureDefaults`, `TenantFeatureOverrides`, `resolveTenantFeatures(defaults, overrides?)`.
- Produces: `tenantThemeSchema`, `TenantTheme`, and `avihuTenant.theme` as the canonical runtime color source.
- Produces: `TenantConfig.kind: "repository" | "local"`, `localization`, `featureDefaults`, and `nativeCapabilities`.
- Preserves: the existing resolved Avihu Expo config, except the public snapshot receives the new separated fields.

- [ ] **Step 1: Write failing schema and feature-resolution tests**

Add tests that assert the exact catalog and strict override behavior:

```ts
expect(TENANT_FEATURE_KEYS).toEqual([
  "articles",
  "chat",
  "dietPlan",
  "smartFoodCatalog",
  "workoutPlan",
  "stepTracking",
  "progressTracking",
  "formsAndAgreements",
  "mediaCapture",
  "notifications",
]);
expect(Object.values(avihuTenant.featureDefaults).every(Boolean)).toBe(true);
expect(resolveTenantFeatures(avihuTenant.featureDefaults, { chat: false })).toMatchObject({
  chat: false,
  dietPlan: true,
});
expect(() => tenantFeatureOverridesSchema.parse({ unknownFeature: true })).toThrow();
```

Add schema cases proving localization is no longer a feature flag and capability rules fail closed:

```ts
expect(
  tenantConfigSchema.safeParse({
    ...avihuTenant,
    featureDefaults: { ...avihuTenant.featureDefaults, mediaCapture: true },
    nativeCapabilities: { ...avihuTenant.nativeCapabilities, camera: false },
  }).success
).toBe(false);
```

- [ ] **Step 2: Run focused tests and confirm the new exports are missing**

Run: `cd frontend && npm run test:unit -- config/__tests__/tenantRegistry.test.ts config/__tests__/createExpoConfig.test.ts`

Expected: FAIL because the new feature/theme contracts and tenant fields do not exist.

- [ ] **Step 3: Implement the strict feature and capability contracts**

Define the exact feature API in `features.ts`:

```ts
export const TENANT_FEATURE_KEYS = [
  "articles",
  "chat",
  "dietPlan",
  "smartFoodCatalog",
  "workoutPlan",
  "stepTracking",
  "progressTracking",
  "formsAndAgreements",
  "mediaCapture",
  "notifications",
] as const;

export type TenantFeatureKey = (typeof TENANT_FEATURE_KEYS)[number];
export type TenantFeatureDefaults = Record<TenantFeatureKey, boolean>;
export type TenantFeatureOverrides = Partial<TenantFeatureDefaults>;

export const resolveTenantFeatures = (
  defaults: TenantFeatureDefaults,
  overrides: TenantFeatureOverrides = {}
): TenantFeatureDefaults => ({ ...defaults, ...overrides });
```

Use strict Zod objects for `featureDefaults`, override parsing, and these native capabilities:

```ts
{
  camera: boolean;
  photoLibrary: boolean;
  notifications: boolean;
  backgroundTasks: boolean;
  appleHealth: boolean;
  healthConnect: boolean;
  liveActivities: boolean;
}
```

Cross-field validation must require camera plus photo-library support for `mediaCapture`, notification
native support for `notifications`, and the relevant iOS/Android health capability for
`stepTracking` when that platform is listed.

- [ ] **Step 4: Define the strict tenant theme contract and Avihu mapping**

Keep the existing Material-compatible shared keys used by `useColors`, then add strict nested groups:

```ts
theme: {
  colors: {
    primary; onPrimary; secondary; onSecondary; accent; onAccent;
    primaryContainer; onPrimaryContainer; secondaryContainer; onSecondaryContainer;
    background; onBackground; surface; onSurface; surfaceSubtle; surfaceMuted;
    surfaceVariant; onSurfaceVariant; outline; outlineVariant; divider;
    shadow; shadowMuted; scrim; backdrop; inverseSurface; inverseOnSurface; inversePrimary;
    success; onSuccess; successContainer; onSuccessContainer;
    warning; onWarning; warningContainer; onWarningContainer;
    error; onError; errorContainer; onErrorContainer;
    info; onInfo; infoContainer; onInfoContainer;
    disabledSurface; disabledContent; placeholder; pressed; selected;
    elevation: { level0; level1; level2; level3; level4; level5 };
    diet: { primaryText; secondaryText; tertiaryText; card; cardSubtle; border; borderStrong; mint; mintStrong; consumedBackground; consumedBorder; consumedText; dangerBackground; dangerBorder; dangerText };
    steps: { aboveGoalDark; aboveGoal; aboveGoalLight; belowGoalDark; belowGoal; belowGoalLight; ringTrack; ringGradientStart; ringGradientEnd; mutedText; mutedTextSoft; mutedTextFaint; hairline; baseline; target; dayLabel; selectedPill };
    graph: { line; lineSecondary; gradientStart; gradientEnd; gradientStartTransparent; gradientEndTransparent; dot; dotBorder; label; tooltip; tooltipText; tooltipShadow };
    calendar: { dayHeader; today; agendaText; selected; dot; dotSelected };
    scanner: { background; headerOverlay; controlSurface; controlBorder; viewfinder; scanLine; panel; panelText; successOverlay; dimOverlay };
    overlay: { imageSurface; imageShadow; modal; modalStrong; translucentSurface };
  };
}
```

Every leaf uses a strict color schema accepting six/eight-digit hex, `rgb()`/`rgba()`, or
`transparent`. Populate Avihu with the exact existing rendered values before editing consumers.

- [ ] **Step 5: Migrate Avihu configuration and Expo snapshot without behavior changes**

Set `kind: "repository"`, move `supportsRtl`/`forcesRtl` to `localization`, set all named feature
defaults to `true`, and set all currently installed native capabilities to `true`. Update
`createExpoConfig` to expose `theme`, `localization`, `featureDefaults`, and `nativeCapabilities`.
Conditionally compose native plugins/permissions only through pure helper functions, with Avihu tests
asserting the resulting plugin list remains byte-for-byte equivalent in meaning.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `cd frontend && npm run test:unit -- config/__tests__/tenantRegistry.test.ts config/__tests__/createExpoConfig.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit the tenant contract**

```bash
git add frontend/config/tenants frontend/config/createExpoConfig.ts frontend/config/__tests__
git commit -m "feat: define tenant theme and capability contracts"
```

---

### Task 2: Initialize runtime theme and expose future-ready feature resolution

**Files:**
- Create: `frontend/src/config/tenantFeatures.ts`
- Modify: `frontend/src/config/runtimeTenant.ts`
- Modify: `frontend/src/config/__tests__/runtimeTenant.test.ts`
- Modify: `frontend/src/themes/useAppTheme.tsx`
- Create: `frontend/src/themes/__tests__/tenantTheme.test.ts`
- Modify: `frontend/App.tsx`

**Interfaces:**
- Consumes: `TenantTheme`, `TenantFeatureDefaults`, and the new public Expo snapshot from Task 1.
- Produces: `getResolvedTenantFeatures(tenant, overrides?)` as a pure future entitlement seam.
- Produces: `ThemeProvider({ theme, children })` initialized synchronously from runtime configuration.

- [ ] **Step 1: Write failing runtime parsing and resolution tests**

Build a complete fixture from `avihuTenant` and assert strict parsing rejects missing theme leaves,
unknown feature keys, and native-capability additions. Assert overrides can disable but never invent a
feature:

```ts
expect(getResolvedTenantFeatures(runtimeTenant, { chat: false }).chat).toBe(false);
expect(getResolvedTenantFeatures(runtimeTenant).chat).toBe(true);
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `cd frontend && npm run test:unit -- src/config/__tests__/runtimeTenant.test.ts src/themes/__tests__/tenantTheme.test.ts`

Expected: FAIL because runtime schemas and initialization still use `brand`/`featureFlags`.

- [ ] **Step 3: Implement strict runtime parsing and pure feature resolution**

Reuse schema fragments exported from `config/tenants` through `@config/*` rather than duplicating
field lists. `getResolvedTenantFeatures` must call the pure resolver with optional already-validated
overrides; it must not fetch, cache, or persist anything.

- [ ] **Step 4: Make ThemeProvider tenant-initialized**

Replace internal `defaultTheme` state with an explicit immutable initial theme:

```tsx
export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => (
  <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
);
```

Read `Constants.expoConfig.extra.tenant` once in `App.tsx`, validate it with `getRuntimeTenant`, and
pass `runtimeTenant.theme` into `ThemeProvider`. Keep existing font definitions in a stable
`APP_FONTS` constant merged with tenant colors.

- [ ] **Step 5: Run focused tests and typecheck**

Run: `cd frontend && npm run test:unit -- src/config/__tests__/runtimeTenant.test.ts src/themes/__tests__/tenantTheme.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit runtime foundations**

```bash
git add frontend/App.tsx frontend/src/config frontend/src/themes
git commit -m "feat: initialize runtime from tenant theme"
```

---

### Task 3: Migrate shared UI colors and build the scoped color-audit foundation

**Files:**
- Create: `frontend/tools/theme/colorAudit.ts`
- Create: `frontend/tools/theme/__tests__/colorAudit.test.ts`
- Modify: `frontend/src/styles/useColors.tsx`
- Modify: `frontend/src/styles/useShadowStyles.tsx`
- Modify: `frontend/src/themes/useCalendarTheme.tsx`
- Modify: `frontend/src/themes/useGraphTheme.tsx`
- Modify: `frontend/src/components/Icon/Icon.tsx`
- Modify: `frontend/src/components/User/UserDetailContainer.tsx`
- Modify: `frontend/src/components/chat/ChatHeader.tsx`
- Modify: `frontend/src/components/dev/DeveloperToolRows.tsx`
- Modify: `frontend/src/components/dev/DeveloperToolsPanel.tsx`
- Modify: `frontend/src/components/forms/QuestionnaireExitButton.tsx`
- Modify: `frontend/src/components/forms/dynamicForm/formSection/FormSectionFooter.tsx`
- Modify: `frontend/src/components/forms/dynamicForm/formSection/FormSectionHeader.tsx`
- Modify: `frontend/src/components/forms/dynamicForm/formSection/FormSectionScreen.tsx`
- Modify: `frontend/src/components/forms/question/QuestionContainer.tsx`
- Modify: `frontend/src/components/measurements/MeasurementInput.tsx`
- Modify: `frontend/src/components/notifications/NotificationsWrapper.tsx`
- Modify: `frontend/src/components/notifications/containers/FormReminderContainer.tsx`
- Modify: `frontend/src/components/notifications/containers/ReminderContainer.tsx`
- Modify: `frontend/src/components/ui/BottomDrawer.tsx`
- Modify: `frontend/src/components/ui/BottomDrawerModal.tsx`
- Modify: `frontend/src/components/ui/Card.tsx`
- Modify: `frontend/src/components/ui/Collapsible.tsx`
- Modify: `frontend/src/components/ui/HorizontalSelector.tsx`
- Modify: `frontend/src/components/ui/PDFViewer.tsx`
- Modify: `frontend/src/components/ui/RightDrawer.tsx`
- Modify: `frontend/src/components/ui/Switch.tsx`
- Modify: `frontend/src/components/ui/inputs/ChatInput.tsx`
- Modify: `frontend/src/components/ui/inputs/Input.tsx`
- Modify: `frontend/src/components/ui/modals/BottomSheetModal.tsx`
- Modify: `frontend/src/components/ui/modals/Modal.tsx`
- Modify: `frontend/src/components/ui/scrollview/ScrollViewShadow.tsx`
- Modify: `frontend/src/hooks/useUpdates.tsx`
- Modify: `frontend/src/navigators/BottomTabNavigator.tsx`
- Modify: `frontend/src/screens/Agreement/AgreementQuestionsScreen.tsx`
- Modify: `frontend/src/screens/Agreement/AgreementSignatureScreen.tsx`
- Modify: `frontend/src/utils/utils.ts`

**Interfaces:**
- Consumes: `theme.colors` from Task 2.
- Produces: `auditApplicationColors(paths, exceptions)` and a CLI `--paths` option for auditing an explicit migrated scope.
- Preserves: exact Avihu shared-component colors.

- [ ] **Step 1: Write a failing source-audit test**

The scanner must inspect supplied `frontend/src/**/*.{ts,tsx}` paths, ignore test fixtures and the
tenant theme definition, and report file, line, and literal. It treats every hex/rgb/hsl literal as
a color and treats named React Native colors only in color-valued style properties or component
props, so semantic values such as `variant="gray"` are not false positives. Its only technical
allowances are `"transparent"` and template-generated
`rgba(${r}, ${g}, ${b}, ${opacity})` in the color utility.

```ts
expect(auditApplicationColors(fixtureRoot)).toEqual([
  expect.objectContaining({ relativePath: "src/Card.tsx", literal: "#FFFFFF", line: 4 }),
]);
```

- [ ] **Step 2: Run the audit test and current audit to capture the red baseline**

Run: `cd frontend && npm run test:unit -- tools/theme/__tests__/colorAudit.test.ts`

Expected: the fixture test initially fails because the scanner is absent. After the scanner is
minimal, invoking it with the explicit Task 3 file list must fail and report the current shared
literals.

- [ ] **Step 3: Implement the scanner and scoped CLI**

Parse source text line-by-line with hex/rgb/hsl coverage plus named colors in `color`,
`backgroundColor`, `borderColor`, `shadowColor`, `textDecorationColor`, and JSX `color` props.
Accept repeated `--paths <path>` inputs so this task can prove its migrated shared scope is clean
without declaring deferred feature files to be exceptions. Do not silently allow an entire file;
exceptions must identify an exact relative path and literal with a reason.

- [ ] **Step 4: Replace shared literals with semantic roles**

Use `useThemeContext()` for raw values and `useGlobalStyles()` for reusable style objects. Convert
module-level `StyleSheet.create` blocks that need tenant values into `createStyles(theme.colors)`
factories called through `useMemo`. Pass semantic colors into non-React graph/calendar/helper
functions rather than importing Avihu configuration.

- [ ] **Step 5: Run shared UI tests, audit, and typecheck**

Run: `cd frontend && npm run test:unit -- tools/theme/__tests__/colorAudit.test.ts && npx tsx tools/theme/colorAudit.ts --paths src/styles --paths src/themes --paths src/components/ui --paths src/components/forms --paths src/components/notifications --paths src/components/dev --paths src/components/chat --paths src/components/Icon --paths src/components/User --paths src/hooks/useUpdates.tsx --paths src/navigators/BottomTabNavigator.tsx --paths src/screens/Agreement --paths src/utils/utils.ts && npm run typecheck`

Expected: PASS. The explicit shared scope contains no unapproved color literals; feature paths are
not yet part of this command and are not added to an exception list.

- [ ] **Step 6: Commit the shared color migration**

```bash
git add frontend/src/styles frontend/src/themes frontend/src/components/ui frontend/src/components/forms frontend/src/components/notifications frontend/src/components/dev frontend/src/components/chat frontend/src/components/Icon frontend/src/components/User frontend/src/hooks/useUpdates.tsx frontend/src/navigators/BottomTabNavigator.tsx frontend/src/screens/Agreement frontend/src/utils/utils.ts frontend/tools/theme
git commit -m "refactor: move shared colors into tenant theme"
```

---

### Task 4: Migrate intentional feature palettes and close the color audit

**Files:**
- Modify: `frontend/src/components/Articles/ArticleCard.tsx`
- Modify: `frontend/src/components/Articles/LikeButton.tsx`
- Modify: `frontend/src/components/Articles/articleGroup/ArticleGroupDisplay.tsx`
- Modify: `frontend/src/components/DietPlan/AdditionalDietItemsModal.tsx`
- Modify: `frontend/src/components/DietPlan/CollapsibleMeal.tsx`
- Modify: `frontend/src/components/DietPlan/DailyCalorieIntake.tsx`
- Modify: `frontend/src/components/DietPlan/DietItemContent.tsx`
- Modify: `frontend/src/components/DietPlan/DietPlanV1Summary.tsx`
- Modify: `frontend/src/components/DietPlan/FoodGroupTabs.tsx`
- Modify: `frontend/src/components/DietPlan/HighlightsTab.tsx`
- Modify: `frontend/src/components/DietPlan/ServingsTracker.tsx`
- Modify: `frontend/src/components/DietPlan/Supplements.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2AddOns.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2CategoryRow.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2ConsumedBadge.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2FreeCalories.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Header.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Highlights.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2MealCard.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2MealsList.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2SmartMenu.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Tabs.tsx`
- Modify: `frontend/src/components/DietPlanV2/FoodCatalogResultCard.tsx`
- Modify: `frontend/src/components/DietPlanV2/FoodCatalogScannerModal.tsx`
- Modify: `frontend/src/components/DietPlanV2/FoodCatalogSearchModal.tsx`
- Modify: `frontend/src/components/DietPlanV2/FoodCatalogSearchRow.tsx`
- Modify: `frontend/src/components/DietPlanV2/FoodCatalogServingSelect.tsx`
- Modify: `frontend/src/components/DietPlanV2/SmartFoodDeleteModal.tsx`
- Modify: `frontend/src/components/DietPlanV2/SmartFoodHistoryModal.tsx`
- Modify: `frontend/src/components/DietPlanV2/dietV2Icons.tsx`
- Modify: `frontend/src/components/WeightGraph/DisplayImage.tsx`
- Modify: `frontend/src/components/WeightGraph/WeighInsGraph.tsx`
- Modify: `frontend/src/components/WeightGraph/WeightCard.tsx`
- Modify: `frontend/src/components/WorkoutPlan/ExerciseContainer.tsx`
- Modify: `frontend/src/components/WorkoutPlan/RecordExercise/RecordExerciseHeader.tsx`
- Modify: `frontend/src/components/WorkoutPlan/WorkoutPlanSelector.tsx`
- Modify: `frontend/src/components/WorkoutPlan/WorkoutVideoPopup.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/CardioWorkouts.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/SimpleCardioContainer.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/steps/HealthOnboardingCard.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/steps/WeeklyStepsChartHeader.tsx`
- Modify: `frontend/src/components/WorkoutPlan/cardio/steps/stepsConstants.ts`
- Modify: `frontend/src/components/WorkoutProgression/ExerciseSelector.tsx`
- Modify: `frontend/src/components/ui/graph/Graph.tsx`
- Modify: `frontend/src/components/ui/graph/SelectedDot.tsx`
- Modify: `frontend/src/components/ui/graph/SkiaLine.tsx`
- Modify: `frontend/src/components/ui/graph/ToolTip.tsx`
- Modify: `frontend/config/tenants/avihu.ts`
- Test: `frontend/tools/theme/__tests__/colorAudit.test.ts`
- Test: `frontend/src/themes/__tests__/tenantTheme.test.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: the `diet`, `steps`, `graph`, `calendar`, `scanner`, and `overlay` semantic groups from Task 1.
- Produces: zero unapproved application color literals and a complete exact-value Avihu mapping.

- [ ] **Step 1: Extend failing Avihu exact-value tests for every discovered intentional palette**

Assert representative and collision-prone roles explicitly, including:

```ts
expect(avihuTenant.theme.colors.diet.primaryText).toBe("#0B2A22");
expect(avihuTenant.theme.colors.diet.mint).toBe("#E8F5EF");
expect(avihuTenant.theme.colors.steps.ringGradientStart).toBe("#072723");
expect(avihuTenant.theme.colors.steps.aboveGoal).toBe("#4ED167");
expect(avihuTenant.theme.colors.graph.gradientStart).toBe("#9FFFA2");
expect(avihuTenant.theme.colors.scanner.viewfinder).toBe("#5BE29B");
```

- [ ] **Step 2: Run tests and preserve the audit failure list**

Run: `cd frontend && npm run test:unit -- src/themes/__tests__/tenantTheme.test.ts tools/theme/__tests__/colorAudit.test.ts && npm run theme:audit`

Expected: FAIL until all feature colors are tenant-owned.

- [ ] **Step 3: Migrate Diet V1, Diet V2, and smart-food colors**

Remove exported raw palette constants from `dietV2Icons.tsx`; accept a `TenantTheme["colors"]["diet"]`
argument or read context in components. Convert each module-level style sheet to a theme-aware factory
without changing dimensions, typography, opacity, animations, copy, or render ordering.

- [ ] **Step 4: Migrate steps, health, workout, weight, graph, and article colors**

Replace `stepsConstants.ts` color exports with a hook/helper that maps semantic theme values while
leaving numeric chart constants unchanged. Feed graph colors from theme props into Skia nodes and
calendar/chart configuration. Preserve exact Avihu alpha strings.

- [ ] **Step 5: Add the repository-wide audit command and close it with only documented technical exceptions**

Add `"theme:audit": "tsx tools/theme/colorAudit.ts --paths src"` to `frontend/package.json`.

Run: `cd frontend && npm run theme:audit`

Expected: PASS with zero application literals outside the theme definition and exact technical
exceptions. Do not add feature files to an allowlist.

- [ ] **Step 6: Run typecheck and the full unit suite**

Run: `cd frontend && npm run typecheck && npm run test:unit`

Expected: PASS.

- [ ] **Step 7: Commit feature palette migration**

```bash
git add frontend/config/tenants/avihu.ts frontend/src/components frontend/src/themes/__tests__ frontend/tools/theme
git commit -m "refactor: tenant-theme feature palettes"
```

---

### Task 5: Discover ignored local tenants and block their release operations

**Files:**
- Create: `frontend/config/tenants/localRegistry.ts`
- Modify: `frontend/config/tenants/registry.ts`
- Modify: `frontend/config/tenants/README.md`
- Modify: `frontend/config/tenants/types.ts`
- Modify: `frontend/tools/assets/paths.ts`
- Modify: `frontend/tools/app-control/actions.ts`
- Modify: `frontend/tools/app-control/prompts.ts`
- Modify: `frontend/tools/app-control/__tests__/actions.test.ts`
- Modify: `frontend/tools/app-control/__tests__/prompts.test.ts`
- Modify: `frontend/config/__tests__/tenantRegistry.test.ts`
- Modify: `frontend/.gitignore`

**Interfaces:**
- Produces: `loadLocalTenants(localRoot): TenantConfig[]` for Node tooling.
- Produces: `assertTenantActionAllowed(tenant, selection): void` used before command resolution.
- Produces: asset path resolution from the selected tenant's declared asset root, supporting normal and ignored local roots.

- [ ] **Step 1: Write failing local-discovery, collision, and action-policy tests**

Use temporary directories containing `alpha.ts` and `beta.ts`, load them with the TS runtime already
used by project CLIs, and assert deterministic ID sorting. Add malformed-export, duplicate-ID,
duplicate-native-identity, and local release-action cases:

```ts
expect(() => resolveAction(localBuildSelection)).toThrow(
  'Local tenant "test-tenant" cannot run build actions'
);
expect(() => resolveAction(localReleasePreflight)).toThrow(/release preflight/);
expect(resolveAction(localStartSelection).args).toEqual(["expo", "start", "-c"]);
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `cd frontend && npm run test:unit -- config/__tests__/tenantRegistry.test.ts tools/app-control/__tests__/actions.test.ts tools/app-control/__tests__/prompts.test.ts`

Expected: FAIL because local discovery and policy do not exist.

- [ ] **Step 3: Implement Node-only local discovery and collision validation**

Read only `config/tenants/.local/*.ts`, reject symlinks and non-files, require exactly one exported
tenant object, schema-parse it, require `kind === "local"`, and sort by ID. Merge with committed
tenants only inside `registry.ts`; reject collisions across ID, slug, project ID, scheme, iOS bundle,
and Android package before exposing `listTenants()`.

- [ ] **Step 4: Add exact ignored roots and tenant-owned asset roots**

Append these rules to `frontend/.gitignore`:

```gitignore
# Local white-label tenant testing
config/tenants/.local/
config/tenants/assets/.local/
.tenant-add/
```

Resolve source/generated paths from validated tenant asset declarations so the existing generator
and validator work for both roots without `TENANT_ASSETS_ROOT` command-specific behavior.

- [ ] **Step 5: Enforce local-only policy in command resolution and prompts**

Allow `start`, development `run`, `install`, fast `preflight`, and asset actions. Reject preview or
production native runs, release preflight, build, and update before child-process creation. Interactive
menus must omit forbidden actions for a local tenant while the resolver remains the final guard.

- [ ] **Step 6: Run focused tests, typecheck, and Avihu asset validation**

Run: `cd frontend && npm run test:unit -- config/__tests__/tenantRegistry.test.ts tools/app-control/__tests__/actions.test.ts tools/app-control/__tests__/prompts.test.ts && npm run typecheck && npm run assets:check -- --tenant avihu`

Expected: PASS.

- [ ] **Step 7: Commit local tenant infrastructure**

```bash
git add frontend/config/tenants frontend/tools/assets/paths.ts frontend/tools/app-control frontend/.gitignore
git commit -m "feat: support ignored local tenants safely"
```

---

### Task 6: Build logo normalization and transactional tenant scaffolding

**Files:**
- Create: `frontend/tools/tenant-add/types.ts`
- Create: `frontend/tools/tenant-add/validation.ts`
- Create: `frontend/tools/tenant-add/logo.ts`
- Create: `frontend/tools/tenant-add/renderTenantModule.ts`
- Create: `frontend/tools/tenant-add/scaffold.ts`
- Create: `frontend/tools/tenant-add/verify.ts`
- Create: `frontend/tools/tenant-add/__tests__/validation.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/logo.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/renderTenantModule.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/scaffold.test.ts`

**Interfaces:**
- Produces: `TenantAddAnswers`, `TenantAddMode`, and `TenantAddResult`.
- Produces: `normalizeOrCreateLogo(input): Promise<LogoResult>`.
- Produces: `renderTenantModule(config, exportName): string` with Prettier-compatible TypeScript.
- Produces: `scaffoldTenant(input, dependencies): Promise<TenantAddResult>` with rollback limited to newly created paths.
- Consumes: existing `generateTenantAssets`, `validateTenantAssets`, `createExpoConfig`, and preflight CLI dependencies.

- [ ] **Step 1: Write failing validation tests**

Cover tenant ID, TypeScript export-name conversion, package/bundle/scheme derivation, semantic-color
contrast, repository placeholder rejection, local identifier isolation, and collisions. Use the
actual schema parser as the final assertion rather than duplicating its rules.

- [ ] **Step 2: Write failing logo tests**

Create temporary PNG/JPEG fixtures with Sharp. Assert supplied artwork becomes sRGB PNG, fully
transparent input fails, missing paths fail, and fallback output is deterministic:

```ts
expect(await sha256(firstFallback)).toBe(await sha256(secondFallback));
expect(await sharp(firstFallback).metadata()).toMatchObject({
  format: "png",
  width: 1024,
  height: 1024,
});
```

- [ ] **Step 3: Write failing render and rollback tests**

Assert the rendered module imports `TenantConfig`, exports a camel-cased constant, uses
`satisfies TenantConfig`, includes every feature/native/theme value, and contains no secrets.
Simulate asset-generation and preflight failures; assert only invocation-created files disappear and
pre-existing sentinels remain.

- [ ] **Step 4: Run the focused suite and verify failure**

Run: `cd frontend && npm run test:unit -- tools/tenant-add/__tests__`

Expected: FAIL because the onboarding units do not exist.

- [ ] **Step 5: Implement validation and safe defaults**

Repository mode requires non-placeholder Expo owner/project/update URL and explicit environment
identities. Local mode derives unique IDs from a random UUID suffix but stores those concrete values
in the generated module. Start the visible test palette with violet/amber values that pass WCAG
contrast and differ from every Avihu core color.

- [ ] **Step 6: Implement supplied-logo normalization and fallback rendering**

Render a 1024×1024 inline SVG with a primary background, on-primary central geometric mark, and
transparent outer padding safe for adaptive-icon processing. Seed geometric orientation from a
stable hash of the tenant ID; never depend on installed fonts.

- [ ] **Step 7: Implement render, stage, publish, verify, and rollback**

Use a `.tenant-add` staging directory under `frontend`, validate before publication, then publish
with rename operations. Invoke the existing generator and validator by function. Resolve all three
Expo environments, verify Git-ignore coverage for local mode, then invoke fast preflight through a
dependency-injected runner. On failure restore repository registry bytes and remove only paths listed
in the transaction journal.

- [ ] **Step 8: Run focused tests and typecheck**

Run: `cd frontend && npm run test:unit -- tools/tenant-add/__tests__ && npm run typecheck`

Expected: PASS.

- [ ] **Step 9: Commit onboarding core**

```bash
git add frontend/tools/tenant-add
git commit -m "feat: scaffold and validate tenant sources"
```

---

### Task 7: Add the interactive CLI and repository registry updater

**Files:**
- Create: `frontend/tools/tenant-add/prompts.ts`
- Create: `frontend/tools/tenant-add/registryEditor.ts`
- Create: `frontend/tools/tenant-add/cli.ts`
- Create: `frontend/tools/tenant-add/__tests__/prompts.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/registryEditor.test.ts`
- Create: `frontend/tools/tenant-add/__tests__/cli.test.ts`
- Modify: `frontend/config/tenants/registry.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `collectTenantAnswers(promptApi): Promise<TenantAddAnswers | null>`.
- Produces: `addRepositoryTenantToRegistry(source, tenant): string` using explicit marker boundaries.
- Produces: `runTenantAddCli(dependencies): Promise<number>`.
- Adds: `npm run tenant:add`.

- [ ] **Step 1: Write failing prompt and cancellation tests**

Mock `@clack/prompts` behind a small `TenantPromptApi`. Assert mode is first, blank logo chooses
fallback, invalid colors/IDs show validation text, summary contains identities and capabilities,
and cancellation calls no scaffold dependency.

- [ ] **Step 2: Write failing registry-editor tests**

Add stable comments around generated imports and entries in `registry.ts`. Test insertion order,
hyphenated ID to camel-cased export conversion, duplicate refusal, exact preservation of unrelated
source, and idempotent failure rather than a second edit.

- [ ] **Step 3: Write failing CLI orchestration tests**

Assert success prints mode, source type, asset/preflight success, and exactly:

```text
npm run app -- start --tenant test-tenant --environment development --yes
```

Assert errors return exit code 1 without printing secrets and cancellation returns 0 with a concise
unchanged message.

- [ ] **Step 4: Run focused tests and verify failure**

Run: `cd frontend && npm run test:unit -- tools/tenant-add/__tests__/prompts.test.ts tools/tenant-add/__tests__/registryEditor.test.ts tools/tenant-add/__tests__/cli.test.ts`

Expected: FAIL because CLI orchestration is absent.

- [ ] **Step 5: Implement prompts and registry marker boundaries**

Use `select`, `text`, `multiselect`, `confirm`, `box`, `cancel`, and `isCancel`. Repository registry
markers must be committed once:

```ts
// tenant:add imports:start
import { avihuTenant } from "./avihu";
// tenant:add imports:end

// tenant:add entries:start
const committedTenants = [avihuTenant];
// tenant:add entries:end
```

The editor changes only content inside these markers.

- [ ] **Step 6: Implement CLI and package command**

Add `"tenant:add": "tsx tools/tenant-add/cli.ts"`. Print a final `@clack/prompts` box with paths,
identities, logo source, validation results, fallback warning when applicable, launch command, and
repository-review guidance. Do not stage or commit generated tenant files.

- [ ] **Step 7: Run focused tests, complete suite, and typecheck**

Run: `cd frontend && npm run test:unit -- tools/tenant-add/__tests__ && npm run test:unit && npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit the interactive workflow**

```bash
git add frontend/tools/tenant-add frontend/config/tenants/registry.ts frontend/package.json
git commit -m "feat: add interactive tenant onboarding"
```

---

### Task 8: Document the workflow and verify the complete local tenant journey

**Files:**
- Modify: `frontend/config/tenants/README.md`
- Modify: `frontend/docs/release-control.md`
- Modify: `AGENTS.md`
- Local ignored output: `frontend/config/tenants/.local/test-tenant.ts`
- Local ignored output: `frontend/config/tenants/assets/.local/test-tenant/**`

**Interfaces:**
- Documents: repository versus local mode, logo requirements/fallback, semantic themes, feature defaults, native capabilities, replacement-before-release warning, and launch/removal commands.
- Verifies: the actual local test tenant remains available but produces no Git changes.

- [ ] **Step 1: Update documentation and repository rules**

Document `npm run tenant:add`, both modes, the all-enabled Avihu baseline, future override seam, native
binary boundary, asset pipeline, local-only action restrictions, and how to remove an ignored local
tenant safely. Extend existing AGENTS.md sections rather than adding a parallel structure.

- [ ] **Step 2: Run formatting checks on every changed source file**

Run: `cd frontend && npx prettier --check "config/**/*.{ts,md}" "src/**/*.{ts,tsx}" "tools/**/*.{ts,md}" "docs/**/*.md" package.json`

Expected: PASS. If not, run the same command with `--write`, inspect the diff, and rerun `--check`.

- [ ] **Step 3: Verify Avihu before creating the local tenant**

Run:

```bash
cd frontend
npm run test:unit
npm run typecheck
npm run theme:audit
npm run assets:check -- --tenant avihu
npm run preflight -- --tenant avihu --environment development
```

Expected: all commands PASS; Avihu asset hashes and resolved identity remain unchanged.

- [ ] **Step 4: Exercise `tenant:add` interactively as `test-tenant`**

Choose local-test mode, ID `test-tenant`, display name `Test Tenant`, accept the deliberately different
semantic palette, leave the logo path blank, keep all JavaScript defaults enabled, and keep only
native capabilities supported by the current binary. Confirm creation.

Expected: fallback source logo, all generated platform assets, schema/Expo/assets/preflight PASS, and
the printed launch command:

```text
npm run app -- start --tenant test-tenant --environment development --yes
```

- [ ] **Step 5: Prove local files are ignored and the tenant resolves**

Run:

```bash
git status --short
git check-ignore -v config/tenants/.local/test-tenant.ts
git check-ignore -v config/tenants/assets/.local/test-tenant/source/app-icon.png
APP_TENANT=test-tenant APP_ENV=development npx expo config --type public
npm run assets:check -- --tenant test-tenant
```

Expected: no local tenant/config/artwork paths in `git status`; both ignore checks identify the exact
rules; Expo config and asset validation PASS.

- [ ] **Step 6: Verify release safety without running a release command**

Run dry argument/action resolution tests and a non-executing command resolution probe for local
build, update, and release preflight. Expected: each fails before process execution with a local-only
message.

- [ ] **Step 7: Inspect the complete diff and run final regression verification**

Run:

```bash
git diff --check f-multi-tenant-support...HEAD
cd frontend
npm run test:unit
npm run typecheck
npm run theme:audit
npm run assets:check -- --tenant avihu
```

Expected: no whitespace errors; every command PASS.

- [ ] **Step 8: Commit documentation and verification-owned rule changes**

```bash
git add AGENTS.md frontend/config/tenants/README.md frontend/docs/release-control.md
git commit -m "docs: explain tenant onboarding workflow"
```

- [ ] **Step 9: Request code review and retain the ignored test tenant**

Use `superpowers:requesting-code-review`, address validated findings, rerun affected verification,
and leave `test-tenant` ignored local files in place for the user's manual launch. Do not merge.
