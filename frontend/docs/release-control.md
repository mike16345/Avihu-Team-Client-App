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

## Android release shrinking

Avihu enables standard R8 code shrinking and obfuscation together with Android resource shrinking.
The generated default `proguard-android.txt` includes `-dontoptimize`, so this configuration does
not claim R8 bytecode optimization. Removing unreachable bytecode and unused packaged resources
reduces download and installed size. A smaller artifact may reduce code/resource loading work, but
startup and memory improvements are not guaranteed and must be measured on representative release
builds. The Expo options affect only the Gradle `release` build type, so development/debug builds
remain unminified. R8 full mode is not enabled.

Generate and inspect the native project before a release build:

```sh
APP_TENANT=avihu APP_ENV=production npx expo prebuild --clean --no-install --platform android
rg 'enableProguardInReleaseBuilds|enableShrinkResourcesInReleaseBuilds' android/gradle.properties
rg 'minifyEnabled|shrinkResources' android/app/build.gradle
```

Both properties must be `true`, and `minifyEnabled`/`shrinkResources` must be wired only inside the
`release` build type. Use Java 17 for the Expo SDK 53 Android toolchain on machines whose default
Java is newer, then run the selected release preflight. Its artifact report records sizes and
requires both files to be nonempty:

```sh
APP_TENANT=avihu APP_ENV=production npm run preflight:release
```

- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- R8 mapping: `android/app/build/outputs/mapping/release/mapping.txt`
- Full preflight logs and JSON output, when requested: `.preflight/`

Archive the mapping file with the exact AAB that produced it. Android crash stacks from an
obfuscated release require that matching mapping to restore original class and method names.

If R8 exposes a native-library failure, reproduce it in a release build and identify the affected
library/reflection boundary before changing rules. Add only the narrow keep rule supported by that
evidence, and record the library and rationale. Do not enable R8 full mode, add broad keep rules,
use `-dontobfuscate`, or edit generated `android/` files. For temporary rollback after release-owner
approval, set the two tenant build-properties flags to `false`, clean-prebuild Android, and rebuild;
restore shrinking after the affected integration is corrected.

Device smoke remains a manual release gate when no authorized emulator/device and test accounts are
available. Verify the exact release build on a representative Android device:

- Cold startup and Expo Updates startup/restart
- Login and session restoration
- Barcode scanner and camera permission
- Health Connect authorization and data read
- Notification registration and receipt
- Background-task registration and execution
- Diet-plan history
- PDF viewing
- Signature capture and submission

Record blocked credential or personal-health-data steps as unavailable; never mark them passed
without exercising them.

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
- Android Gradle fails while parsing a Java version: select an installed Java 17 runtime for the
  command and rerun; do not treat a toolchain failure as an R8 keep-rule failure.
- Android lint blocks the bundle: inspect
  `android/app/build/intermediates/lint_intermediate_text_report/release/lintReportRelease/lint-results-release.txt`,
  fix the source/config-plugin cause, clean-prebuild, and rerun the full release preflight.
- `bundletool` is unavailable: install it and rerun preflight for structural AAB validation. A
  missing analyzer does not replace the required nonempty AAB and mapping checks.
