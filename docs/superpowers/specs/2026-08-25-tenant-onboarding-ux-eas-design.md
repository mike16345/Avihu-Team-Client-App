# Tenant Onboarding UX, Theme Recipes, and EAS Setup Design

**Date:** 2026-08-25

**Status:** Approved in chat; awaiting review of this written specification

**Extends:**
`docs/superpowers/specs/2026-08-24-tenant-onboarding-theme-feature-foundations-design.md`

## Objective

Make `npm run tenant:add` practical for real tenant onboarding without weakening the strict tenant
theme, feature, native-capability, asset, or release-safety contracts already established.

The refined workflow must:

- avoid asking operators to enter a large semantic color catalog manually;
- offer curated theme presets and a versioned JSON theme recipe;
- keep generated tenant modules readable by separating themes and feature/capability defaults;
- offer Create, Link, and Skip choices for EAS project setup;
- avoid fake Expo project UUIDs when EAS setup is skipped;
- isolate EAS CLI writes from the multi-tenant repository;
- make remote-project creation an explicit external action; and
- preserve Avihu's exact current app identity, appearance, feature defaults, native capabilities,
  Expo configuration, and release behavior.

Backend entitlement integration remains outside this work.

## Operator Experience

### Tenant mode

The existing first choice remains:

- **Local test:** ignored local configuration and assets, with release actions prohibited.
- **Repository tenant:** reviewable configuration and assets intended for a real tenant.

Local tenants always skip EAS setup. Repository tenants receive the EAS Create/Link/Skip choice
after all local inputs have passed validation.

### Theme choice

The operator chooses one of:

1. **Avihu** — the exact current Avihu semantic mapping.
2. **Ivory / Orange / Blue** — ivory surfaces, orange accents, and blue primary identity.
3. **Violet / Amber** — the existing visibly distinct test palette.
4. **Import JSON recipe** — a versioned foundation palette with optional semantic overrides.

The command does not prompt for every semantic token. It shows the selected foundation colors,
contrast results, and any override count before confirmation.

The initial preset catalog is intentionally small. Adding a preset later is a typed data change and
does not require modifying the prompt flow.

### Logo choice

The existing behavior remains:

- a supplied PNG or JPEG is normalized to the canonical source PNG; or
- a blank path produces the deterministic geometric fallback.

Repository tenants using fallback artwork receive a replacement-before-release warning.

### EAS choice

Repository onboarding offers:

- **Create new EAS project**
- **Link existing EAS project**
- **Skip for now**

Create and Link are optional. Skip produces a valid development tenant with explicit pending EAS
state rather than placeholder UUIDs.

## Theme Recipe Architecture

### Recipe format

The public JSON recipe format is strict and versioned:

```json
{
  "schemaVersion": 1,
  "foundation": {
    "primary": "#174A7E",
    "onPrimary": "#FFFFFF",
    "accent": "#E97824",
    "onAccent": "#FFFFFF",
    "background": "#FFF9ED",
    "onBackground": "#17212B"
  },
  "overrides": {
    "scanner": {
      "viewfinder": "#21A179"
    }
  }
}
```

`overrides` is optional and accepts a strict deep partial of the semantic tenant color contract.
Unknown groups, unknown leaves, malformed colors, and unsupported schema versions fail with exact
JSON paths. The recipe never accepts functions, imports, secrets, or executable content.

### Expansion

A pure `createTenantTheme(recipe)` function expands the six foundation colors into the complete
strict `TenantTheme`. Expansion includes shared surfaces and text plus the Diet, steps, graph,
calendar, scanner, overlay, and application semantic groups. Overrides are applied after expansion,
then the complete result is schema-validated.

Expansion is deterministic: the same recipe version and contents produce the same theme. Tests own
the generated values for every built-in preset so compiler changes cannot silently alter existing
appearance.

### Avihu preservation

Avihu's theme module contains its exact current semantic mapping as explicit overrides on the theme
foundation. It is snapshot-tested against the current values, including intentional palettes from
Diet V1/V2, smart-food, scanner, health/steps, graph, agreement, notifications, articles, and
developer tools.

Choosing the Avihu preset reproduces this mapping. Refactoring the storage shape must not change any
rendered Avihu color.

## Tenant Source Layout

Repository tenants use a responsibility-based folder:

```text
config/tenants/<tenant-id>/
  index.ts
  theme.ts
  features.ts
```

Ignored local tenants use the same shape:

```text
config/tenants/.local/<tenant-id>/
  index.ts
  theme.ts
  features.ts
```

Responsibilities:

- `index.ts` owns app identity, localization, platforms, asset declarations, permissions,
  environment identities, EAS state, and imports of the other tenant records.
- `theme.ts` owns the selected preset/recipe and semantic overrides.
- `features.ts` owns JavaScript feature defaults and native binary capabilities as separate values.

The registry imports the tenant folder entry point. Local discovery accepts only regular tenant
directories containing exactly the expected entry files, rejects symlinks, and sorts by tenant ID.
The exact `.local/` ignore roots continue to contain all generated local source and assets.

Existing imports such as `./avihu` continue resolving through `avihu/index.ts`. The migration removes
the prior flat module only after all imports and tests resolve against the folder entry point.

## EAS State Contract

Tenant EAS configuration becomes a discriminated union:

```ts
type TenantEasConfig =
  | {
      status: "linked";
      owner: string;
      projectId: string;
      updateUrl: string;
    }
  | {
      status: "pending";
    };
```

Avihu migrates to `status: "linked"` with its existing owner, UUID, and update URL.

Pending tenants omit EAS project/update fields from resolved Expo configuration. They may use local
development paths, but build, update, release preflight, EAS preflight, and any action requiring an
EAS project fail before starting a child process with remediation pointing to `tenant:eas`.

No fake UUID or placeholder update URL is stored for local or pending repository tenants.

## EAS Create, Link, and Resume

### Authentication and owner

The workflow uses the repository's pinned EAS CLI version. It runs `eas whoami` before Create or
Link. If unauthenticated, it stops with the exact `eas login` remediation; tenant tooling does not
collect Expo passwords or tokens.

For Create, the logged-in username is the default owner. The operator may replace it with an Expo
organization/account name. Owner means the account that owns the EAS project, not necessarily the
currently authenticated username.

### Isolated EAS workspace

EAS CLI never runs project initialization directly against the multi-tenant repository. Tooling
creates an ignored temporary workspace containing only the minimal package/app configuration for
the selected tenant slug, display name, icon, and requested owner.

Create runs the pinned equivalent of:

```text
eas project:init --account <owner> --json --non-interactive
```

Link runs the pinned equivalent with:

```text
eas project:init --id <project-id> --json --non-interactive
```

The result and isolated generated configuration are parsed and cross-checked. The returned project
ID must be a UUID; owner and slug must match the confirmed tenant selection. Repository `app.json`
and shared dynamic Expo configuration are never writable targets of these commands.

### External confirmation

Create displays the exact owner and slug and requires a dedicated confirmation immediately before
the external command. This confirmation is distinct from the earlier local scaffold summary. Link
also confirms the target project ID, but it does not create a new remote project.

### Resume command

Pending repository tenants can complete setup later with:

```sh
npm run tenant:eas -- --tenant <tenant-id>
```

This command offers Create or Link, updates only the tenant's EAS state, resolves every Expo
environment, runs fast preflight, and prints the next valid build command. It refuses already-linked
tenants unless an explicit future relink workflow is designed separately.

## Transaction Ordering

The local work is validated before any external EAS mutation:

1. Validate identity, localization, feature defaults, capabilities, recipe, overrides, and logo.
2. Render the tenant folder into ignored `.tenant-add/` staging.
3. Expand and validate the complete theme.
4. Generate and validate all assets using staged/transient tenant registration.
5. Resolve all three Expo environments in pending-EAS mode.
6. Run all local checks that do not require a linked EAS project.
7. Process Create, Link, or Skip.
8. If linked, inject returned EAS metadata and revalidate all Expo environments.
9. Atomically publish the tenant folder, assets, and marker-bound registry edit.
10. Run final fast preflight and print launch/review guidance.

Cancellation or failure before step 7 removes only invocation-created staging paths and leaves the
repository byte-for-byte unchanged.

## Remote Success and Local Failure Recovery

Remote project creation cannot be treated as a rollback-safe filesystem operation. The tooling must
not automatically delete an EAS project.

If Create succeeds but a later local step fails:

- preserve an ignored recovery record under `.tenant-add/recovery/<tenant-id>.json`;
- record only non-secret tenant ID, owner, slug, project ID, update URL, and timestamp;
- print the created EAS project identity and recovery path;
- leave the staged tenant inputs available for diagnosis; and
- make the next `tenant:add` or `tenant:eas` run offer Resume/Link instead of creating a duplicate.

The recovery record is schema-validated before use. Recovery never stores credentials, access
tokens, environment values, or raw EAS authentication output.

If Link verification succeeds but publication fails, the same recovery mechanism may retain the
verified project metadata; no remote project was created by the onboarding command.

Registry edits remain restricted to their generated markers and restore the original bytes on
failure. Asset publication continues using the existing transactional generator.

## Validation and Error Handling

- Invalid recipe JSON fails before filesystem or network changes.
- Contrast validation covers primary/on-primary, accent/on-accent, and
  background/on-background pairs.
- Semantic overrides are validated both before and after recipe expansion.
- Feature/native cross-field rules continue to fail closed.
- Local identifier isolation and cross-tenant collision checks remain mandatory.
- Missing EAS authentication provides `eas login` remediation.
- An inaccessible linked project fails before publication.
- A pending EAS tenant receives action-specific remediation rather than a generic missing UUID
  error.
- CLI output may show owner, slug, and project ID because they are public identity values, but it
  must redact tokens and environment values.

## Testing Strategy

### Unit tests

- strict recipe schema and schema-version rejection;
- deterministic expansion for every built-in preset;
- deep override validation and precedence;
- exact Avihu theme snapshot preservation;
- compact `index.ts`, `theme.ts`, and `features.ts` rendering;
- directory-based local discovery, symlink rejection, and collision handling;
- linked/pending EAS schema behavior;
- pending-EAS Expo config omission and release guards; and
- EAS command construction and JSON parsing.

### Integration tests with injected runners

- Create, Link, Skip, cancellation, unauthenticated, inaccessible-project, and malformed-response
  flows;
- confirmation occurs immediately before external creation;
- EAS CLI receives an isolated workspace and cannot modify repository app configuration;
- local validation completes before the Create runner is called;
- rollback before remote creation;
- recovery record creation after remote success/local failure;
- resume consumes recovery without creating a duplicate project;
- registry and publication rollback preserves pre-existing sentinels; and
- no secret appears in generated modules, recovery records, or rendered errors.

Automated tests never create or delete a real Expo project.

### Regression verification

- full unit suite and TypeScript strict check;
- semantic application-color audit;
- exact Avihu resolved Expo configuration and plugin composition;
- Avihu and ignored test-tenant asset validation;
- local test-tenant fast preflight;
- pending tenant release/build/update/EAS rejection probes;
- formatting and `git diff --check`; and
- proof that local tenant folders, local assets, staging, and recovery files remain ignored.

## Documentation

Tenant documentation will explain:

- preset selection and JSON recipe examples;
- the optional override shape;
- the tenant folder responsibilities;
- Create/Link/Skip and the meaning of Expo owner;
- `eas login`, pending state, and `tenant:eas` resume;
- the external creation confirmation and non-automatic deletion policy;
- recovery records; and
- replacement of fallback branding before release.

## Out of Scope

- backend/SaaS entitlement integration;
- a hosted theme editor or remote theme service;
- automatic EAS credential, signing, store, or environment-secret setup;
- automatic deletion of an EAS project;
- relinking an already-linked production tenant;
- EAS builds, updates, submissions, or store releases; and
- changing Avihu's current routes, features, appearance, identifiers, or release behavior.
