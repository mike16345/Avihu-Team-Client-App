# Expo SDK 53 Upgrade Checklist

## Changes
- Bumped core packages to Expo SDK 53, React 19, and React Native 0.79.
- Added `expo-build-properties` plugin with Android SDK 35 and iOS 15.1 targets.
- Enabled Reanimated babel plugin and upgraded `react-native-reanimated` and `react-native-gesture-handler`.
- Configured EAS build profiles to use Android API 35 images.
- Added upgrade scripts for Bash and PowerShell.

## Manual QA
- Launch app on Android and iOS development clients.
- Verify login and navigation flows.
- Test media features (image picker, video/audio if applicable).
- Confirm push notifications registration and delivery.
- Check background tasks and RTL screens.
- Inspect charts and touch interactions.

