# Photo Upload and RIR History Design

## Goal

Keep the photo upload save action visible on small devices and make recorded-set history with RIR easier to read and edit without broadly redesigning the workout flow.

## Scope

The change covers the shared photo upload drawer and the recorded-set summary, calendar history, and history edit modal used by the workout recording flow. Existing API endpoints, query keys, navigation routes, validation limits, Hebrew copy, RTL behavior, and mutation invalidation behavior remain unchanged.

## Photo Upload Drawer

Selected photos remain in one horizontal preview row. The row scrolls horizontally when its content exceeds the available width, so selecting three or four photos never creates a second vertical row that pushes the save button below the fixed-height drawer. Each thumbnail retains its remove action, and the existing image cap, upload loading state, empty state, picker controls, and confirmation action remain unchanged.

The drawer remains at its current 70% screen height. A taller drawer is unnecessary once preview wrapping is removed and would consume more of the screen for the one-photo profile-image use case.

## Previous Set Summary

`PreviousSetCard` remains a compact summary showing the latest set number, weight, and repetitions. It never displays RIR. Cards with an `onPress` handler retain their history affordance; cards without one remain non-interactive and do not display a misleading action.

Formatting for the compact summary and detailed history is separated so adding RIR to history does not leak it back into `PreviousSetCard`.

## Recorded-Set History

The calendar history retains its calendar, date filtering, scrolling, edit action, and conditional RIR data. Each set is rendered as a compact RTL history row with visually separated values for set number, weight, repetitions, and RIR when present. The edit control remains consistently aligned instead of being displaced when a long pipe-separated sentence wraps.

Sets without RIR omit the RIR value entirely. No placeholder or empty RIR label is shown.

## Editing Historical RIR

The existing history edit modal continues to edit weight and repetitions. It adds an RIR input only when the selected recorded set already has a non-null, defined RIR value. The field uses the current numeric RIR validation rules: integer values from 0 through 20.

Saving such a set includes the edited RIR in the existing update mutation payload. Sets without RIR retain the current two-field editor and cannot gain RIR through this flow. Deleting a set and the existing success/error behavior are unchanged.

## Verification

Focused unit tests cover the distinct compact and detailed formatting behavior and the conditional construction of history edit fields or payloads where extracted helpers make this practical. Verification also includes the repository unit suite, TypeScript checking, and Prettier checking for touched files. Because the issue is layout-dependent, the photo drawer and history row are additionally inspected at narrow mobile widths with three and four selected images and with RIR values present.

## Existing Worktree Changes

The repository already contains uncommitted user changes in files related to this feature. Implementation must preserve those changes and apply only targeted patches around them.
