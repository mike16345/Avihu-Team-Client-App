# Form Presets (Dynamic Questionnaires)

This document explains the new dynamic questionnaires support based on server-side Form Presets.

## New API and Query Hooks

- **`src/hooks/api/useFormPresetsApi.ts`**
  - Wraps the Form Preset endpoints:
    - `getFormPresets()` → `GET /presets/forms`
    - `getFormPresetById(id)` → `GET /presets/forms/one?id=...`
  - Unwraps `{ message, data }` into the actual payload.

- **`src/hooks/queries/useFormPresets.tsx`**
  - React Query hook for the list of presets.

- **`src/hooks/queries/useFormPresetById.tsx`**
  - React Query hook for a single preset by id.

## Navigation and Root Route Screen

- **`src/screens/FormPresetScreen.tsx`**
  - Root route that accepts `{ formId }`.
  - Sets `activeFormId` in the form store.
  - Fetches preset via `useFormPresetById(formId)`.
  - Shows the standard loader while fetching.
  - Renders `<DynamicForm form={formPreset} />` on success.

- **`src/navigators/AppNavigator.tsx`**
  - Registers the `FormPreset` screen in the root stack.

- **`src/navigators/navigationRef.ts`** + **`App.tsx`**
  - Adds a navigation ref to allow deep navigation from notification taps.

## Dynamic Form Rendering + Persistence

- **`src/components/forms/DynamicForm.tsx`**
  - Pure renderer: receives a `FormPreset` and renders sections/questions.
  - Uses the persisted form store to:
    - restore `currentSectionId` / `currentSectionIndex`
    - restore answers keyed by question `_id`
    - persist after any changes
  - Builds Zod validation based on `required` flags.
  - Blocks submit if option-type questions are missing options.
  - On submit:
    - Builds the forward-compatible response payload shape
    - Marks completion in the form store
    - Clears progress

- **Input components added for dynamic questions**
  - `src/components/forms/inputs/RadioGroup.tsx`
  - `src/components/forms/inputs/CheckboxGroup.tsx`
  - `src/components/forms/inputs/RangeSelector.tsx`
  - `src/components/forms/inputs/FileUploadInput.tsx`

## Form Progress + Completion Store

- **`src/store/formStore.ts`**
  - Persisted store for:
    - `activeFormId`
    - `progressByFormId` (answers + section position)
    - completion markers per user and occurrence
    - `shownNotifications` ledger for strict dedupe

## Notifications (Dedupe + Deep Link)

- **`src/hooks/useFormPresetNotifications.tsx`**
  - Fetches presets and shows “late” notifications for eligible monthly/general forms.
  - Uses `shownNotifications` ledger to prevent duplicates.
  - Attaches `{ type: "formPreset", formId }` data for deep link navigation.

- **`src/hooks/useNotification.tsx`**
  - `showNotification` now accepts optional `data`.
  - `notificationResponseListener` exposes a callback for taps.

- **`src/navigators/RootNavigator.tsx`**
  - Registers the notification tap listener.
  - Navigates to `FormPreset` with `{ formId }` on tap.

## Eligibility Helpers

- **`src/hooks/useEligibleFormPresets.tsx`**
  - Centralized eligibility logic for onboarding/monthly/general forms.
  - Uses completion markers and occurrence keys to determine which forms to surface.

## Forward-Compatible Response Mutations

- **`src/hooks/mutations/forms/useAddFormResponse.tsx`**
- **`src/hooks/mutations/forms/useUpdateFormResponse.tsx`**
  - Currently stubs that resolve payloads.
  - Ready to swap to a real endpoint later without UI refactors.

## Utilities + Types

- **`src/interfaces/FormPreset.ts`**
  - Form Preset + response payload types.

- **`src/utils/formPresets.ts`**
  - Occurrence key helpers (`YYYY-MM`, `YYYY-MM-DD`).
  - Option-type detection.
