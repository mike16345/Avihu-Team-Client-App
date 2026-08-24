# Tenant release control

## Local selector

Use the control center for every build. It pins the EAS CLI and passes only the selected,
non-secret `APP_TENANT` and `APP_ENV` values to its child command:

```sh
npm run app -- build android --tenant avihu --profile preview --yes --dry-run
npm run app -- build ios --tenant avihu --profile preview --yes --dry-run
npm run app -- build android --tenant avihu --profile production --yes --dry-run
npm run app -- build ios --tenant avihu --profile production --yes --dry-run
```

Remove `--dry-run` only when the operator has approved the EAS build. The production Android
command resolves to `npx --yes eas-cli@16.27.0 build --platform android --profile production` with
`APP_TENANT=avihu` and `APP_ENV=production` in the child environment. No secret value is included
in command arguments or control-center output.

The legacy build aliases take the same control path and still require an explicit tenant; append
the tenant flag rather than relying on shell expansion:

```sh
npm run build:android:preview -- --tenant avihu --dry-run
npm run build:ios:prod -- --tenant avihu --dry-run
```

Before a real build, run the same selected preflight locally:

```sh
npm run app -- preflight --tenant avihu --environment preview --yes --dry-run
npm run app -- preflight --tenant avihu --environment production --yes --dry-run
APP_TENANT=avihu APP_ENV=preview npm run preflight
APP_TENANT=avihu APP_ENV=production npm run preflight
```

## EAS project setup

Each tenant has its own EAS project. In that project, create symbolic EAS environments named
exactly `development`, `preview`, and `production`. Set `APP_TENANT` to the tenant ID in all three
environments; for Avihu the value is `avihu`. Keep credentials and required public runtime
variables in the same project/environment according to the tenant's
`requiredEnvironmentVariables` record.

`frontend/eas.json` owns the shared build profiles and sets only the non-secret `APP_ENV` value:
`development`, `preview`, or `production`. Do not add `APP_TENANT` there: it must remain an
EAS-project environment value so the profiles work for future tenant projects.

An authorized EAS project administrator can set the selector variable with the EAS dashboard or
the equivalent noninteractive command, choosing the target project and each named environment.
These commands change remote EAS state and are shown for operators only; do not run them during
local verification. The pinned CLI documents `--force` as overwriting an existing variable, so it
makes repeated setup idempotent for the same tenant value:

```sh
APP_TENANT=avihu APP_ENV=development npx --yes eas-cli@16.27.0 env:create --name APP_TENANT --value avihu --environment development --visibility plaintext --scope project --force --non-interactive
APP_TENANT=avihu APP_ENV=preview npx --yes eas-cli@16.27.0 env:create --name APP_TENANT --value avihu --environment preview --visibility plaintext --scope project --force --non-interactive
APP_TENANT=avihu APP_ENV=production npx --yes eas-cli@16.27.0 env:create --name APP_TENANT --value avihu --environment production --visibility plaintext --scope project --force --non-interactive
```

Verify the selected project without requesting sensitive values. Plaintext `APP_TENANT` values can
appear in the output, so review the output before sharing it:

```sh
APP_TENANT=avihu APP_ENV=development npx --yes eas-cli@16.27.0 env:list --environment development --scope project
APP_TENANT=avihu APP_ENV=preview npx --yes eas-cli@16.27.0 env:list --environment preview --scope project
APP_TENANT=avihu APP_ENV=production npx --yes eas-cli@16.27.0 env:list --environment production --scope project
```

The Avihu tenant intentionally shares the iOS bundle identifier and Android package between
preview and production (`com.avihuteam.avihuteam`). This is declared by
`allowSharedStoreIdentity: true` for both environments. Development is isolated as
`com.avihuteam.avihuteam.dev`. Do not duplicate this sharing for another tenant unless its tenant
configuration explicitly declares it.

## Remote build guard

EAS invokes `eas-build-post-install`, which is exactly `npm run preflight:eas`. That action uses
the fast, noninteractive EAS suite: tenant/environment validation, dependencies, Expo config,
assets, typecheck, and unit tests. It does not launch EAS, publish an update, or compile native
projects recursively. The JSON report is written only to `.preflight/eas-report.json` in the build
workspace.

## Local config checks

Resolve every Avihu environment before changing identifiers or EAS project settings:

```sh
APP_TENANT=avihu APP_ENV=development npx expo config --type public --json
APP_TENANT=avihu APP_ENV=preview npx expo config --type public --json
APP_TENANT=avihu APP_ENV=production npx expo config --type public --json
```

Confirm `extra.eas.projectId` is `bbbbb60d-eb47-48fb-a278-517aba8dcea2`, `updates.url` is
`https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2`, and each bundle/package identity matches
the tenant configuration.

## Troubleshooting

- `APP_TENANT is required`: set it in the tenant's selected EAS environment, or use a selector
  command with `--tenant avihu` locally.
- Invalid `APP_ENV`: use only `development`, `preview`, or `production`; the EAS profile supplies
  the matching non-secret value.
- Missing variables during preflight: add the required variable to that tenant's EAS environment;
  never place its value in TypeScript or `eas.json`.
- Identity drift: run the three Expo config commands above, correct the tenant TypeScript record,
  then regenerate any disposable native output.
- EAS environment verification is ambiguous: select the intended tenant EAS project first, then
  rerun the matching `eas env:list --environment <name>` command above.
