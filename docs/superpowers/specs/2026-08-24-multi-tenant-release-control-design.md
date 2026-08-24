# Multi-Tenant Release Control Design

## Purpose

Build a production-ready, project-local control system for developing, validating, and
releasing multiple branded mobile apps from the shared Expo React Native codebase. The system
must make the safe path the easy path: daily work is driven by a friendly selector, automated
builds use the same commands non-interactively, and invalid tenant or release combinations stop
before Expo, EAS, Apple, or Google can accept them.

The first registered tenant is `avihu`. Adding a tenant later must be an additive configuration
change, not a branch, repository fork, or rewrite of build scripts.

## Goals

- Require deliberate tenant selection for development, testing, builds, updates, and releases.
- Keep public tenant configuration typed, reviewable, and versioned.
- Keep secret values outside tenant files while validating that required secret names are set.
- Provide fast and release-grade preflight checks with readable remediation guidance.
- Generate and validate platform-correct branding assets from tenant-owned source artwork.
- Detect configuration drift between Expo configuration and locally generated native projects.
- Enable safe Android release optimization and migrate away from deprecated edge-to-edge APIs.
- Remove assets proven unused and report ambiguous assets without destructive guesses.
- Use the same validation engine locally, in EAS lifecycle hooks, and in future CI.

## Non-Goals

- Choosing a permanent secret-management vendor.
- Creating tenant-specific branches or repositories.
- Building tenant-specific business logic beyond typed feature flags.
- Designing tablet-specific interfaces in this phase.
- Enabling aggressive R8 full mode before standard shrinking has been release-tested.
- Automatically deleting an asset whose use cannot be proven either way.

## Operating Model

### Interactive control center

Running `npm run app` opens a terminal selector with these stages:

1. Tenant
2. Action
3. Environment or release profile when the action requires one
4. Platform when the action is platform-specific
5. Confirmation summary

Initial actions are:

- Start development server
- Run Android
- Run iOS
- Run fast preflight
- Run full release preflight
- Generate tenant assets
- Audit assets
- Build preview
- Build production
- Publish an update

The selector may remember the last tenant only to highlight it. It must never execute an action
without a fresh selection and confirmation. Production builds and updates require explicit
confirmation.

Before execution, the control center displays tenant ID, app name, environment, action, platform,
bundle identifier or package name, and release profile. It prints the reproducible command form
when starting an action or reporting a failure.

### Non-interactive operation

Automation uses the same entry point with explicit flags, for example:

```text
npm run app -- build android --tenant avihu --profile production --yes
```

Non-interactive operation fails when a required selection is absent. `--yes` is accepted only
when every required value is supplied explicitly; it does not provide defaults.

## Tenant Configuration

### Structure

Tenant configuration lives under:

```text
frontend/config/tenants/
  types.ts
  registry.ts
  avihu.ts
  assets/
    avihu/
      source/
      generated/
```

`types.ts` defines the configuration contract. `registry.ts` is the only tenant lookup entry
point and rejects unknown IDs. Each tenant module exports one validated data object.

### Tenant fields

The contract includes:

- Stable tenant ID and display name
- Expo slug, owner, project ID, and runtime-version strategy
- iOS bundle identifiers by environment
- Android package names by environment
- URL schemes by environment
- Source and generated branding asset paths
- Splash background and public brand colors
- Camera, photo, health, and other permission descriptions
- Supported platforms and intended orientation
- Public feature flags
- Names of required environment variables and secrets
- Optional store application identifiers once assigned

Tenant files contain no credential, API token, signing material, or other secret value. Secret
requirements are symbolic names such as `EXPO_PUBLIC_API_AUTH_TOKEN`; their values continue to
come from the process environment, EAS environment, or a future provider.

### Expo and runtime resolution

`app.config.ts` resolves the tenant from `APP_TENANT`, validates it, and constructs Expo config
from the tenant contract. It remains the single source for bundle identity, permissions, plugins,
assets, and build properties.

The app receives a deliberately limited public tenant snapshot through Expo `extra`. Private
environment values are not copied into that snapshot. A typed runtime helper exposes the tenant
ID, display name, brand tokens, and feature flags to application code.

Local native folders are generated artifacts and remain ignored by Git. The control center runs
Expo prebuild when a native run requires synchronization. Preflight compares resolved Expo config
with any local generated Android or iOS project and reports stale output; generated native files
never override the tenant registry.

### Development identity indicator

Development and internal-preview builds display a small tenant/environment badge. The badge is
disabled for store production builds and cannot be enabled through a remote update to a production
binary.

## Preflight Architecture

### Shared validation engine

The preflight engine is a set of small TypeScript checks with a common result contract:

```text
status: pass | warn | fail
check: stable machine-readable ID
summary: one-line result
details: supporting evidence
remediation: exact next action when applicable
```

The default renderer groups results for humans and uses consistent color and exit behavior. A
JSON renderer supports CI. Failures return a non-zero exit code. Warnings do not block unless the
release policy promotes that check to failure.

### Fast preflight

Fast preflight validates:

- Tenant schema and cross-field consistency
- Required environment-variable presence without printing values
- TypeScript compilation
- Unit tests
- Expo Doctor
- Expo dependency compatibility
- Bundle/package identity, scheme, owner, project ID, runtime version, and release-profile alignment
- App icon, adaptive icon, splash, and notification-icon constraints
- Duplicate or conflicting Expo plugins
- Android compile and target SDK expectations
- Edge-to-edge and orientation policy
- R8 release configuration
- iOS permission descriptions and bundle settings
- Resolved Expo configuration versus existing generated native projects

### Full release preflight

Full preflight runs the fast checks and adds:

- Clean native generation for the selected tenant and environment
- Android release lint
- R8-enabled Android release compilation
- Android App Bundle validation and artifact-size report
- Production JavaScript export and Expo Atlas-compatible bundle analysis
- iOS project/configuration validation on macOS
- Store asset and release metadata checks
- Source-map and Android R8 mapping-file presence checks
- Optional smoke-test execution when a compatible simulator, emulator, or device is available

Missing optional device infrastructure produces a warning. A failed configured smoke test is a
failure.

### Release policy

A versioned policy file assigns severity to intentional platform decisions. Portrait orientation
on phones is recorded as accepted for the current product and remains a warning. Missing tenant
selection, identity mismatches, invalid store assets, failing tests, incompatible Expo packages,
and disabled required release optimization are failures.

Policy suppressions require a reason and an expiry condition or review date. The report still
shows suppressed checks so accepted risk is visible.

### Build integration

Package scripts that launch preview or production EAS builds call the non-interactive preflight
entry point first. An EAS lifecycle hook repeats environment-safe checks in the remote builder so
local bypasses cannot produce a release. Future CI calls the same scripts and consumes the JSON
report; it does not reimplement validation in workflow YAML.

## Asset System

### Sources and generated outputs

Tenant source artwork is immutable input. Generated assets are deterministic outputs. For Avihu,
the supplied `COACH` artwork is preserved visually while platform transformations perform only
the operations required for store compatibility: resizing, safe-zone placement, alpha removal,
background composition, and monochrome notification-mask generation.

Generation produces:

- Opaque Apple 1024-by-1024 icon
- Android legacy icon input
- Android adaptive foreground and background inputs
- Android monochrome notification icon
- Splash input
- Mask previews for representative Apple and Android icon shapes

The generated manifest records input hash, generator version, dimensions, color model, alpha
state, and output paths. `assets:check` fails when outputs are missing or stale.

### Validation

Asset checks cover:

- File existence and decodability
- Expected PNG dimensions and square aspect ratio where required
- Apple icon opacity
- Android adaptive foreground transparency and safe-zone occupancy
- Android notification icon transparency and monochrome silhouette
- Splash compatibility
- Tenant path isolation
- Expo config references pointing only to the selected tenant

### Unused-asset cleanup

The audit builds a reference set from TypeScript/JavaScript imports, static `require` calls, Expo
configuration, tenant configuration, plugins, native templates, font loading, test fixtures, and
explicit dynamic-asset allowlists.

Assets are classified as:

- Used
- Generated and stale
- Proven unused
- Ambiguous dynamic reference

Only stale generated files and proven-unused files may be removed automatically. Ambiguous files
remain and appear in the report with the reason they could not be classified. Deletions remain
ordinary Git changes and are recoverable through version control. Build output, `.expo`, Pods,
Gradle output, and `node_modules` are excluded from source-asset analysis.

## Android Production Readiness

### R8

Release builds enable standard R8 minification and resource shrinking. Development builds remain
unminified. The build retains R8 mapping output for deobfuscation and records artifact size for
comparison.

Initial smoke coverage includes startup, authentication, barcode scanning, Health Connect,
notifications, background tasks, diet-plan history, PDFs, signatures, and Expo Updates. Required
keep rules must be narrow and justified by an affected native integration. R8 full mode remains
disabled in this phase.

### Edge-to-edge

The migration removes the deprecated Android opt-out and fixed system-bar colors. Shared layout
code uses `react-native-safe-area-context` insets rather than `StatusBar.currentHeight` or fixed
top/bottom bar assumptions.

The affected headers, modals, scrolling screens, barcode camera, bottom navigation, three-button
navigation, gesture navigation, display cutouts, and keyboard forms receive focused regression
coverage. This is a compatibility migration, not a visual redesign.

### Large screens

Portrait remains the intended phone experience. Large-screen adaptability is an acknowledged
warning rather than a release failure. The app must remain usable if Android overrides orientation
or resizability on a large display, but a dedicated tablet layout is outside this phase.

## Dependency and Test Health

The implementation aligns Expo packages with SDK 53 before relying on their config plugins,
including replacing the incompatible `expo-build-properties` version and removing duplicate
plugin entries. The project-local EAS CLI dependency is removed in favor of reproducible `npx`
invocation with a version policy owned by the control center.

Existing timezone-dependent tests are made deterministic by specifying the intended timezone or
by testing explicit local/UTC semantics. The fix must preserve application behavior and must not
change a date rule merely to satisfy the developer machine timezone.

Unmaintained or New-Architecture-untested native dependencies are reported with ownership and
migration notes. They are not replaced in this phase unless they prevent release validation or
R8 operation.

## Error Handling and Usability

- Errors lead with what failed and show the exact safe remediation command.
- Secret values are never logged; only missing symbolic names are displayed.
- Destructive cleanup supports report-only mode and requires confirmation outside CI.
- Child-process failures preserve the original exit code and show the command that failed.
- Interactive cancellation exits without changing files.
- Generated changes are summarized before native generation or asset cleanup proceeds.
- The control center uses maintained libraries for prompts, schema validation, image processing,
  and command parsing instead of custom terminal or image implementations.

## Testing Strategy

- Unit tests cover tenant lookup, schema validation, CLI argument resolution, release policy,
  asset metadata validation, reference extraction, and result severity/exit behavior.
- CLI integration tests use temporary fixtures and non-interactive flags; they never invoke a real
  store submission.
- Asset generator tests verify deterministic output metadata and platform constraints.
- Configuration snapshot tests resolve Expo config for Avihu development, preview, and production
  identities.
- Native release validation uses clean generated projects rather than cached local native folders.
- Existing application unit tests remain part of fast preflight.
- Manual device smoke tests are documented until stable flows can be automated without credentials
  or personal health data.

## Delivery Sequence

1. Stabilize dependency compatibility and timezone-sensitive tests.
2. Add tenant types, Avihu configuration, resolver, and configuration snapshots.
3. Add the interactive/non-interactive control center.
4. Add the shared preflight engine and release policy.
5. Add deterministic asset generation, validation, previews, and conservative audit/cleanup.
6. Wire local commands and EAS lifecycle hooks to the shared preflight.
7. Enable and verify standard R8/resource shrinking.
8. Migrate and verify edge-to-edge layout handling.
9. Run the full release preflight and document tenant onboarding and release operation.

Each sequence step must leave the Avihu development workflow usable and must not publish, submit,
or update a store application automatically.

## Acceptance Criteria

- `npm run app` offers a usable selector and never silently chooses a tenant or production action.
- Non-interactive commands reject incomplete or contradictory tenant selections.
- Avihu resolves explicit, validated development, preview, and production identities; environments
  may intentionally share a store identity only when the tenant configuration declares that choice.
- Adding a tenant requires a tenant module and tenant assets, not build-script duplication.
- Fast preflight emits readable and JSON reports with correct exit codes.
- Full preflight validates a clean R8-enabled Android release artifact.
- EAS builds repeat applicable preflight checks.
- Apple, Android adaptive, and Android notification assets satisfy their respective constraints.
- Asset audit removes only proven-unused or stale generated files and reports ambiguity.
- Expo/native configuration drift is detected before a build.
- Edge-to-edge no longer relies on deprecated opt-out settings or manual status-bar heights.
- Portrait-only phone intent remains documented without pretending Android large-screen overrides do
  not exist.
- Documentation explains tenant onboarding, local development, preflight, preview builds,
  production builds, cleanup, and failure recovery.
