# Release Workflow

This repository uses two GitHub Actions workflows for releases to `master`:

- [release-on-master.yml](/c:/Users/micha/Desktop/Avihu-Team-Client-App/.github/workflows/release-on-master.yml)
- [require-version-bump.yml](/c:/Users/micha/Desktop/Avihu-Team-Client-App/.github/workflows/require-version-bump.yml)

## Rules

### 1. PRs into `master`

`require-version-bump.yml` runs on every pull request targeting `master`.

It checks whether the PR changes any native-affecting files:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/app.config.ts`
- `frontend/eas.json`
- `frontend/babel.config.js`
- `frontend/metro.config.js`
- `frontend/react-native.config.js`
- anything under `frontend/android/**`
- anything under `frontend/ios/**`

If none of those files changed, the PR does not need a version bump.

If any of those files changed, the PR must bump `version` in [frontend/app.config.ts](/c:/Users/micha/Desktop/Avihu-Team-Client-App/frontend/app.config.ts) to a strictly higher semantic version:

- `2.2.0 -> 2.2.1` passes
- `2.2.0 -> 2.3.0` passes
- `2.2.0 -> 2.2.0` fails
- `2.2.0 -> 2.1.9` fails

Branch protection on `master` should require the `Verify Native Version Bump` status check.

### 2. Pushes to `master`

`release-on-master.yml` runs on every push to `master`.

It classifies the merged change into one of three release types:

- `ota`
- `native`
- `none`

Classification is conservative:

- If native-affecting files changed, the workflow chooses `native`.
- Otherwise, if OTA-eligible frontend files changed, it chooses `ota`.
- Otherwise, it chooses `none`.

This means `frontend/package.json` and `frontend/package-lock.json` always count as `native`, even if the dependency change turns out to be JavaScript-only. That is intentional because the safer default is to build a new binary when dependencies changed.

### 3. OTA release conditions

The workflow publishes an OTA update when the merged change affects only OTA-safe files such as:

- `frontend/App.tsx`
- anything under `frontend/src/**`
- anything under `frontend/assets/**`

The OTA job runs:

```bash
npx eas-cli update --branch production --environment production --message "<message>" --non-interactive
```

Because [frontend/app.config.ts](/c:/Users/micha/Desktop/Avihu-Team-Client-App/frontend/app.config.ts) uses `runtimeVersion: { policy: "appVersion" }`, OTA updates only apply to installed binaries with the matching app version.

### 4. Native release conditions

The workflow builds native binaries when the merged change touches native-affecting files such as:

- dependency manifests
- Expo config
- Metro/Babel/native config
- generated native folders if they exist
- explicit version changes in `frontend/app.config.ts`

The native job runs:

```bash
npx eas-cli build --platform android --profile production --non-interactive --no-wait
npx eas-cli build --platform ios --profile production --non-interactive --no-wait
```

If the workflow is started manually and `submit_to_stores=true` is selected, the build command uses `--auto-submit` instead of `--no-wait`.

### 5. Submission policy

Normal pushes to `master` do not auto-submit to the stores.

Store submission is opt-in through manual dispatch of `release-on-master.yml` with:

- `force_release_type=native` when needed
- `submit_to_stores=true`

This keeps store submission behind an explicit action even after the merge has happened.

## Required setup

The workflows assume the following project setup:

- Android production credentials are managed remotely by Expo in [frontend/eas.json](/c:/Users/micha/Desktop/Avihu-Team-Client-App/frontend/eas.json).
- iOS credentials are managed through Expo/EAS.
- App Store Connect API key is configured for iOS submit.
- Google Play service account key is configured for Android submit.
- Production environment variables are managed in Expo/EAS environments.

The only GitHub Actions secret that should be required for normal operation is:

- `EXPO_TOKEN`

## What developers should do

### JS-only / OTA-safe changes

Examples:

- screen logic
- styling
- React hooks
- text/content
- image assets

Expected developer action:

- do not bump `frontend/app.config.ts` version
- merge to `master`
- workflow publishes an OTA update to the `production` branch

### Native-affecting changes

Examples:

- dependency changes in `frontend/package.json`
- Expo config/plugin changes
- notification/camera/plugin setup changes
- app version bump
- anything under native folders

Expected developer action:

- bump `version` in `frontend/app.config.ts`
- open PR to `master`
- ensure the version bump check passes
- merge to `master`
- workflow starts Android and iOS production builds

### Store release

Expected release manager action:

1. Verify the produced Android/iOS builds in EAS.
2. Manually dispatch `Release On Master` if you want automated submission.
3. Use `submit_to_stores=true`.
4. Submit to `internal` track on Android first unless there is a reason to go directly to production.

## Notes

- Changing `version` in [frontend/app.config.ts](/c:/Users/micha/Desktop/Avihu-Team-Client-App/frontend/app.config.ts) changes the runtime line used by Expo Updates because the app uses `runtimeVersion: { policy: "appVersion" }`.
- A native build already includes the JS bundle from the merged commit, so the workflow does not also publish a separate OTA update when a change is classified as `native`.
- If the classification ever needs to be overridden, `release-on-master.yml` supports manual dispatch with `force_release_type=ota` or `force_release_type=native`.
