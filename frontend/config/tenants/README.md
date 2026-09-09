# Tenant configuration ownership

Tenant TypeScript is the source of public app identity, branding, semantic theme values, JavaScript
feature defaults, native capabilities, asset paths, permissions, and linked-or-pending EAS state.
Secret values never belong in tenant modules or Expo `extra`.

## Add or change a tenant

Run `npm run tenant:add`. Choose **Repository tenant** for a future real tenant or **Local test** for
an ignored development-only tenant. The workflow:

1. validates app identity, isolated bundle/package identifiers, a preset or JSON semantic theme,
   feature defaults,
   and native capabilities;
2. normalizes a supplied PNG/JPEG logo, or creates a deterministic geometric fallback when the logo
   path is blank;
3. runs the existing deterministic asset generator and validator;
4. resolves all Expo environments and runs fast preflight; and
5. offers Create, Link, or Skip for repository EAS setup; and
6. prints the exact `npm run app -- start ...` launch command.

Repository mode creates reviewable TypeScript, updates only the marked registry regions, and creates
committable source/generated assets. Replace fallback artwork with approved production branding
before release. Local mode writes only beneath `config/tenants/.local/` and
`config/tenants/assets/.local/`; both roots are Git-ignored. Local tenants cannot build, update, run
release preflight, or run preview/production native builds.

Each tenant folder contains `index.ts` for identity and platform configuration, `theme.ts` for its
versioned recipe, and `features.ts` for JavaScript defaults and native binary capabilities. To
remove a local test tenant, delete its tenant folder and matching asset directory. For example:

```sh
rm -r config/tenants/.local/test-tenant
rm -r config/tenants/assets/.local/test-tenant
```

Avihu deliberately keeps every JavaScript feature default enabled. The pure feature resolver can
accept validated overrides from a future local or server entitlement source, but no backend source
is implemented yet. Native capabilities remain a separate build-time declaration: a JavaScript
override must never imply that an absent native package exists in the installed binary.

Every visible application color belongs to the strict semantic tenant theme. Avihu maps the
existing palettes, including newer Diet, scanner, health, graph, agreement, and developer-tool
colors, so adopting the theme contract does not intentionally change its appearance.

## Future theme validation improvements

New tenant themes should default ordinary text roles to readable neutral colors instead of deriving
them directly from brand colors. A future onboarding improvement should validate the known semantic
foreground/background pairs and warn when contrast is too low, when foreground and background roles
overlap, or when too many distinct UI roles collapse onto visually indistinguishable colors. The
validator should still allow explicit intentional overrides for branded accents and status colors.
Avihu's existing semantic mapping should remain unchanged until an intentional visual redesign.

Built-in recipes are **Avihu**, **Ivory / Orange / Blue**, and **Violet / Amber**. Choose JSON import
to supply the same strict version-1 format:

```json
{
  "schemaVersion": 1,
  "foundation": {
    "primary": "#174A7E",
    "onPrimary": "#FFFFFF",
    "accent": "#E97824",
    "onAccent": "#17212B",
    "background": "#FFF9ED",
    "onBackground": "#17212B"
  },
  "overrides": {
    "scanner": { "viewfinder": "#21A179" }
  }
}
```

The compiler expands the six foundation colors into the complete strict semantic theme, then
applies validated nested overrides. Replace a fallback logo before production when the geometric
artwork is not approved branding.

For repository tenants, **Create** makes a new Expo project in an isolated temporary workspace,
**Link** verifies an existing project UUID, and **Skip** leaves `eas.status` pending. Expo owner is
the account or organization shown by `eas whoami`; authenticate first with `eas login`. Resume a
pending tenant with `npm run tenant:eas -- --tenant <tenant-id>`. Pending tenants cannot build,
update, or run release/EAS preflight. If remote creation succeeds but local validation fails, the
non-secret recovery record is stored under ignored `.tenant-add/recovery/`; the workflow never
deletes the remote project automatically.

Onboarding does not create credentials or secrets, populate EAS environments, build binaries,
publish updates, submit stores, or implement backend entitlements.

`app.config.ts` is the narrow boundary that reads `APP_TENANT` and `APP_ENV`; all other Expo
configuration comes from the validated tenant record. EAS project variables select the tenant, and
`eas.json` supplies only the non-secret profile environment.

See `../../docs/release-control.md` for local selection and EAS setup.
