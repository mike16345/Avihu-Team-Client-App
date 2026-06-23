# HealthKit & Health Connect Integration — Deploy Notes

## What's Already in the Code

The frontend code is fully wired for native step data on both platforms. The mobile UI will automatically switch from mock data to real HealthKit / Health Connect data the moment the native modules are available in the dev client.

### Files Touched

- `frontend/package.json` — added `react-native-health` (iOS) and `react-native-health-connect` (Android) as dependencies
- `frontend/app.config.ts` — added both packages as Expo plugins with usage strings (Hebrew, user-facing) and the Android package id
- `frontend/src/hooks/api/useStepsData.ts` — new hook abstracting both platforms behind a single API
- `frontend/src/components/WorkoutPlan/cardio/StepsCardioContainer.tsx` — consumes the hook; falls back to demo toggle when no native module is linked

### Safety Net

`useStepsData` uses dynamic `require` wrapped in `try / catch`. If the native modules are not linked into the running binary, the hook returns `isNativeAvailable: false` and the screen keeps working with mock data. **The dev client will NOT crash if the new dev client build is not yet installed.**

## What Mike Needs To Do

### Step 1 — Install JS packages

```bash
cd frontend
npm install
```

This installs `react-native-health@^1.19.0` and `react-native-health-connect@^3.3.0` into `node_modules`. Metro will bundle them, but the native side still needs the dev client rebuild below.

### Step 2 — Rebuild dev client

```bash
cd frontend
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

(Or both with `--platform all`.) This is required because:

- iOS HealthKit needs the HealthKit entitlement linked at build time — config plugin does it automatically
- iOS needs `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription` in Info.plist — config plugin does it automatically (strings are in `app.config.ts`)
- Android Health Connect needs intent filter, permissions, and provider declarations in `AndroidManifest.xml` — config plugin does it automatically

### Step 3 — Distribute new dev client to Avihu

Send Avihu the new development build link (EAS will provide a URL). He installs over the existing dev client.

### Step 4 — Verify

- Avihu opens app, navigates to cardio screen
- Sees the "חבר את הצעדים שלך" onboarding card (already in place)
- Taps "חבר את הבריאות" → **native iOS HealthKit dialog appears** (not the demo toggle)
- User grants permission
- Ring fills with real step count from HealthKit
- Weekly chart shows real Sun-Sat data

## Optional Server-Side Work

The current implementation reads steps **directly from the device** every time the screen loads. No server roundtrip required for the trainee to see their own data.

If you want the **trainer** to see trainee step data in the admin panel, you'll need:

1. `POST /api/steps/sync` — receives `{ userId, date, steps, calories }` from the mobile app
2. The mobile app calls this in the background after each `refresh()` to push the data up
3. Admin panel reads `GET /api/users/:id/steps/week` to display in trainee profile

This is independent of the trainee-side flow above. We can ship the trainee flow first and add server sync later without breaking anything.

## Notes / Gotchas

- **Calorie estimate** is currently `steps × 0.04` (rough conversion). For accurate calories, query `ActiveEnergyBurned` from HealthKit / `ActiveCaloriesBurned` from Health Connect — would require an extra read per day. Left as-is for v1.
- **Background sync** is not configured. The hook refreshes on screen mount. To refresh while the app is closed, add `expo-background-fetch` or use platform-specific background-delivery APIs from HealthKit.
- **Midnight rollover** (task #7) is handled implicitly — every time the screen mounts, "today" is recomputed via `new Date()`. If the app stays open across midnight, the UI will not auto-refresh until the user re-navigates to the screen. Add a timer if this matters.
- **Custom mode (perDay goals)** is fully supported — `plan.perDay[7]` from the trainer panel flows through to per-day target lines and isLow checks.
