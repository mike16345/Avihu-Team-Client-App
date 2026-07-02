# Steps Native Build Notes

## What exists now

- In-app step tracking reads from HealthKit on iOS and Health Connect on Android.
- Android also has a custom native live steps notification service.
- Step milestone notifications are local Expo notifications driven by app step progress.
- The native template source of truth lives under `frontend/native-modules/live-steps-activity`.
- The generated `frontend/android` and `frontend/ios` folders are prebuild artifacts and should stay uncommitted.

## When an OTA update is enough

You can use an EAS Update without a new store/dev build when the change is JS-only, for example:

- milestone notification copy
- notification thresholds
- step sync timing in JS
- Cardio screen UI
- React Query, Zustand, or API logic

## When a full new build is required

You need a new iOS/Android build when the change touches native code or native config, for example:

- `frontend/app.config.ts`
- Expo config plugins
- files in `frontend/native-modules/live-steps-activity`
- Android manifest/service/permissions
- iOS HealthKit or Live Activity native setup
- native package version upgrades that require prebuild/regeneration

## Safe workflow for future native changes

1. Edit the JS/native template source files only.
2. Do not manually edit generated files inside `frontend/android` or `frontend/ios`.
3. Run a local sanity check:

```bash
cd frontend
npx expo prebuild --no-install --platform android
```

4. If prebuild succeeds, create a new EAS build:

```bash
cd frontend
eas build --profile development --platform android
```

Use the iOS platform instead when testing iPhone native changes.

## Important notes

- `frontend/.gitignore` ignores generated native folders on purpose.
- The custom Android live steps code is copied from `android-template` during prebuild.
- The custom iOS live steps code is copied from `ios-template` during prebuild.
- iOS lock-screen Live Activity and home-screen widget work are still a separate native milestone and should not be treated as a normal Expo-only change.
