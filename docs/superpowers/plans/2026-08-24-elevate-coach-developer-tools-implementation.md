# Elevate Coach Branding and Developer Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the Avihu app to Elevate Coach and add a tenant-safe, development-only device
toolbox for notifications, diagnostics, cache clearing, reload, and badge visibility.

**Architecture:** Keep tenant configuration as the branding and runtime-identity source of truth.
Add pure developer-tool policy, diagnostics, preference, and action modules behind a small root
provider; the floating environment badge and Profile screen open one shared panel. Native/device
operations remain adapters around existing Expo, React Query, and React Native services.

**Tech Stack:** Expo SDK 53, React Native 0.79, TypeScript, Expo Notifications, Expo Updates, React
Query, AsyncStorage, Zustand-independent React context, Vitest, existing UI/style primitives.

**Spec:** `docs/superpowers/specs/2026-08-24-elevate-coach-developer-tools-design.md`

## Global Constraints

- The Avihu tenant ID remains `avihu`.
- Development identity remains `com.avihuteam.avihuteam.dev`; preview and production identity remains
  `com.avihuteam.avihuteam`.
- EAS project ID, owner, update URL, URL scheme, slug, runtime policy, and app version remain unchanged.
- The supplied COACH source icon and every generated icon/splash byte remain unchanged.
- Developer Tools is available only when `__DEV__ === true` and tenant environment is `development`.
- Preview and production expose no Developer Tools entry point or action execution path.
- The floating badge remains visible by default and can be hidden without hiding the Profile recovery
  entry.
- Never display full URLs, API tokens, headers, environment values, user data, or authentication data.
- Cache clearing affects only React Query memory and the persisted React Query client.
- Do not add reset-local-data or logout behavior.
- Preserve RTL behavior and use the shared `Text`, styles, buttons, drawer, and safe-area patterns.
- Follow strict TDD: each production behavior begins with a focused test that is observed failing for
  the intended reason.

---

## File Structure

- `frontend/config/tenants/avihu.ts`: Elevate Coach tenant display name.
- `frontend/src/constants/notifications.ts`: notification bodies and identifiers only.
- `frontend/src/config/runtimeTenant.ts`: resolved runtime tenant parsing and display-name access.
- `frontend/src/devtools/policy.ts`: pure availability and diagnostic sanitization.
- `frontend/src/devtools/badgePreference.ts`: tenant-scoped badge preference repository.
- `frontend/src/devtools/actions.ts`: pure action orchestration and typed results.
- `frontend/src/devtools/state.ts`: pure provider-state transitions.
- `frontend/src/devtools/useDeveloperToolActions.ts`: Expo/React Query/React Native action adapter and
  busy state.
- `frontend/src/devtools/DeveloperToolsProvider.tsx`: availability, panel state, and badge preference.
- `frontend/src/components/dev/DeveloperToolsPanel.tsx`: bottom drawer interface.
- `frontend/src/components/dev/DeveloperToolsProfileEntry.tsx`: Profile recovery entry.
- `frontend/src/components/dev/TenantEnvironmentBadge.tsx`: optional badge trigger.
- `frontend/src/screens/ProfileScreen.tsx`: compose the development-only Profile entry.
- `frontend/App.tsx`: install the shared provider and panel at the app root.
- Focused `__tests__` files live beside the covered modules.

---

### Task 1: Elevate Coach Runtime Branding

**Files:**

- Modify: `frontend/config/tenants/avihu.ts`
- Modify: `frontend/config/__tests__/createExpoConfig.test.ts`
- Modify: `frontend/src/config/runtimeTenant.ts`
- Modify: `frontend/src/config/__tests__/runtimeTenant.test.ts`
- Modify: `frontend/src/constants/notifications.ts`
- Modify: `frontend/src/hooks/useNotification.tsx`
- Modify: `frontend/src/store/notificationStore.ts`

**Interfaces:**

- Produces: `getRuntimeTenantDisplayName(constants: RuntimeConstantsLike): string`
- Preserves: all tenant/native identifiers and existing notification bodies/identifiers.
- Consumes: `getRuntimeTenant(...)` and Expo Constants.

- [ ] **Step 1: Write failing tenant-branding tests**

Add a config test that resolves all three environments and asserts the literal visible name while
asserting identifiers remain unchanged:

```ts
it.each(["development", "preview", "production"] as const)(
  "brands the Avihu %s app as Elevate Coach without changing native identity",
  (environment) => {
    const config = createExpoConfig({
      baseConfig: {},
      tenant: getTenant("avihu"),
      environment,
      processEnv: {},
    });

    expect(config.name).toBe("Elevate Coach");
    expect(config.extra?.tenant).toMatchObject({ displayName: "Elevate Coach" });
    expect(config.android?.package).toBe(
      environment === "development" ? "com.avihuteam.avihuteam.dev" : "com.avihuteam.avihuteam"
    );
    expect(config.ios?.bundleIdentifier).toBe(
      environment === "development" ? "com.avihuteam.avihuteam.dev" : "com.avihuteam.avihuteam"
    );
  }
);
```

Extend the runtime tenant test to exercise the accessor from a complete runtime fixture:

```ts
expect(getRuntimeTenantDisplayName(createConstants(true))).toBe("Elevate Coach");
```

The production mutation caught by these tests is a stale user-visible name or an accidental store
identity change.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
cd frontend
npx vitest run config/__tests__/createExpoConfig.test.ts src/config/__tests__/runtimeTenant.test.ts
```

Expected: FAIL because Avihu still resolves `Avihu Team` and the runtime accessor does not exist.

- [ ] **Step 3: Implement runtime-derived branding**

Change only `displayName` in `avihu.ts`:

```ts
displayName: "Elevate Coach",
```

Export the constants-like interface and accessor in `runtimeTenant.ts`:

```ts
export interface RuntimeConstantsLike {
  expoConfig?: {
    extra?: Record<string, unknown>;
  } | null;
}

export const getRuntimeTenantDisplayName = (constants: RuntimeConstantsLike): string =>
  getRuntimeTenant(constants).displayName;
```

Keep the runtime parser platform-independent. Remove `NOTIFICATION_TITLE` from
`constants/notifications.ts`. Import Expo Constants in `useNotification.tsx` and
`notificationStore.ts`, then replace the constant with `getRuntimeTenantDisplayName(Constants)` so
scheduled notifications and stored notification records use the selected tenant name.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: both files pass and all identity assertions remain green.

- [ ] **Step 5: Commit the branding change**

```bash
git add frontend/config/tenants/avihu.ts frontend/config/__tests__/createExpoConfig.test.ts \
  frontend/src/config/runtimeTenant.ts frontend/src/config/__tests__/runtimeTenant.test.ts \
  frontend/src/constants/notifications.ts frontend/src/hooks/useNotification.tsx \
  frontend/src/store/notificationStore.ts
git commit -m "feat: brand Avihu app as Elevate Coach"
```

---

### Task 2: Developer Tools Policy, Diagnostics, and Badge Preference

**Files:**

- Create: `frontend/src/devtools/policy.ts`
- Create: `frontend/src/devtools/badgePreference.ts`
- Create: `frontend/src/devtools/__tests__/policy.test.ts`
- Create: `frontend/src/devtools/__tests__/badgePreference.test.ts`

**Interfaces:**

- Produces:
  `isDeveloperToolsAvailable(isDevelopmentBuild: boolean, environment: TenantEnvironment): boolean`
- Produces: `createDeveloperDiagnostics(input: DeveloperDiagnosticsInput): DeveloperDiagnostics`
- Produces: `createBadgePreferenceRepository(storage: StringStorage): BadgePreferenceRepository`
- Produces: `getBadgePreferenceKey(tenantId: string): string`
- Consumes: `TenantEnvironment` and the runtime tenant snapshot.

- [ ] **Step 1: Write failing pure-policy tests**

Create table-driven tests with literal expectations:

```ts
it.each([
  [true, "development", true],
  [false, "development", false],
  [true, "preview", false],
  [true, "production", false],
] as const)("gates tools for dev=%s environment=%s", (isDev, environment, expected) => {
  expect(isDeveloperToolsAvailable(isDev, environment)).toBe(expected);
});

it("returns platform identity and strips every sensitive API URL component", () => {
  expect(
    createDeveloperDiagnostics({
      tenantId: "avihu",
      displayName: "Elevate Coach",
      environment: "development",
      platform: "ios",
      appVersion: "2.4.0",
      iosBundleIdentifier: "com.avihuteam.avihuteam.dev",
      androidPackage: "com.avihuteam.avihuteam.dev",
      apiUrl: "https://token:secret@api.example.com/private/path?key=secret#fragment",
    })
  ).toEqual({
    tenant: "Elevate Coach (avihu)",
    environment: "development",
    applicationId: "com.avihuteam.avihuteam.dev",
    appVersion: "2.4.0",
    apiHost: "api.example.com",
  });
});

it.each([undefined, null, "", "not a URL"])("fails closed for API value %s", (apiUrl) => {
  expect(createDeveloperDiagnostics(validInput({ apiUrl })).apiHost).toBe("Unavailable");
});
```

The production mutations caught are an environment bypass, a wrong platform identifier, and leaking
URL credentials/path/query content.

- [ ] **Step 2: Write failing preference-repository tests**

Use an in-memory `StringStorage` implementation and assert repository behavior rather than mock
existence:

```ts
it("defaults an absent or malformed tenant preference to visible", async () => {
  const storage = createMemoryStorage({
    "@developer-tools/avihu/show-badge": "malformed",
  });
  const repository = createBadgePreferenceRepository(storage);

  await expect(repository.load("missing")).resolves.toBe(true);
  await expect(repository.load("avihu")).resolves.toBe(true);
});

it("persists badge visibility independently for each tenant", async () => {
  const storage = createMemoryStorage();
  const repository = createBadgePreferenceRepository(storage);

  await repository.save("avihu", false);
  await repository.save("future-coach", true);

  await expect(repository.load("avihu")).resolves.toBe(false);
  await expect(repository.load("future-coach")).resolves.toBe(true);
});
```

The production mutations caught are a global shared key, an unsafe hidden default, and malformed
storage coercion.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
cd frontend
npx vitest run src/devtools/__tests__/policy.test.ts \
  src/devtools/__tests__/badgePreference.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement minimal pure modules**

Implement `policy.ts` with these public shapes:

```ts
export interface DeveloperDiagnosticsInput {
  tenantId: string;
  displayName: string;
  environment: TenantEnvironment;
  platform: "ios" | "android";
  appVersion?: string | null;
  iosBundleIdentifier?: string | null;
  androidPackage?: string | null;
  apiUrl?: string | null;
}

export interface DeveloperDiagnostics {
  tenant: string;
  environment: TenantEnvironment;
  applicationId: string;
  appVersion: string;
  apiHost: string;
}
```

`createDeveloperDiagnostics` must select the current platform identifier, fall back to `Unavailable`
for missing identity/version, parse API values with `new URL`, and return only `.host`.

Implement `badgePreference.ts` with:

```ts
export interface StringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface BadgePreferenceRepository {
  load(tenantId: string): Promise<boolean>;
  save(tenantId: string, visible: boolean): Promise<void>;
}
```

Use the exact key `@developer-tools/${tenantId}/show-badge`, persist `"true"` or `"false"`, and treat
all other values as visible.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the command from Step 3. Expected: all policy and repository cases pass.

- [ ] **Step 6: Commit the developer-tool core**

```bash
git add frontend/src/devtools/policy.ts frontend/src/devtools/badgePreference.ts \
  frontend/src/devtools/__tests__/policy.test.ts \
  frontend/src/devtools/__tests__/badgePreference.test.ts
git commit -m "feat: add tenant-safe developer tool policy"
```

---

### Task 3: Non-destructive Developer Action Orchestration

**Files:**

- Create: `frontend/src/devtools/actions.ts`
- Create: `frontend/src/devtools/__tests__/actions.test.ts`
- Create: `frontend/src/devtools/useDeveloperToolActions.ts`
- Modify: `frontend/src/hooks/useNotification.tsx`

**Interfaces:**

- Produces: `createDeveloperActions(dependencies: DeveloperActionDependencies): DeveloperActions`
- Produces: `useDeveloperToolActions(open: boolean): DeveloperToolActionState`
- Consumes: Expo Notifications, Expo Updates, React Native Linking/AppState, React Query client,
  query persister, runtime tenant name, and existing `showNotification` channel setup.

- [ ] **Step 1: Write failing action-contract tests**

Define complete dependency fakes at the device boundary and assert observable results and side
effects:

```ts
it("refuses a test notification while permission is not granted", async () => {
  const calls: string[] = [];
  const actions = createDeveloperActions(
    dependencies({
      getNotificationPermission: async () => "denied",
      scheduleTestNotification: async () => {
        calls.push("scheduled");
        return "notification-id";
      },
    })
  );

  await expect(actions.sendTestNotification("Elevate Coach")).resolves.toEqual({
    ok: false,
    message: "Notification permission is not granted.",
  });
  expect(calls).toEqual([]);
});

it("sends an Elevate Coach local test notification after a granted permission check", async () => {
  const scheduled: Array<{ title: string; body: string }> = [];
  const actions = createDeveloperActions(
    dependencies({
      getNotificationPermission: async () => "granted",
      scheduleTestNotification: async (title, body) => {
        scheduled.push({ title, body });
        return "notification-id";
      },
    })
  );

  await expect(actions.sendTestNotification("Elevate Coach")).resolves.toMatchObject({ ok: true });
  expect(scheduled).toEqual([{ title: "Elevate Coach", body: "Developer test notification" }]);
});

it("clears only memory and persisted query cache", async () => {
  const cleared = { memory: false, persisted: false };
  const actions = createDeveloperActions(
    dependencies({
      clearMemoryQueryCache: () => {
        cleared.memory = true;
      },
      clearPersistedQueryCache: async () => {
        cleared.persisted = true;
      },
    })
  );

  await expect(actions.clearServerCache()).resolves.toMatchObject({ ok: true });
  expect(cleared).toEqual({ memory: true, persisted: true });
});
```

Add failure cases for missing notification identifier, denied permission after request, settings
failure, persisted-cache failure, and reload failure. The production mutations caught are scheduling
without permission, hiding external failures, clearing the wrong data source, and reporting false
success.

- [ ] **Step 2: Run the action tests and verify RED**

Run:

```bash
cd frontend
npx vitest run src/devtools/__tests__/actions.test.ts
```

Expected: FAIL because `actions.ts` does not exist.

- [ ] **Step 3: Implement the pure action service**

Use these types:

```ts
export type DeveloperNotificationPermission = "granted" | "denied" | "undetermined";

export interface DeveloperActionResult {
  ok: boolean;
  message: string;
}

export interface DeveloperActionDependencies {
  getNotificationPermission(): Promise<DeveloperNotificationPermission>;
  requestNotificationPermission(): Promise<DeveloperNotificationPermission>;
  scheduleTestNotification(title: string, body: string): Promise<string | undefined>;
  openNotificationSettings(): Promise<void>;
  clearMemoryQueryCache(): void;
  clearPersistedQueryCache(): Promise<void>;
  reloadApp(): Promise<void>;
}
```

Return actions for `refreshNotificationPermission`, `requestNotificationPermission`,
`sendTestNotification`, `openNotificationSettings`, `clearServerCache`, and `reloadApp`. Catch each
external error, log only `[developer-tools] <action> failed`, and return a safe failure message without
serializing the original error.

- [ ] **Step 4: Run action tests and verify GREEN**

Run the command from Step 2. Expected: every success, refusal, ordering, and failure case passes.

- [ ] **Step 5: Implement the native action adapter**

Add `useDeveloperToolActions(open)` that:

- Instantiates the pure service with `Notifications.getPermissionsAsync()` and
  `Notifications.requestPermissionsAsync()` status normalization.
- Uses the existing notification hook's channel-aware scheduling path, extended to accept an optional
  explicit title while defaulting to the runtime tenant name for all existing consumers.
- Uses `Linking.openSettings()`, `queryClient.clear()`, `persister.removeClient()`, and
  `Updates.reloadAsync()`.
- Refreshes permission when the panel opens and whenever `AppState` returns to `active` while open.
- Exposes `permission`, `runningAction`, and one guarded async method per panel action.
- Refuses a second action while `runningAction` is non-null.

Do not add any AsyncStorage clearing, Zustand reset, authentication action, API mutation, or remote
push implementation.

- [ ] **Step 6: Run focused tests, TypeScript, and commit**

Run:

```bash
cd frontend
npx vitest run src/devtools/__tests__/actions.test.ts
npm run typecheck
```

Expected: action tests and strict type checking pass.

Commit:

```bash
git add frontend/src/devtools/actions.ts frontend/src/devtools/__tests__/actions.test.ts \
  frontend/src/devtools/useDeveloperToolActions.ts frontend/src/hooks/useNotification.tsx
git commit -m "feat: add non-destructive developer actions"
```

---

### Task 4: Shared Developer Tools Panel and Entry Points

**Files:**

- Create: `frontend/src/devtools/DeveloperToolsProvider.tsx`
- Create: `frontend/src/devtools/state.ts`
- Create: `frontend/src/components/dev/DeveloperToolsPanel.tsx`
- Create: `frontend/src/components/dev/DeveloperToolsProfileEntry.tsx`
- Modify: `frontend/src/components/dev/TenantEnvironmentBadge.tsx`
- Modify: `frontend/src/screens/ProfileScreen.tsx`
- Modify: `frontend/App.tsx`
- Create: `frontend/src/devtools/__tests__/providerState.test.ts`

**Interfaces:**

- Produces: `DeveloperToolsProvider`, `useDeveloperTools()`.
- `useDeveloperTools()` returns `{ available, panelOpen, openPanel, closePanel, badgeVisible,
setBadgeVisible }`.
- Consumes: policy, AsyncStorage preference repository, runtime tenant config, diagnostics, action
  adapter, and existing drawer/style primitives.

- [ ] **Step 1: Write failing provider-state tests before React wiring**

Extract a pure state initializer/transition helper used by the provider and cover unavailable and
preference-loaded behavior:

```ts
it("never opens or renders a badge preference when tools are unavailable", () => {
  const state = createDeveloperToolsState({ available: false, persistedBadgeVisible: true });

  expect(openDeveloperToolsPanel(state)).toEqual({
    available: false,
    panelOpen: false,
    badgeVisible: false,
  });
});

it("keeps the Profile recovery path available after the badge is hidden", () => {
  const hidden = setDeveloperToolsBadgeVisible(
    createDeveloperToolsState({ available: true, persistedBadgeVisible: true }),
    false
  );

  expect(hidden).toMatchObject({ available: true, badgeVisible: false });
  expect(openDeveloperToolsPanel(hidden).panelOpen).toBe(true);
});
```

The production mutations caught are opening tools outside the gate and coupling panel availability to
badge visibility.

- [ ] **Step 2: Run the provider-state test and verify RED**

Run:

```bash
cd frontend
npx vitest run src/devtools/__tests__/providerState.test.ts
```

Expected: FAIL because the provider state module does not exist.

- [ ] **Step 3: Implement provider state and verify GREEN**

Add the minimal pure state functions in `state.ts`, then run the command from Step 2. Expected: PASS
for unavailable and hidden-badge recovery behavior.

- [ ] **Step 4: Implement the root provider**

The provider must:

- Resolve runtime tenant once from Expo Constants.
- Compute `available` with `isDeveloperToolsAvailable(__DEV__, tenant.environment)`.
- Use `createBadgePreferenceRepository(AsyncStorage)` only when available.
- Default visible while the valid preference loads; persist later toggle changes under the tenant key.
- Keep panel open state independent from badge visible state.
- Render `DeveloperToolsPanel` only when available.
- Provide no-op open/toggle behavior and `badgeVisible: false` when unavailable.

Install the provider inside `SafeAreaProvider` and around both `NavigationContainer` and the badge so
the Profile entry and root panel share one context.

- [ ] **Step 5: Implement the panel**

Use the existing `BottomDrawer` and shared `Text`, `PrimaryButton`, `Switch`, styles, and safe-area
spacing. The panel must render:

- Elevate Coach/tenant, environment, application ID, version, sanitized API host.
- Current permission status.
- Test notification, request permission when needed, open settings, clear cache, and reload buttons.
- A controlled badge switch whose callback persists through the provider.
- Busy state that disables every action while one is running.
- Success/error feedback through the existing toast system.
- An `Alert.alert` confirmation before cache clearing, explicitly saying login and recorded local data
  are preserved.

Keep text decisions and action-row data outside JSX so the component remains declarative and below
the repository's preferred file-size limit.

- [ ] **Step 6: Implement both entry points**

Change `TenantEnvironmentBadge` to:

- Preserve the existing non-production environment badge behavior.
- Apply the stored visibility preference only when Developer Tools is available.
- Use a `Pressable` to open the panel only when available.
- Remain non-interactive in preview, so preview does not gain a Developer Tools entry point.

Add `DeveloperToolsProfileEntry` after `UserDetailsWrapper` in `ProfileScreen`. It returns `null` when
unavailable and always remains visible in an available development build, even when the floating badge
is hidden.

- [ ] **Step 7: Run focused and full checks**

Run:

```bash
cd frontend
npx vitest run src/devtools/__tests__/policy.test.ts \
  src/devtools/__tests__/badgePreference.test.ts \
  src/devtools/__tests__/actions.test.ts \
  src/devtools/__tests__/providerState.test.ts
npm run typecheck
npm run test:unit
npx prettier --check App.tsx src/devtools src/components/dev src/screens/ProfileScreen.tsx
```

Expected: all focused tests, the full suite, strict type checking, and formatting pass.

- [ ] **Step 8: Commit the UI integration**

```bash
git add frontend/App.tsx frontend/src/devtools/DeveloperToolsProvider.tsx \
  frontend/src/devtools/state.ts \
  frontend/src/devtools/__tests__/providerState.test.ts \
  frontend/src/components/dev/DeveloperToolsPanel.tsx \
  frontend/src/components/dev/DeveloperToolsProfileEntry.tsx \
  frontend/src/components/dev/TenantEnvironmentBadge.tsx frontend/src/screens/ProfileScreen.tsx
git commit -m "feat: add development-only device toolbox"
```

---

### Task 5: Release Guards and End-to-End Verification

**Files:**

- Modify if needed: `frontend/src/devtools/*` and their focused tests only for defects found during
  verification.
- Modify: `frontend/config/__tests__/createExpoConfig.test.ts` only if an uncovered identity regression
  is found.
- Do not modify any generated tenant asset.

**Interfaces:**

- Validates the complete feature against the approved spec.
- Produces no new feature beyond defects required to satisfy acceptance criteria.

- [ ] **Step 1: Verify generated assets were not changed**

Run:

```bash
cd frontend
git status --short config/tenants/assets/avihu
npm run assets:check -- --tenant avihu
```

Expected: no asset changes and every Apple/Android/notification/splash check passes.

- [ ] **Step 2: Run complete automated verification**

Run:

```bash
cd frontend
npm run test:unit
npm run typecheck
APP_TENANT=avihu APP_ENV=development npx expo install --check
npm run preflight -- --tenant avihu --environment development
npx prettier --check .
git diff --check
```

Expected: unit tests, TypeScript, Expo compatibility, formatting, and diff checks pass. Fast preflight
must pass when the required local development environment symbols are present; if they are absent,
the only allowed failure is the existing exact missing-environment-symbol check and it must be
reported rather than bypassed.

- [ ] **Step 3: Verify resolved environments and production gate**

Run the Expo configuration resolver for development, preview, and production and record:

- `name` is `Elevate Coach` in all three.
- Identifiers match Global Constraints.
- `extra.tenant.environment` matches the selected environment.
- No secret value appears in serialized public runtime metadata.

Run the policy test with production and preview fixtures again. Expected: both return unavailable even
when the injected development-build flag is true.

- [ ] **Step 4: Perform real development-build smoke checks**

Launch explicitly:

```bash
cd frontend
npm run app -- start --tenant avihu --environment development --yes
```

On an installed Elevate Coach development client, verify:

1. The floating badge opens the panel.
2. Profile opens the same panel.
3. Hiding the badge survives reload and Profile can restore it.
4. Diagnostics show the development application ID and only the API host.
5. Permission state updates after permission request and returning from settings.
6. Test notification appears with title `Elevate Coach`.
7. Cache clearing confirms first, preserves authentication/local records, and reports success.
8. Reload reloads the app and keeps the badge preference.

Do not claim a device-only check passed when the required simulator/device capability is unavailable;
record it as manual instead.

- [ ] **Step 5: Review the final diff for scope and safety**

Confirm:

- No bundle/EAS/store identifier changed.
- No generated asset changed.
- No reset/logout/local-data wipe exists.
- No full API URL, token, header, user data, or error serialization is rendered.
- Every action is behind the shared availability gate.
- No file exceeds the repository's 350-400-line guideline without a focused extraction.

- [ ] **Step 6: Commit verification-only fixes, if any**

If verification required scoped fixes, repeat the failing test's RED/GREEN cycle and commit only those
changes:

```bash
git add <verified-scoped-files>
git commit -m "fix: harden Elevate Coach developer tools"
```

If no fixes were needed, do not create an empty commit.
