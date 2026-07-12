# Live Activity Integration — Steps Card

Native code for the live-on-the-lock-screen steps card (the ring + "צעדים שנעשו" + "מרחק קילומטר" design).
The JS hook + bridge contracts are ready. This document is the checklist for the iOS/Android wiring.

## Files we prepared

```
frontend/native-modules/live-steps-activity/
├── ios/
│   ├── StepsActivityAttributes.swift     # ActivityKit data model
│   ├── StepsActivityWidget.swift          # SwiftUI lock-screen + Dynamic Island
│   ├── StepsActivityWidgetBundle.swift    # WidgetBundle @main entry
│   ├── RNLiveSteps.swift                  # React Native bridge (Swift)
│   ├── RNLiveSteps.m                      # React Native bridge (ObjC export)
│   └── Info.plist                         # Widget Extension Info.plist
└── android/
    ├── LiveStepsService.kt                # Foreground service
    ├── LiveStepsModule.kt                 # React Native module
    ├── LiveStepsPackage.kt                # ReactPackage registration
    └── res/
        ├── layout/live_steps_notification.xml
        └── drawable/
            ├── live_steps_ring.xml
            └── live_steps_card_bg.xml
```

JS side (already wired into `StepsCardioContainer.tsx`):
- `frontend/src/hooks/api/useLiveStepsActivity.ts` — exposes `start / update / stop / isAvailable / isEnabled`

---

## iOS — Widget Extension (Xcode work)

### 1. Create the Widget Extension target

In Xcode, open `frontend/ios/AvihuTeam.xcworkspace`:

1. `File → New → Target…` → **Widget Extension**
2. **Product Name:** `AvihuTeamStepsWidget`
3. **Include Live Activity:** ✅ check this box
4. **Embed in Application:** select the main `AvihuTeam` target
5. Click Finish, accept the scheme creation

This creates an `AvihuTeamStepsWidget/` folder with boilerplate. **Delete the boilerplate Swift files inside that folder** (the auto-generated `*.swift` and `Info.plist`).

### 2. Drop our files into the new target

Copy these into `frontend/ios/AvihuTeamStepsWidget/`:
- `StepsActivityAttributes.swift`
- `StepsActivityWidget.swift`
- `StepsActivityWidgetBundle.swift`
- `Info.plist` (overwrite the auto-generated one)

In Xcode, drag them into the project navigator under the `AvihuTeamStepsWidget` group and confirm they are added to the **AvihuTeamStepsWidget** target (not the main app).

### 3. Share the Attributes file with the main app

The bridge (`RNLiveSteps.swift`) needs `StepsActivityAttributes` too. Two options:

- **Recommended:** in Xcode's File Inspector for `StepsActivityAttributes.swift`, check **both** the `AvihuTeam` and `AvihuTeamStepsWidget` targets under "Target Membership".
- Alternative: duplicate the file into the main app folder.

### 4. Add the bridge to the main app target

Copy into `frontend/ios/AvihuTeam/`:
- `RNLiveSteps.swift`
- `RNLiveSteps.m`

In Xcode, drag them into the project under the `AvihuTeam` group, confirm Target Membership = `AvihuTeam` only.

If this is the first Swift file added to the main app, Xcode will prompt to create a bridging header — accept it. (If `AvihuTeam-Bridging-Header.h` already exists, no action needed.)

### 5. Info.plist on the main app

Add `NSSupportsLiveActivities = YES` to `frontend/ios/AvihuTeam/Info.plist`.

```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

### 6. Deployment target

Live Activities require **iOS 16.1+**. Ensure both targets have iOS Deployment Target ≥ 16.1.
(If the main app must support older iOS, leave it lower — the bridge gates on `#available(iOS 16.1, *)` and falls back gracefully.)

### 7. Provisioning

Live Activities don't require a special entitlement — but the Widget Extension needs its own bundle identifier and provisioning profile:
- Bundle ID: `<main-bundle-id>.AvihuTeamStepsWidget`
- Make sure both profiles are present in the EAS Build credentials.

### 8. Build

```bash
cd frontend
eas build --profile development --platform ios
```

After it lands on a device:
- The trainee opens the app → grants HealthKit → the JS hook calls `RNLiveSteps.start()`.
- Lock the device. The Live Activity should appear on the lock screen with the ring and step text.
- On iPhone 14 Pro / 15 Pro / 16+: Dynamic Island shows compact + expanded variants.

---

## Android — Foreground Service + Custom Notification

### 1. Copy Kotlin sources

Place files under (adjust package path to match the real app package):

```
frontend/android/app/src/main/java/com/avihuteam/livesteps/
├── LiveStepsService.kt
├── LiveStepsModule.kt
└── LiveStepsPackage.kt
```

**If the app package is not `com.avihuteam`**, update:
- `package com.avihuteam.livesteps` declarations at the top of all three files
- `import com.avihuteam.R` in `LiveStepsService.kt` → use the real package's R class
- The directory path under `java/`

### 2. Copy resources

Place under `frontend/android/app/src/main/res/`:
- `layout/live_steps_notification.xml`
- `drawable/live_steps_ring.xml`
- `drawable/live_steps_card_bg.xml`

### 3. Register the package

In `frontend/android/app/src/main/java/com/avihuteam/MainApplication.kt` (or `.java`), add to `getPackages()`:

```kotlin
import com.avihuteam.livesteps.LiveStepsPackage

override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(LiveStepsPackage())
    }
```

### 4. AndroidManifest.xml

Add inside `<application>` (in `frontend/android/app/src/main/AndroidManifest.xml`):

```xml
<service
    android:name="com.avihuteam.livesteps.LiveStepsService"
    android:exported="false"
    android:foregroundServiceType="health"/>
```

And add (above `<application>`):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH"/>
```

### 5. Build

```bash
cd frontend
eas build --profile development --platform android
```

After install: granting HealthConnect + notifications kicks `RNLiveSteps.start()` → an ongoing notification with the custom RemoteViews layout pins to the shade.

Caveats:
- Android `RemoteViews` cannot render SVG or fancy gradients on all OEM skins. The ring uses a sweep-gradient drawable which renders correctly on stock Android 11+. On Samsung One UI / MIUI the gradient may render as a flat color — acceptable.
- On Android 13+ the user must grant POST_NOTIFICATIONS at runtime. `useStepsNotifications.ts` already requests it.

---

## How the JS calls in

`useLiveStepsActivity` is already wired into `StepsCardioContainer.tsx`:

```ts
useEffect(() => {
  if (!useNativeData || !liveActivity.isAvailable) return;
  if (liveActivity.activityId) {
    liveActivity.update(todaySteps, dailyGoal);
  } else {
    liveActivity.start(todaySteps, dailyGoal);
  }
}, [useNativeData, todaySteps, dailyGoal, liveActivity]);
```

The Activity starts as soon as native steps data is available, and updates whenever today's steps or goal change. Use `liveActivity.stop()` from settings if you add a "disable lock-screen card" toggle later.

---

## Quick smoke test after build

1. Trainee logs in → cardio plan type = `"steps"` is set
2. Grants HealthKit / HealthConnect permission
3. Locks the phone
4. Lock screen shows the Live Activity (iOS) / ongoing notification (Android)
5. Take a few steps with the phone in pocket → the number on the lock screen updates within ~30 s

Ship it 🚀
