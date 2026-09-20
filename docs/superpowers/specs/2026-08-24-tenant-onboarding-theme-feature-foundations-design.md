# Tenant Onboarding, Theme, and Feature Foundations Design

## Context

The repository already selects validated tenant configuration for Expo, generates tenant-owned
native assets, and routes local and release commands through shared app-control and preflight
systems. The remaining onboarding path is manual, application colors are still split between the
theme and hardcoded feature palettes, and the current `featureFlags` object mixes localization
policy with the idea of application feature availability.

This change makes adding a tenant an end-to-end supported workflow. It also establishes clear
boundaries between tenant appearance, ordinary JavaScript feature defaults, future server
entitlements, and native capabilities that require a compatible binary.

The implementation branch is `codex/tenant-onboarding-foundations`, created directly from
`f-multi-tenant-support` after verifying that branch contains merge commit `73a721b` and the full
`codex/multi-tenant-release-control` tip `616bc5d`.

## Goals

- Add an interactive `npm run tenant:add` workflow for both future repository tenants and ignored
  local test tenants.
- Exercise the complete onboarding path locally before committing a real tenant.
- Let the operator provide source logo artwork and create a valid neutral fallback when omitted.
- Give every tenant separate app identity, branding, semantic theme values, JavaScript feature
  defaults, and native-capability declarations.
- Preserve Elevate Coach's current appearance by mapping every migrated Avihu color, including
  intentional Diet Plan V2, steps, graph, calendar, form, modal, and scanner colors, to the Avihu
  tenant theme.
- Keep all Avihu JavaScript feature defaults enabled without changing current navigation or screen
  visibility.
- Prepare feature resolution for a future SaaS entitlement source without implementing network or
  backend integration.
- Prevent server-delivered or JavaScript-only flags from enabling native behavior absent from the
  installed binary.
- Reuse the existing asset generator, asset validator, Expo configuration resolver, app control,
  and fast preflight rather than introducing parallel tenant-selection logic.
- Keep ignored test-tenant source, configuration, assets, and generated output out of Git.

## Non-Goals

- Fetching entitlements from a backend, SaaS provider, or remote configuration service.
- Hiding screens, changing routes, or altering Avihu behavior based on feature flags in this phase.
- Generating a professional or AI-designed brand identity.
- Publishing, building, updating, or submitting a tenant automatically.
- Creating native packages or capabilities dynamically at JavaScript runtime.
- Redesigning existing Elevate Coach screens while migrating their colors.
- Replacing the current deterministic platform asset generator.

## Tenant Configuration Boundaries

The validated tenant contract remains the single public configuration source. Its concerns become
explicit rather than being combined under broad `brand` or `featureFlags` fields:

- **Identity and release:** tenant ID, display name, Expo slug/owner/project, app version, update
  URL, supported platforms, environment-specific bundle/package IDs, and URL schemes.
- **Branding:** tenant logo asset references and native splash, icon, and notification colors.
- **Semantic theme:** the complete application color contract consumed by React components,
  navigation, calendars, graphs, and feature-specific presentation.
- **Localization:** RTL support and forced direction. These values are policy, not feature flags.
- **JavaScript feature defaults:** explicit named booleans describing current product areas.
- **Native capabilities:** explicit build-time booleans for capabilities whose packages, plugins,
  permissions, or native code must exist in the binary.
- **Permissions and build properties:** user-facing native permission copy, Android permissions,
  SDK levels, and release optimization.

The public runtime snapshot includes only the fields application JavaScript needs: tenant identity,
environment, semantic theme, localization policy, JavaScript feature defaults, native-capability
availability, and the existing environment-badge policy. It continues to exclude secret values.

## Repository and Local Tenant Modes

`tenant:add` begins by choosing one of two output modes. Both modes produce the same validated
tenant shape and run the same generation and verification pipeline.

### Repository tenant

A repository tenant is intended to become a real white-label application. The workflow:

- Creates `frontend/config/tenants/<tenant-id>.ts`.
- Creates source and generated artwork below
  `frontend/config/tenants/assets/<tenant-id>/`.
- Adds the tenant import and registry entry through a focused registry-update helper.
- Prompts for real Expo owner, project ID, update URL, app version, platform support, permissions,
  and development/preview/production identities.
- Refuses placeholder release data and refuses collisions with every registered tenant.
- Leaves ordinary uncommitted Git changes for review; it does not commit them automatically.

### Local test tenant

A local tenant exercises the same onboarding flow without becoming repository source. It may use
any valid tenant ID, including `test-tenant`; the workflow does not reserve one global name. The
workflow:

- Creates a TypeScript tenant module beneath an ignored local-tenant directory.
- Creates its source and generated assets beneath an ignored local-assets directory.
- Uses a committed optional local loader that discovers TypeScript tenant modules only in that
  directory, validates each export, sorts them deterministically, and rejects collisions.
- Marks the tenant as local-only in validated configuration.
- Generates isolated development, preview, and production-shaped identifiers so configuration can
  be resolved for every environment without matching a store application.
- Allows development start/run, asset operations, and fast validation.
- Rejects EAS builds, updates, release preflight, and other release actions before invoking a child
  process.
- Verifies every created path is ignored by Git.

The local loader is used only by Node-based configuration and tooling. Application runtime code
continues to consume the resolved public snapshot and never scans the filesystem.

## Interactive `tenant:add` Workflow

The new package script invokes a focused TypeScript CLI built from independently testable prompt,
scaffold, registry, logo, and verification units.

The interactive sequence is:

1. Choose repository or local-test mode.
2. Enter and validate tenant ID and display name.
3. Select supported native platforms.
4. Enter identity and release properties. Local mode receives visibly labeled, isolated defaults;
   repository mode requires real values.
5. Enter a semantic palette. Defaults are deliberately distinct from Avihu and each value is shown
   with its semantic purpose.
6. Enter an optional logo path.
7. Review a summary containing output mode, paths, native identities, scheme, theme values, native
   capabilities, and JavaScript defaults.
8. Confirm creation.
9. Scaffold into a temporary staging directory, publish the tenant files, run existing asset
   generation and validation, resolve Expo configuration, and run the relevant shared checks.
10. Print the exact development launch command and, for a repository tenant, the files that should
    be reviewed and committed.

Cancellation before confirmation writes nothing. The workflow refuses to overwrite an existing
tenant module or asset directory. If validation fails after publication, it removes only paths
created by the current invocation and restores a registry file changed by that invocation. It never
deletes or rewrites a pre-existing tenant.

The command remains interactive in this phase. Pure argument parsing and dependency-injected prompt
functions keep a future non-interactive mode possible without weakening current confirmation.

## Logo Input and Fallback

The operator may provide PNG, JPEG, WebP, or another format decodable by Sharp. The workflow checks
that the source exists, is a regular file, decodes successfully, has nonzero dimensions, and is not
fully transparent. It normalizes the source to sRGB PNG at the canonical
`source/app-icon.png` path while preserving meaningful transparency.

When the path is empty, the workflow renders a neutral geometric mark from an inline SVG using
Sharp. The mark uses the selected primary and on-primary semantic colors, contains a simple
high-contrast shape rather than font-dependent text, and is deterministic for the tenant ID. The
result is valid input for Apple, Android adaptive, notification-mask, splash, runtime-logo, and
preview generation. Output messaging labels it as fallback artwork that must be replaced before a
real store release.

The fallback is not random and does not attempt brand design. Determinism makes regeneration,
testing, and review reliable.

## Semantic Theme Architecture

The tenant theme is a strict, fully populated schema. It includes common application roles such as:

- Primary, secondary, accent, and inverse actions plus their readable foreground values.
- App background, surfaces, elevated/subtle surfaces, disabled states, outlines, dividers, shadows,
  scrims, and backdrops.
- Primary, secondary, muted, disabled, and inverse text.
- Success, warning, error, and information foreground/container roles.
- Interaction states such as pressed, selected, focus, and input placeholder/error treatment.
- Intentional feature roles for diet, step progress, health states, graphs, calendars, forms, image
  overlays, and barcode-scanner overlays.

Feature-specific groups remain semantic: for example, a scanner group describes viewfinder,
overlay, detected, and panel roles rather than exposing arbitrary green-numbered palette entries.
This keeps a tenant free to express a different visual language without changing feature code.

`ThemeProvider` initializes synchronously from the validated runtime tenant snapshot. The existing
font mapping and style-hook APIs remain stable. Components use `useThemeContext()` or shared style
hooks; feature helpers that render outside React receive the relevant semantic colors as input.

### Avihu preservation

The Avihu tenant owns an explicit theme object whose values reproduce the current Elevate Coach
appearance. Existing theme values and intentional colors introduced by newer features are mapped
without normalization, aesthetic cleanup, or palette substitution. Case-only hex differences may
be canonicalized only when they represent the same rendered color.

Tests assert the Avihu semantic mapping values and confirm the resolved runtime theme is identical
in development, preview, and production. The migration changes color ownership, not appearance.

### Hardcoded-color audit

The implementation inventories application color literals under `frontend/src` and classifies each
as a shared semantic role, a feature semantic role, or a technical exception. Reusable and
intentional application colors move into the tenant theme. A source audit test prevents new
hardcoded application colors outside approved theme-definition files.

The exception list is narrow and documented. It may include `transparent`, values computed from a
runtime input, and non-application tooling masks or previews. A literal is not exempt merely because
it appears in an SVG component, graph, calendar, scanner, or newer feature.

## JavaScript Features and Future Entitlements

The tenant schema contains an explicit record of named JavaScript feature defaults. Avihu declares
all current defaults as `true`, including the currently available chat, articles, diet, smart-food,
workout, step-tracking, progress, forms/agreements, media capture, and notification experiences.
The exact catalog is centralized so tenants cannot silently invent misspelled flag names.

A pure resolver accepts:

```text
tenant defaults + optional entitlement overrides -> resolved JavaScript feature availability
```

The optional override type is the future integration seam. No remote client, query hook, provider,
cache, loading state, or failure policy is implemented in this phase. With no overrides, resolution
returns the tenant defaults. Unknown keys are rejected at validation boundaries.

No screen or navigator consumes these resolved values to alter behavior in this phase. The runtime
helper makes them available for a later gated-feature change without requiring another tenant-schema
migration.

## Native Capabilities

Native capabilities are a separate strict contract. Initial capabilities cover installed behavior
such as camera/barcode capture, photo library access, notifications, background tasks, Apple Health,
Android Health Connect, and iOS Live Activities.

Native capability values are fixed when Expo configuration creates the binary. They determine
whether associated plugins, permission descriptions, native permissions, and native modules are
included. JavaScript feature resolution may hide or reveal behavior only within that binary's
declared capability set; a future server entitlement can never turn a missing native capability on.

Cross-field validation rejects impossible combinations, including a JavaScript default that
requires a native capability the tenant disables. Avihu declares every currently installed native
capability required by existing behavior, preserving the current Expo plugin and permission output.

## Validation and Safety

The onboarding workflow performs validation in layers:

- Prompt validation for IDs, semantic versions, UUIDs, URLs, schemes, bundle IDs, Android package
  names, readable permission text, paths, and six-digit hex colors.
- Contrast checks for required foreground/background semantic pairs.
- Tenant schema and cross-field capability/feature validation.
- Registry collision checks across tenant ID, Expo slug/project, scheme, iOS bundle ID, and Android
  package ID for every environment.
- Source-logo decoding and content checks.
- The existing asset generator followed by the existing generated-asset validator.
- Expo configuration resolution for development, preview, and production.
- Local-mode release-policy rejection tests and Git-ignore verification.
- Fast development preflight for the new tenant using the existing preflight engine.

The workflow never prints environment-variable values or secrets. A failed child process preserves
its exit status and command in the error message. The final success summary prints:

- Tenant display name and ID.
- Output mode and created paths.
- Development bundle/package identities.
- Whether supplied or fallback artwork was used.
- Asset-validation and preflight status.
- The exact command to launch the tenant, for example
  `npm run app -- start --tenant test-tenant --environment development --yes`.

## Git Hygiene

Committed `.gitignore` rules target only the local-tenant configuration root, local-tenant asset
root, and temporary onboarding staging/output. They do not ignore normal tenant modules or normal
tenant asset directories.

Automated tests use temporary directories and verify ignored-path classification without creating a
persistent test tenant. End-to-end manual verification creates a local `test-tenant`, checks that
`git status --short` shows no tenant/configuration/artwork files, validates and launches its resolved
configuration, and then leaves the ignored tenant available for the user's own testing. The tenant
is not deleted automatically after successful creation.

## Testing Strategy

Implementation follows the existing Vitest convention and introduces no new test framework.
Focused tests cover:

- Expanded tenant schema, localization, semantic-theme completeness, JavaScript defaults, native
  capabilities, and cross-field rules.
- Avihu identity, all-enabled feature defaults, native capability output, and exact semantic colors.
- Future entitlement override resolution without backend behavior.
- Runtime tenant parsing and theme initialization.
- Local tenant discovery, deterministic ordering, malformed exports, and collision rejection.
- Repository-registry updates that preserve formatting and refuse duplicate edits.
- Interactive prompt validation, cancellation, summaries, and mode-specific requirements.
- Supplied-logo normalization and deterministic fallback-logo validity.
- Transactional scaffold cleanup and refusal to overwrite existing paths.
- App-control rejection of local release/build/update actions.
- Asset generation and validation through the existing implementation.
- Git-ignore verification and exact printed launch commands.
- Source color-audit enforcement.

Final automated verification runs focused unit tests, the complete unit suite, strict TypeScript
checking, Prettier verification on changed files, Avihu asset validation, Avihu fast preflight, and a
local test-tenant creation/validation exercise. No EAS build, update, store submission, or merge is
performed.

## Delivery Sequence

1. Expand the tenant contract and migrate Avihu to explicit localization, semantic theme, feature
   defaults, native capabilities, and local/repository mode metadata.
2. Add runtime theme and feature-resolution foundations while preserving Avihu behavior.
3. Audit and migrate application colors into tenant semantic roles.
4. Add local tenant discovery and local-only release enforcement.
5. Build logo normalization/fallback generation and transactional scaffold helpers.
6. Add the interactive `tenant:add` workflow and repository-registry update path.
7. Run the full local tenant journey, confirm Git hygiene, and document onboarding operation.

Each step leaves Avihu usable and testable. No step publishes an app or changes current feature
visibility.

## Acceptance Criteria

- `f-multi-tenant-support` ancestry and the completed release-control merge are recorded and the
  implementation lives on `codex/tenant-onboarding-foundations`.
- `npm run tenant:add` can scaffold either a real repository tenant or an ignored local test tenant.
- The operator may provide source logo artwork; omission creates a valid, deterministic fallback and
  clearly warns that it must be replaced before release.
- Repository tenants receive reviewable TypeScript configuration and registry changes.
- Local tenants use the same schema, Expo resolution, theme, features, native capabilities, assets,
  and fast validation while remaining invisible to Git.
- Local tenants cannot invoke release preflight, EAS builds, or updates.
- Every tenant owns strict semantic theme values and explicit JavaScript feature defaults.
- Avihu has all current JavaScript defaults enabled and no screen or navigation behavior changes.
- Avihu's resolved appearance remains unchanged after color ownership moves into his tenant theme.
- Future entitlement overrides have a typed pure resolution seam but no backend integration.
- Native capabilities remain build-time declarations that remote JavaScript data cannot enable.
- Shared application colors no longer bypass the semantic tenant theme, with only documented
  technical exceptions.
- Existing tenant asset generation, asset validation, Expo configuration, app control, and preflight
  remain the shared implementation paths.
- The successful workflow prints an exact launch command and performs no merge or publication.
