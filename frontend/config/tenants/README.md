# Tenant configuration ownership

Tenant configuration is committed TypeScript. It is the only source of public app identity,
branding, native identifiers, asset paths, permissions, feature flags, Expo owner/project ID, and
update URL.

## Add or change a tenant

1. Add a tenant module next to `avihu.ts` and register it in `registry.ts`.
2. Supply the source and generated assets declared in that module.
3. Declare development, preview, and production identities. If preview and production deliberately
   use the same App Store / Play identity, set `allowSharedStoreIdentity: true` for both records.
4. Keep values such as API tokens, signing credentials, and EAS access tokens out of this folder.
   Tenant files may list required variable _names_, never their values.

`app.config.ts` is the narrow boundary that reads `APP_TENANT` and `APP_ENV`; all other Expo
configuration comes from the validated tenant record. EAS project variables select the tenant, and
`eas.json` supplies only the non-secret profile environment.

See `../../docs/release-control.md` for local selection and EAS setup.
