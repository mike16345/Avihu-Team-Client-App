# Tenant configuration ownership

Tenant TypeScript is the source of public app identity, branding, semantic theme values, JavaScript
feature defaults, native capabilities, asset paths, permissions, Expo owner/project ID, and update
URL. Secret values never belong in tenant modules or Expo `extra`.

## Add or change a tenant

Run `npm run tenant:add`. Choose **Repository tenant** for a future real tenant or **Local test** for
an ignored development-only tenant. The workflow:

1. validates app identity, isolated bundle/package identifiers, semantic colors, feature defaults,
   and native capabilities;
2. normalizes a supplied PNG/JPEG logo, or creates a deterministic geometric fallback when the logo
   path is blank;
3. runs the existing deterministic asset generator and validator;
4. resolves all Expo environments and runs fast preflight; and
5. prints the exact `npm run app -- start ...` launch command.

Repository mode creates reviewable TypeScript, updates only the marked registry regions, and creates
committable source/generated assets. Replace fallback artwork with approved production branding
before release. Local mode writes only beneath `config/tenants/.local/` and
`config/tenants/assets/.local/`; both roots are Git-ignored. Local tenants cannot build, update, run
release preflight, or run preview/production native builds.

To remove a local test tenant, delete its one module and matching asset directory. For example:

```sh
rm config/tenants/.local/test-tenant.ts
rm -r config/tenants/assets/.local/test-tenant
```

Avihu deliberately keeps every JavaScript feature default enabled. The pure feature resolver can
accept validated overrides from a future local or server entitlement source, but no backend source
is implemented yet. Native capabilities remain a separate build-time declaration: a JavaScript
override must never imply that an absent native package exists in the installed binary.

Every visible application color belongs to the strict semantic tenant theme. Avihu maps the
existing palettes, including newer Diet, scanner, health, graph, agreement, and developer-tool
colors, so adopting the theme contract does not intentionally change its appearance.

`app.config.ts` is the narrow boundary that reads `APP_TENANT` and `APP_ENV`; all other Expo
configuration comes from the validated tenant record. EAS project variables select the tenant, and
`eas.json` supplies only the non-secret profile environment.

See `../../docs/release-control.md` for local selection and EAS setup.
