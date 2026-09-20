# Elevate Coach Branding and Developer Tools Design

## Context

The Avihu tenant already uses the supplied COACH artwork through the repository's generated asset
pipeline. The tenant still presents the app name and notification title as "Avihu Team." Development
builds also need a convenient, tenant-aware toolbox for exercising device behavior without manually
navigating through unrelated app flows.

## Goals

- Present the Avihu tenant to users as **Elevate Coach**.
- Keep the existing Avihu tenant ID, store identity, bundle identifiers, EAS project, URL scheme,
  slug, and supplied COACH artwork.
- Add a development-only toolbox that is easy to open, easy to hide, and safe for future tenants.
- Provide notification testing, permission inspection, safe runtime diagnostics, query-cache
  clearing, app reload, and floating-badge visibility controls.
- Make future developer actions independently testable and simple to add.

## Non-goals

- Do not redesign, replace, or regenerate the COACH artwork when its source bytes have not changed.
- Do not reset all local app data, clear authentication, or log the user out.
- Do not send a real remote push notification through a backend service. The initial notification
  action schedules a local device notification through Expo Notifications.
- Do not change production or preview bundle identifiers, EAS ownership, update identity, API
  behavior, or store listing identifiers.
- Do not expose secret values in the toolbox.

## Branding

The Avihu tenant's `displayName` becomes `Elevate Coach`. Expo configuration continues to derive the
native app name from that tenant field. User-visible notification titles must also derive from the
resolved runtime tenant display name rather than a hardcoded Avihu string.

The existing source icon is byte-for-byte identical to the supplied COACH image. Generated Apple,
Android adaptive, Android legacy, notification, splash, runtime-logo, and preview assets remain
unchanged. The implementation reruns `assets:check` to verify them but does not regenerate them.

## Availability and Entry Points

Developer Tools is available only when both conditions are true:

1. React Native's compile-time `__DEV__` flag is true.
2. The resolved tenant environment is exactly `development`.

The app must not render, register, or navigate to Developer Tools in preview or production. The
availability decision lives in a pure helper so every entry point uses the same rule.

Available development builds provide two entry points to the same root-level panel:

- Tapping the floating tenant/environment badge.
- A clearly labeled Developer Tools row on the authenticated Profile screen.

Hiding the floating badge never hides the Profile entry. The Profile entry is the recovery path for
showing the badge again.

## Panel Interface

The panel is a safe-area-aware bottom drawer consistent with existing UI primitives and RTL layout.
It contains:

- Active tenant display name and tenant ID.
- Active environment.
- Platform bundle/package identifier.
- App version.
- Sanitized API host only; paths, query strings, credentials, tokens, and headers are never shown.
- Current notification permission status.
- **Send test notification** action.
- **Request notification permission** action when permission is not granted.
- **Open notification settings** action.
- **Clear server cache** action, limited to React Query memory and its persisted query cache.
- **Reload app** action.
- **Show floating badge** switch.

Each asynchronous action exposes an in-progress state and reports a concise success or failure
message. Actions must not be allowed to execute repeatedly while already running.

## Action Behavior

### Test notification

The action checks notification permission first. If permission is granted, it schedules a local
notification using the existing Expo Notifications integration and the runtime tenant display name.
If permission is not granted, it does not schedule and instead directs the developer to request
permission or open settings.

### Notification permission and settings

The panel refreshes permission state when opened and after returning from device settings. Permission
requests use the existing notification service. Device settings use React Native's supported settings
link rather than a platform-specific private API.

### Runtime diagnostics

Diagnostics come from resolved Expo/runtime configuration, not duplicated constants. URL display is
fail-closed: invalid or missing values display as unavailable. Only the host is exposed.

### Cache and reload

Clear server cache removes React Query's in-memory cache and the persisted React Query client. It
does not touch Zustand stores, authentication, AsyncStorage keys unrelated to React Query, food
history, workout history, or other local app data.

Reload app uses the supported Expo reload mechanism. A reload failure remains visible in the panel
with remediation instead of being silently swallowed.

### Badge preference

Badge visibility defaults to visible and is stored in AsyncStorage under a tenant-scoped developer
preference key. Only this boolean preference is persisted. Invalid stored values fall back to visible.

## Architecture

- A pure developer-tools policy module owns availability, safe diagnostic shaping, and preference-key
  construction.
- A small provider at the application root owns panel visibility and the badge preference.
- A focused action hook adapts existing notification, query-cache, settings, and reload services into
  panel actions.
- The panel renders action state and delegates behavior to the action hook.
- The floating badge and Profile row only open the shared provider; neither duplicates tool logic.
- Tenant runtime configuration remains the source of truth for name, environment, branding, and
  identity.

These boundaries allow additional developer actions to be added as focused modules without turning
the panel or Profile screen into a large feature controller.

## Error Handling and Safety

- Developer actions return explicit success or failure results suitable for user feedback.
- Unexpected device/API errors are logged with a developer-tools prefix and shown without secrets.
- Diagnostics never render API tokens, authorization headers, full URLs, environment-variable
  contents, or user data.
- Cache clearing requires an explicit confirmation because it changes local server-state cache, but
  it must state that login and locally recorded data are preserved.
- The toolbox performs no backend mutations except behavior already performed by the existing app
  services.

## Testing and Verification

Automated tests cover:

- Developer Tools is available only for `__DEV__` plus the `development` tenant environment.
- Preview and production cannot render either entry point.
- The badge visibility key is tenant-scoped, defaults to visible, persists valid values, and rejects
  invalid stored values.
- Runtime diagnostics expose the correct identity/version and sanitize the API value to a host.
- Notification actions schedule only when permission is granted and use `Elevate Coach` as the title.
- Cache clearing removes only React Query memory and persisted query cache.
- The Avihu Expo configuration resolves `name: "Elevate Coach"` without changing native identity.
- Existing generated icons pass the asset validator without regeneration.

Final verification includes focused tests, the full unit suite, strict TypeScript checking, Prettier,
`assets:check`, Expo dependency validation, and the fast Avihu development preflight. A real
development build is used to confirm the panel opens from both entry points, badge hiding/recovery
works, and a test notification appears on a device or simulator that supports notifications.

## Acceptance Criteria

- Avihu development, preview, and production configurations resolve the visible app name as
  `Elevate Coach` while retaining their current identifiers.
- Notifications use `Elevate Coach` rather than `Avihu Team` as their title.
- The supplied COACH icon remains unchanged and passes all existing asset checks.
- A development build exposes the toolbox through the badge and Profile screen.
- Hiding the badge persists across reloads and the Profile entry can show it again.
- Every agreed non-destructive tool works with clear feedback.
- Preview and production expose no Developer Tools UI or action execution path.
