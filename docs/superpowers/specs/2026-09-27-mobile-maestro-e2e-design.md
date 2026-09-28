# Mobile Maestro E2E Design

## Goal

Add a small, repeatable end-to-end suite for the Expo mobile client that runs the compiled app on
an Android emulator and catches release-blocking failures before store submission. The first
milestone must execute at least five Maestro flows against the existing `/test` API without
creating or mutating customer data.

This milestone intentionally does not change Server database selection, add test-profile flags,
or alter Admin visibility. Test-data isolation needs a separate design because incomplete filtering
could affect lists, counts, analytics, exports, caches, and custom queries.

## Approach

Use the open-source Maestro CLI as a black-box mobile test runner. Keep flow definitions in the
Client repository under `frontend/.maestro/` and add repository-owned scripts so contributors do
not need to remember raw commands.

Android is the first supported execution target. The configuration should remain compatible with
adding iOS Simulator execution later, but iOS automation is not required for this milestone.

The test app will use the existing Avihu preview environment and `/test` API URL. A dedicated
existing login supplies authenticated coverage. Credentials are injected at execution time through
environment variables and must never be committed to Git, embedded in Maestro YAML, printed in
reports, or copied into generated artifacts.

## Build and Environment

Add an `e2e-test` EAS build profile that:

- selects `APP_TENANT=avihu` and `APP_ENV=preview`;
- reads the existing preview EAS environment;
- produces an installable Android APK without store credentials;
- leaves room for a future iOS Simulator build;
- retains the visible non-production environment badge.

Before a test run, repository scripts must validate:

- the expected app identifier;
- the selected environment is preview, never production;
- the API URL is present and targets the intended `/test` endpoint;
- the E2E email and password variables are present only for authenticated flows;
- an emulator/device is connected and the app is installed.

The suite must fail before launching Maestro if these requirements are not met. It must not silently
fall back to production configuration.

## Initial Test Flows

Each numbered scenario is a separate Maestro flow so results identify the failing behavior clearly.

1. **Fresh launch** — clear app state, launch the app, and verify the login screen and preview/test
   environment indicator are visible.
2. **Client-side login validation** — submit an invalid email and empty password, remain on login,
   and verify the validation state without sending a successful write.
3. **Rejected login** — submit syntactically valid but incorrect credentials and verify the
   user-facing authentication error.
4. **Successful login and authenticated shell** — inject the dedicated E2E credentials, log in,
   and verify the home screen and bottom navigation load.
5. **Core navigation and logout** — log in, open the workout, diet, and profile destinations,
   verify each destination renders without a crash, log out, and verify the login screen returns.

Flows may call shared YAML subflows for login or reset behavior, but the five top-level flows remain
independently runnable and reportable.

## Selectors and App Changes

Prefer stable accessibility identifiers over coordinates or visual hierarchy. Add narrowly scoped
`testID` and `accessibilityLabel` values to:

- login root, email field, password field, submit button, and error feedback;
- authenticated home shell;
- workout, diet, profile, and relevant bottom-tab actions;
- logout button;
- preview/test environment badge.

These identifiers are inert in production and do not expose credentials or customer data. Existing
Hebrew text can remain as a secondary assertion, but it should not be the only selector for critical
actions.

## Data and Safety

The first suite is non-destructive:

- it does not register users;
- it does not create, update, or delete workouts, diet plans, measurements, photos, forms, or other
  customer-owned records;
- it uses only login, reads, navigation, and logout;
- it clears local app state between flows;
- it never targets the production API URL.

If later tests need write coverage, they require a separately approved lifecycle for seeded test
records and cleanup. A `DEV` or `TEST` visibility flag is explicitly out of scope here.

## Local Execution and Reporting

Add npm scripts for environment validation and Maestro execution. A local run should:

1. verify prerequisites and environment selection;
2. run the five flows serially against an installed Android build;
3. return a non-zero exit code when any flow fails;
4. save Maestro diagnostics and screenshots under a Git-ignored artifact directory;
5. print a concise pass/fail summary without credential values.

The first verification target is the developer's local Android emulator. CI, scheduled execution,
iOS Simulator execution, and store-submission gating are follow-up milestones after local stability
is demonstrated.

## Verification

Implementation is complete when:

- Maestro is installed and its version is recorded in the handoff;
- the Client unit suite and typecheck retain their existing status;
- the E2E preflight rejects missing credentials and production targeting;
- all five top-level Maestro flows are discovered;
- all five flows execute on Android;
- passing output and failure artifacts are demonstrated without leaking credentials;
- documentation explains setup, build installation, execution, and troubleshooting.

If live authentication cannot run because a dedicated credential is unavailable, implementation is
not considered complete; the flow may not be weakened or silently mocked.
