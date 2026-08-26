# Tenant release control

## Daily development

`npm run app` is the authoritative entry point. The interactive selector never silently chooses a
tenant or production action. For automation, make the tenant and environment explicit:

```sh
npm run app
npm run app -- start --tenant avihu --environment development --yes
npm run app -- run android --tenant avihu --environment development --yes
npm run app -- run ios --tenant avihu --environment production --yes
npm run app -- preflight --tenant avihu --environment development --yes
```

The interactive menu first asks for an intent: **Develop & run**, **Verify app**, **Release app**,
or **Manage assets**. Detailed choices appear only inside that section. Local `run` actions always
open Expo's device/emulator selector. Development uses a Debug native build; preview and production
use Release and do not start an unnecessary Metro server.

Supply `--device` to skip Expo's target selector, or install an existing binary without rebuilding:

```sh
npm run app -- run android --tenant avihu --environment production --device Pixel_9_API_36 --yes
npm run app -- run ios --tenant avihu --environment production --device "iPhone 16 Pro" --yes
npm run app -- install android --tenant avihu --environment production --binary ./app-release.apk --yes
```

The last command still opens the device selector. Add `--device <name-or-UDID>` when the target is
already known. Android accepts an Expo-supported APK/AAB; iOS accepts an Expo-supported `.app` or
`.ipa` appropriate for the selected simulator or physical device.

Local Android build-and-run actions select Java 17 automatically instead of inheriting an
unsupported global Java version. On machines where Java 17 is installed in a custom location, set
`APP_ANDROID_JAVA_HOME` to that JDK home before running the controller.

Development and internal preview binaries display a small tenant/environment badge. Production
binaries carry `showEnvironmentBadge: false` in their resolved Expo configuration and never infer
visibility from `NODE_ENV`.

## Add and test a tenant

Use the interactive onboarding command instead of copying tenant files by hand:

```sh
npm run tenant:add
```

It supports repository tenants and Git-ignored local tests, accepts an optional source logo, creates
a deterministic fallback when none is supplied, offers semantic presets or a strict JSON recipe,
generates/validates assets, resolves Expo config, and runs fast preflight. Repository onboarding
selects an available Expo account before suggesting an editable `com.<owner>` bundle/package base,
then offers EAS **Create**, **Link**, or **Skip**; local onboarding always skips. Completed prompt
sections are saved under the ignored `.tenant-add/drafts/` directory. After a cancellation or
failure, rerunning the command offers **Resume draft**, **Start over**, or **Delete draft**. A
successful onboarding removes its draft. Before fast preflight, onboarding clean-generates native
projects for the selected tenant so ignored output from another tenant cannot create false drift.
Preflight resolves the same `.env*` files as Expo while preserving explicit shell values. The local
`test-tenant` launch command is:

```sh
npm run app -- start --tenant test-tenant --environment development --yes
```

Local tenants intentionally have isolated placeholder bundle/package identities and no required
server environment variables. They may start Metro, install an existing compatible binary, perform
development native runs, manage assets, and run fast preflight. Build, update, release preflight,
and preview/production native-run actions are blocked before any process is launched. Creating a
real tenant in repository mode does not create EAS credentials, environment variables, builds,
updates, submissions, store releases, or backend entitlements.

## Fast versus release preflight

Fast preflight validates tenant selection, required environment names, TypeScript, unit tests, Expo
compatibility, assets, resolved config, native drift, and platform policy. Release preflight is the
strict superset: it clean-generates native projects, runs Android lint/bundle and iOS validation,
checks AAB/R8/source-map artifacts, and runs configured smoke infrastructure.

```sh
APP_TENANT=avihu APP_ENV=development npm run preflight
APP_TENANT=avihu APP_ENV=production npm run preflight:release
```

`PASS` is verified. `WARN` is a documented, non-blocking condition with remediation (for example,
the current portrait/large-screen decision or unavailable optional tooling). `FAIL` blocks the
selected action. Never convert a missing credential, device flow, artifact, test, or configuration
requirement into a warning merely to obtain a green report. Full sanitized logs and optional JSON
reports are stored under ignored `.preflight/`.

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
command resolves to `npx --yes eas-cli@22.4.0 build --platform android --profile production` with
`APP_TENANT=avihu` and `APP_ENV=production` in the child environment. No secret value is included
in command arguments or control-center output.

The legacy build aliases take the same control path and still require an explicit tenant; append
the tenant flag rather than relying on shell expansion:

```sh
npm run build:android:preview -- --tenant avihu --dry-run
npm run build:ios:prod -- --tenant avihu --dry-run
```

The selector and legacy aliases automatically run tenant-scoped `preflight:eas` before EAS starts;
the remote post-install hook repeats it. You can also run the fuller local checks explicitly:

```sh
npm run app -- preflight --tenant avihu --environment preview --yes --dry-run
npm run app -- preflight --tenant avihu --environment production --yes --dry-run
APP_TENANT=avihu APP_ENV=preview npm run preflight
APP_TENANT=avihu APP_ENV=production npm run preflight
```

## EAS project setup

Run `eas login` before choosing Create. The Expo owner is the signed-in account or organization that
owns the project. Create runs `eas project:init` only in an isolated temporary Expo workspace and
asks for a dedicated confirmation immediately before changing remote state. Link verifies the
project UUID, owner, and tenant slug. Skip leaves the generated tenant pending:

```sh
npm run tenant:eas -- --tenant <tenant-id>
```

Pending repository tenants are allowed to start locally and run fast checks, but build, update,
release, and EAS preflight stop before child execution. If Create succeeds remotely and a later
local write or preflight fails, inspect the non-secret ignored record in
`.tenant-add/recovery/<tenant-id>.json`. A resumed `tenant:add` verifies and reuses that project;
`tenant:eas` provides the same recovery path after a tenant already exists. No remote deletion or
second project creation is attempted.

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
local verification. The pinned CLI's `env:set` command creates or updates the variable, making
repeated setup idempotent for the same tenant value:

```sh
APP_TENANT=avihu APP_ENV=development npx --yes eas-cli@22.4.0 env:set --name APP_TENANT --value avihu --environment development --visibility plaintext --scope project --non-interactive
APP_TENANT=avihu APP_ENV=preview npx --yes eas-cli@22.4.0 env:set --name APP_TENANT --value avihu --environment preview --visibility plaintext --scope project --non-interactive
APP_TENANT=avihu APP_ENV=production npx --yes eas-cli@22.4.0 env:set --name APP_TENANT --value avihu --environment production --visibility plaintext --scope project --non-interactive
```

Verify the selected project without requesting sensitive values. Plaintext `APP_TENANT` values can
appear in the output, so review the output before sharing it:

```sh
APP_TENANT=avihu APP_ENV=development npx --yes eas-cli@22.4.0 env:list --environment development --scope project
APP_TENANT=avihu APP_ENV=preview npx --yes eas-cli@22.4.0 env:list --environment preview --scope project
APP_TENANT=avihu APP_ENV=production npx --yes eas-cli@22.4.0 env:list --environment production --scope project
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

## Tenant onboarding checklist

1. Run `npm run tenant:add` in repository mode and review the generated typed configuration and
   registry edit. Do not put secret values in TypeScript.
2. Replace fallback artwork when it is not approved production branding. Inspect generated Apple,
   Android, notification, splash, and runtime-logo previews.
3. Confirm the semantic theme, all JavaScript feature defaults, and the separate native-capability
   declaration. Avihu defaults remain all enabled; server entitlements are future work.
4. Give development a distinct bundle/package identity. Preview and production may share a store
   identity only when both explicitly set `allowSharedStoreIdentity: true`.
5. Create the tenant's EAS project and its symbolic `development`, `preview`, and `production`
   environments. Set `APP_TENANT` and the tenant's required runtime variables in that project.
6. Resolve all three Expo configurations, run fast preflight, then release preflight on supported
   platforms. Complete the manual device matrix before store submission.

## Asset replacement and cleanup

The source artwork is immutable generator input; never hand-edit generated outputs. To replace it,
put the approved square PNG at `config/tenants/assets/<tenant>/source/app-icon.png`, then run:

```sh
npm run assets:generate -- --tenant avihu
npm run assets:check -- --tenant avihu
npm run assets:audit -- --tenant avihu
```

Inspect `generated/previews/` at full size and launcher size. Audit is report-only by default.
Cleanup removes only `proven-unused` or stale generated files and requires explicit confirmation:

```sh
npm run assets:audit -- --tenant avihu --clean
npm run assets:audit -- --tenant avihu --clean --yes
```

Dynamic or otherwise uncertain references remain `ambiguous` and are never cleanup candidates.

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

## Edge-to-edge and device matrix

Android uses edge-to-edge with live safe-area insets; do not restore `StatusBar.currentHeight`, a
fixed status-bar color, or `windowOptOutEdgeToEdgeEnforcement`. Before release, test gesture and
three-button navigation on Android 15 and 16 across headers, floating bottom tabs, shared modals,
scrolling diet/workout/article/agreement screens, workout wheel, barcode camera, display cutouts,
and keyboard forms. Check for both overlap and double padding. Portrait phone-only behavior remains
an intentional warning; this migration does not enable tablets or landscape.

Current automated checks validate source/native ownership, but authenticated, credentialed,
camera, Health Connect, personal-data, and unavailable device scenarios remain manual until they
are actually exercised.

## Recovering generated native state

`android/`, `ios/`, `.expo/`, `.preflight/`, and build artifacts are disposable/ignored outputs.
When native output is stale, preserve any diagnostic log you need, verify the selected tenant, then
regenerate rather than editing generated files:

```sh
APP_TENANT=avihu APP_ENV=production npx expo prebuild --clean --no-install --platform android
APP_TENANT=avihu APP_ENV=production npm run preflight:release
```

If generation was interrupted, remove only the resolved generated native folder—not the repository
or tenant source assets—and rerun clean prebuild. Asset generator publication is transactional and
recovers an interrupted backup on its next run.

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
