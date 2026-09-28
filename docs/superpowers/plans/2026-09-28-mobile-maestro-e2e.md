# Mobile Maestro E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install a local Android Maestro harness and execute five non-destructive mobile E2E flows against the Avihu preview app and `/test` API.

**Architecture:** A dedicated EAS profile builds an installable preview APK, stable React Native accessibility identifiers expose only the critical test surface, and repository-owned TypeScript tooling validates safety prerequisites before spawning Maestro. Five top-level YAML flows share login/reset subflows while producing independent results and local failure artifacts.

**Tech Stack:** Expo SDK 53, React Native 0.79, TypeScript, Vitest, EAS Build, Maestro CLI, Android Debug Bridge.

**Spec:** `docs/superpowers/specs/2026-09-27-mobile-maestro-e2e-design.md`

## Global Constraints

- Client repository only; do not modify Server database routing, Admin behavior, or profile visibility.
- Android is the required first target; preserve a path to future iOS Simulator support.
- Every flow must target `APP_TENANT=avihu`, `APP_ENV=preview`, and the existing preview `/test` API.
- Never silently fall back to production configuration.
- Never commit, print, or include E2E credentials in generated reports or Maestro YAML.
- The first five flows may login, read, navigate, and logout only; they may not create, update, or delete customer data.
- Use stable `testID`/accessibility selectors, not coordinates or view hierarchy selectors.
- Store generated Maestro reports, screenshots, and diagnostics only in a Git-ignored directory.

## Review Focus

- A production environment or production-only app identity must be rejected before Maestro launches; Task 1 tests the environment and app-ID policy.
- Missing or blank E2E credentials must fail authenticated runs without echoing values; Task 4 tests redacted validation errors and spawn arguments.
- A disconnected emulator or uninstalled app must produce a direct remediation error; Task 4 tests ADB discovery and package checks.
- A valid test user with no workout or diet plan must still pass navigation by asserting stable screen shells rather than customer-specific content; Tasks 2 and 3 pin those selectors and assertions.
- Hebrew copy, keyboard animation, or transient toasts must not make selectors timing-dependent; Tasks 2 and 3 use identifiers plus explicit visibility waits for durable states.

---

### Task 1: Preview E2E Build and Safety Configuration

**Files:**
- Create: `frontend/tools/e2e/config.ts`
- Create: `frontend/tools/e2e/__tests__/config.test.ts`
- Modify: `frontend/eas.json`

**Interfaces:**
- Consumes: Avihu's existing preview tenant identity and EAS `preview` environment.
- Produces: `E2E_APP_ID`, `E2E_ARTIFACT_DIR`, `E2E_FLOW_DIR`, `E2E_REQUIRED_ENVIRONMENT`, `E2E_TEST_API_STAGE`, and `resolveE2EConfig(processEnv)` returning a validated `E2EConfig`.

- [ ] **Step 1: Write failing configuration policy tests**

Add tests named:

- `accepts the Avihu preview app and test API stage`;
- `rejects production APP_ENV`;
- `rejects an API URL outside the test stage`;
- `rejects an unexpected app identifier`;
- `does not require credentials for anonymous flows`;
- `requires nonblank credentials for authenticated flows`.

Assert errors name missing variable keys but never contain supplied credential values.

- [ ] **Step 2: Run the configuration tests and verify failure**

Run: `cd frontend && npx vitest run tools/e2e/__tests__/config.test.ts`

Expected: FAIL because `tools/e2e/config.ts` does not exist.

- [ ] **Step 3: Implement the E2E configuration contract**

Implement:

```ts
export interface E2EConfig {
  appId: string;
  apiUrl: URL;
  artifactDir: string;
  flowDir: string;
  email?: string;
  password?: string;
}

export const resolveE2EConfig = (
  processEnv: Readonly<Record<string, string | undefined>>,
  options?: { requireCredentials?: boolean }
): E2EConfig => { /* validate preview/test/app identity and redact secrets */ };
```

Use exact public defaults `com.avihuteam.avihuteam`, `preview`, `.maestro`, and
`.maestro-artifacts`. Require `E2E_API_URL` to have pathname `/test` or `/test/`; do not accept a
production pathname.

- [ ] **Step 4: Add the EAS `e2e-test` build profile**

Extend preview configuration while overriding distribution/build requirements so Android produces
an APK without credentials and the profile sets `APP_TENANT=avihu`, `APP_ENV=preview`, channel
`preview`, and environment `preview`. Add a future-compatible iOS Simulator stanza without adding
iOS execution to this milestone.

- [ ] **Step 5: Run configuration and tenant config tests**

Run:

```bash
cd frontend
npx vitest run tools/e2e/__tests__/config.test.ts config/__tests__/createExpoConfig.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add frontend/eas.json frontend/tools/e2e/config.ts frontend/tools/e2e/__tests__/config.test.ts
git commit -m "test: add safe mobile e2e configuration"
```

### Task 2: Stable Mobile E2E Selectors

**Files:**
- Create: `frontend/src/constants/e2e.ts`
- Create: `frontend/src/constants/__tests__/e2e.test.ts`
- Modify: `frontend/src/components/Login/Login.tsx`
- Modify: `frontend/src/components/Login/LoginForm.tsx`
- Modify: `frontend/src/components/ui/toast/Toast.tsx`
- Modify: `frontend/src/components/dev/TenantEnvironmentBadge.tsx`
- Modify: `frontend/src/screens/HomeScreen.tsx`
- Modify: `frontend/src/screens/MyDietPlanScreen.tsx`
- Modify: `frontend/src/navigators/BottomTabNavigator.tsx`
- Modify: `frontend/src/navigators/tabs/BottomScreenNavigatorTabs.tsx`
- Modify: `frontend/src/components/User/Avatar.tsx`
- Modify: `frontend/src/screens/ProfileScreen.tsx`
- Modify: the root screen rendered by `WorkoutPlanStack` after identifying its current entry component

**Interfaces:**
- Consumes: React Native `testID`, `accessibilityLabel`, and React Navigation tab options.
- Produces: `E2E_TEST_IDS`, a frozen stable identifier map consumed by components and Maestro flows.

- [ ] **Step 1: Write failing selector-contract tests**

Create `e2e.test.ts` asserting that `E2E_TEST_IDS` contains unique kebab-case values for:

`loginRoot`, `loginEmail`, `loginPassword`, `loginSubmit`, `toastError`, `environmentBadge`,
`homeRoot`, `tabHome`, `tabWorkout`, `workoutRoot`, `tabDiet`, `dietRoot`, `profileOpen`,
`profileRoot`, and `logout`.

- [ ] **Step 2: Run the selector tests and verify failure**

Run: `cd frontend && npx vitest run src/constants/__tests__/e2e.test.ts`

Expected: FAIL because `src/constants/e2e.ts` does not exist.

- [ ] **Step 3: Add the stable selector map**

Export `E2E_TEST_IDS` with `as const`, using the `e2e-<domain>-<control>` naming convention. Keep
the file data-only so Node-based Vitest can import it without loading React Native.

- [ ] **Step 4: Wire selectors into the login and feedback surfaces**

Attach identifiers to the login root, email/password inputs, login button, error toast root, and
environment badge. Preserve Hebrew text, styles, accessibility semantics, and non-test behavior.

- [ ] **Step 5: Wire selectors into authenticated navigation surfaces**

Attach identifiers to the home, workout, diet, and profile screen roots; bottom-tab actions; avatar
profile action; and logout button. Assert screen roots even when the test account has no assigned
workout or diet plan.

- [ ] **Step 6: Run selector tests and typecheck**

Run:

```bash
cd frontend
npx vitest run src/constants/__tests__/e2e.test.ts
npm run typecheck
```

Expected: selector test PASS; typecheck does not gain any new errors relative to the recorded
baseline.

- [ ] **Step 7: Commit Task 2**

```bash
git add frontend/src/constants/e2e.ts frontend/src/constants/__tests__/e2e.test.ts \
  frontend/src/components/Login frontend/src/components/ui/toast/Toast.tsx \
  frontend/src/components/dev/TenantEnvironmentBadge.tsx frontend/src/screens \
  frontend/src/navigators frontend/src/components/User/Avatar.tsx
git commit -m "test: expose stable mobile e2e selectors"
```

### Task 3: Five Maestro Flows

**Files:**
- Create: `frontend/.maestro/config.yaml`
- Create: `frontend/.maestro/01-fresh-launch.yaml`
- Create: `frontend/.maestro/02-login-validation.yaml`
- Create: `frontend/.maestro/03-rejected-login.yaml`
- Create: `frontend/.maestro/04-successful-login.yaml`
- Create: `frontend/.maestro/05-navigation-and-logout.yaml`
- Create: `frontend/.maestro/subflows/login.yaml`
- Create: `frontend/.maestro/subflows/reset-to-login.yaml`
- Create: `frontend/tools/e2e/__tests__/flows.test.ts`
- Modify: `frontend/.gitignore`

**Interfaces:**
- Consumes: `E2E_TEST_IDS` values, `MAESTRO_E2E_EMAIL`, `MAESTRO_E2E_PASSWORD`, and
  `MAESTRO_APP_ID` injected by the runner.
- Produces: five independently runnable top-level flows; shared reset/login subflows; generated
  artifacts under `frontend/.maestro-artifacts/`.

- [ ] **Step 1: Write failing flow-contract tests**

Read `.maestro` files as text and assert:

- exactly five numbered top-level YAML flows exist;
- each declares `appId: ${MAESTRO_APP_ID}`;
- authenticated flows reference `${MAESTRO_E2E_EMAIL}` and `${MAESTRO_E2E_PASSWORD}`;
- every critical selector value from `E2E_TEST_IDS` appears in at least one flow;
- no email-like credential, password literal, mutation action, or production URL is committed;
- workspace configuration routes output to `.maestro-artifacts` and excludes `subflows` from
  top-level discovery.

- [ ] **Step 2: Run the flow-contract tests and verify failure**

Run: `cd frontend && npx vitest run tools/e2e/__tests__/flows.test.ts`

Expected: FAIL because the Maestro workspace and flows do not exist.

- [ ] **Step 3: Create workspace configuration and shared subflows**

Configure ordered discovery of the five numbered flows and `.maestro-artifacts` output. Implement
reset-to-login with `launchApp.clearState: true`, and implement credential injection only through
Maestro variables.

- [ ] **Step 4: Create anonymous flows 1–3**

Implement fresh launch, client validation, and rejected-login flows. Use test IDs for actions and
durable text/test-ID assertions for validation feedback. Do not reuse the real E2E password for the
rejected-login flow.

- [ ] **Step 5: Create authenticated flows 4–5**

Implement successful login plus core navigation/logout. The navigation flow must assert workout and
diet screen roots without assuming assigned plans, open Profile through the avatar identifier, log
out, and assert the login root returns.

- [ ] **Step 6: Ignore artifacts and run contract tests**

Add `.maestro-artifacts/` to `.gitignore` and run:

`cd frontend && npx vitest run tools/e2e/__tests__/flows.test.ts src/constants/__tests__/e2e.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add frontend/.maestro frontend/.gitignore frontend/tools/e2e/__tests__/flows.test.ts
git commit -m "test: add five Maestro mobile flows"
```

### Task 4: Local Android Runner, Installation, and Live Verification

**Files:**
- Create: `frontend/tools/e2e/processRunner.ts`
- Create: `frontend/tools/e2e/cli.ts`
- Create: `frontend/tools/e2e/__tests__/cli.test.ts`
- Create: `frontend/docs/testing/mobile-e2e.md`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: `resolveE2EConfig`, `adb`, `maestro`, the installed preview app, and five Maestro flows.
- Produces: `runE2EAndroid(dependencies): Promise<number>` plus npm scripts `e2e:preflight`,
  `e2e:android`, and `build:android:e2e`.

- [ ] **Step 1: Write failing runner tests**

Add tests named:

- `fails when Maestro is unavailable`;
- `fails when adb reports no authorized device`;
- `fails when the expected package is not installed`;
- `passes credentials to Maestro without writing them to output`;
- `writes HTML and debug artifacts under the ignored artifact directory`;
- `returns Maestro's nonzero exit status`.

Inject command execution and output writing as dependencies; do not spawn real processes in unit
tests.

- [ ] **Step 2: Run runner tests and verify failure**

Run: `cd frontend && npx vitest run tools/e2e/__tests__/cli.test.ts`

Expected: FAIL because the runner modules do not exist.

- [ ] **Step 3: Implement the process boundary and CLI**

Implement a small `spawn` wrapper that accepts `command`, `args`, and `stdio` without shell
interpolation. Implement `runE2EAndroid` to check `maestro --version`, `adb devices`, and
`adb shell pm path <appId>`, then execute:

```text
maestro test --config .maestro/config.yaml --format HTML
  --output .maestro-artifacts/report.html
  --debug-output .maestro-artifacts/debug
  -e MAESTRO_APP_ID=<public app id>
  -e MAESTRO_E2E_EMAIL=<secret>
  -e MAESTRO_E2E_PASSWORD=<secret>
  .maestro
```

Do not print the constructed argument array. Disable Maestro analytics and analysis prompts for the
run through environment variables.

- [ ] **Step 4: Add npm entry points and operator documentation**

Add scripts for building the E2E APK, running preflight only, and running Android E2E. Document
Homebrew Maestro installation, Java 17+ verification, Android emulator startup, EAS preview env
requirements, APK installation, shell credential injection, execution, artifacts, and common ADB
remediation. Do not show real credentials in examples.

- [ ] **Step 5: Install Maestro and record the local version**

Run:

```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
maestro --version
```

Expected: Maestro prints a version and exits zero.

- [ ] **Step 6: Run unit and static verification**

Run:

```bash
cd frontend
npx vitest run tools/e2e/__tests__ src/constants/__tests__/e2e.test.ts
npm run typecheck
npm run preflight -- --tenant avihu --environment preview
```

Expected: E2E/unit tests PASS; preflight PASS; typecheck has no new errors relative to baseline.

- [ ] **Step 7: Build/install the preview APK and execute all five flows**

Start an Android emulator, build or obtain the `e2e-test` APK, install it with ADB, export
`APP_ENV=preview`, `E2E_API_URL` pointing to `/test`, and the dedicated credential variables, then
run `npm run e2e:android`.

Expected: Maestro reports five discovered tests and five passes. On an intentional selector
failure, it must return nonzero and populate `.maestro-artifacts/debug` without revealing secrets.

- [ ] **Step 8: Commit Task 4**

```bash
git add frontend/tools/e2e frontend/docs/testing/mobile-e2e.md frontend/package.json
git commit -m "test: add local Android Maestro runner"
```

- [ ] **Step 9: Final branch verification**

Run:

```bash
cd frontend
npm run test:unit
npm run typecheck
git status --short
```

Expected: unit tests PASS; typecheck has no new errors relative to baseline; only intentional
runtime artifacts remain ignored.
