# Agents.md

## 1. Project Philosophy

- This repository is an Expo React Native client application, with nearly all handwritten source code living under `frontend/src`.
- The codebase separates server state, shared client state, and local view state instead of forcing them through one abstraction.
- Reuse is favored through thin shared primitives: a central HTTP layer, feature-specific API hooks, React Query hooks, Zustand stores, UI primitives, and style hooks.
- Cross-feature imports use configured path aliases (`@/` and `@assets/`) rather than long relative paths.

## 2. Architecture Rules

- Source responsibilities are split by top-level folders under `frontend/src`, including `API`, `components`, `config`, `constants`, `hooks`, `interfaces`, `navigators`, `QueryClient`, `schemas`, `screens`, `store`, `styles`, `themes`, `types`, and `utils`.
- HTTP setup is centralized: `frontend/src/config/apiConfig.ts` creates the axios instance, and `frontend/src/API/api.ts` exposes generic request helpers (`fetchData`, `sendData`, `updateItem`, `patchItem`, `deleteItem`).
- Feature-specific backend access belongs in `frontend/src/hooks/api/use*.ts` modules, where endpoint strings are defined locally and responses are shaped for consumers.
- Screens and navigators orchestrate hooks and UI; direct `axios` imports are currently confined to the shared API layer (`frontend/src/config/apiConfig.ts` and `frontend/src/API/api.ts`).
- Navigation is layered: `RootNavigator` handles bootstrap and session gating, then hands off to `AuthNavigator` or `AppNavigator`, while deeper flows are split into stack and tab navigators.
- App-wide providers are composed at the application root in `frontend/App.tsx`; new global providers should be added there instead of being recreated inside feature screens.

## 3. Coding Conventions

- TypeScript strict mode is enabled and should remain the default expectation for new code.
- Components, screens, and many domain types use PascalCase names; functions, variables, and helpers use camelCase.
- Hooks are prefixed with `use...`, and shared Zustand stores are exposed as named `use...Store` hooks.
- Cross-folder imports should prefer `@/` and `@assets/` aliases.
- The repository's formatting contract is defined by Prettier: 2-space indentation, semicolons, double quotes, trailing commas where supported, and a 100-character print width.
- Nullability is modeled explicitly with optional fields and `T | null`; consumers typically guard with early returns or `enabled: !!value` before dereferencing.
- Non-null assertions are used only after a guard has already made the value effectively required in that execution path.
- Error handling is local and lightweight: functions typically catch errors to log them with `console.error` or `console.log`, and rethrow only when a caller still needs to decide the outcome.
- User-facing text should use the shared `Text` component where possible so font mapping and RTL writing direction stay consistent.
- Shared visual tokens should come from `useGlobalStyles()` and related style hooks; component-specific one-off values may still use inline style objects or a local `StyleSheet.create(...)`.

## 4. State & Data Flow

- Server state is managed through React Query hooks in `frontend/src/hooks/queries`.
- Query keys come from `frontend/src/constants/reactQuery.ts` and are built from stable prefixes plus user IDs or entity IDs.
- Mutations live in `frontend/src/hooks/mutations` and typically invalidate affected query keys through `useQueryClient()` on success.
- Shared client state is stored in Zustand stores under `frontend/src/store`.
- State that must survive restarts uses Zustand `persist` with `createJSONStorage(() => AsyncStorage)`, often with `partialize` to store only durable data.
- Ephemeral UI state remains local in components through `useState`, `useEffect`, or feature hooks instead of being promoted into a global store by default.
- Bootstrap flow is centralized in `RootNavigator`: read the persisted session token, validate it through the API layer, hydrate the user store, then choose the first navigator route.
- Cross-cutting side effects such as logout, background tasks, toasts, notifications, font loading, and RTL setup are encapsulated in dedicated hooks instead of being duplicated across screens.

## 5. Testing Standards

- No repository-owned `*.test.*` or `*.spec.*` files were found under `frontend/src`.
- `frontend/package.json` defines no test script, so no automated test runner is currently established as a project standard.
- An empty `frontend/src/utils/__tests__` directory exists, which is the only visible repository-owned test-location convention.
- Because no implemented test suite exists yet, agents should not invent a new testing stack as part of routine feature work.
- If tests are introduced, colocate them with the covered code and follow the existing `__tests__` directory naming convention rather than creating a separate parallel layout.

## 6. API & Backend Conventions (if applicable)

- This repository is frontend-only; backend behavior is consumed through HTTP requests rather than implemented here.
- Shared request helpers inject common headers, including the API key header, before forwarding requests through the configured axios instance.
- Feature API hooks commonly model backend envelopes as `ApiResponse<T>` and often return `res.data` so UI and query hooks work with domain data instead of raw transport wrappers.
- Environment-dependent URLs and tokens are resolved through Expo constants and `EXPO_PUBLIC_*` environment variables in config or the shared API layer.
- New backend calls should extend the existing API helper pattern instead of duplicating axios setup in feature code.

## 7. UI/UX Conventions (if applicable)

- The app is RTL-first: the root tree sets RTL direction, and the shared `Text` primitive applies `writingDirection: "rtl"`.
- Reusable UI primitives live in `frontend/src/components/ui`, while feature-specific UI is organized under `frontend/src/components/<Feature>`.
- Shared styling is utility-like: `useGlobalStyles()` aggregates layout, spacing, text, and color style sheets so components compose style arrays from common tokens.
- Theme tokens are centralized in `frontend/src/themes/useAppTheme.tsx`; repeated color or typography values should be added to the theme/style layer before being duplicated across multiple screens.
- Motion and interaction feedback are part of the existing UI vocabulary through `react-native-reanimated` animations and haptic helper utilities.

## 8. Performance & Optimization Patterns

- React Query cache lifetimes are explicitly configured with shared duration constants such as `ONE_HOUR` and `ONE_DAY`.
- Queries are commonly disabled until the required identifier exists, which prevents unnecessary requests during bootstrap and null states.
- Query cache persistence is enabled through an AsyncStorage persister in `frontend/src/QueryClient/queryPersister.ts`.
- Retry behavior is explicitly customized for some queries through `createRetryFunction(...)` instead of relying only on defaults.
- Persisted Zustand stores often limit stored state with `partialize` and may clear stale data during rehydration or on app resume.
- Time-sensitive persisted state is actively expired instead of being retained indefinitely (for example, the workout session store and expiry watcher).

## 9. Anti-Patterns Observed

- Do not import `axios` directly into screens, components, stores, or query hooks; the current codebase routes HTTP through the shared API layer.
- Do not introduce another global state framework for problems already covered by React Query or Zustand.
- Do not hardcode new query key strings inside feature code when the project already centralizes query key prefixes in `frontend/src/constants/reactQuery.ts`.
- Do not bypass shared theme, text, and style hooks for repeated visual patterns.
- Do not place session bootstrapping or other cross-screen side effects in unrelated feature screens when the codebase already has root-level navigators and dedicated hooks for that work.
- Do not manually edit generated or runtime artifact folders such as `frontend/dist`, `frontend/.expo`, or `frontend/node_modules` as if they were the source of truth.

## 10. Agent Operating Rules

- Add new features by extending the existing layer boundaries: API access in `frontend/src/hooks/api`, server-state orchestration in `frontend/src/hooks/queries` or `frontend/src/hooks/mutations`, shared client state in `frontend/src/store`, and UI in `frontend/src/components`, `frontend/src/screens`, and `frontend/src/navigators`.
- Place new files in an existing responsibility-matched folder whenever possible, and avoid creating new top-level architectural categories unless the same need is repeated across multiple features.
- Preserve the current separation of concerns when refactoring: screens should stay orchestration-focused, API hooks should stay transport-focused, and stores should stay state-focused.
- Refactors should be incremental and structure-preserving; keep stable public names, existing query key prefixes, provider placement, and store entry points unless a repository-wide change intentionally replaces them.
- Prefer targeted patches over full-file rewrites.
- Full-file rewrites are acceptable only when the file is generated, the change is truly structural, or a localized patch would be less safe than replacing the whole file.
- Keep imports, naming, file placement, and style composition aligned with the nearest existing implementation before introducing a new abstraction.
- If evidence for a rule is ambiguous or only appears once, document it as not yet established instead of promoting it to a repository rule.
- If during future work a repeated implementation pattern appears in 3+ places, the agent must update `Agents.md` and formalize it as a rule.
- Agents must treat `Agents.md` as a living document.
- Append new rules when consistency is detected across multiple files.
- Never remove rules unless they are explicitly deprecated by the user or by an intentional repository-wide change.
- When updating this file, preserve the existing section structure and extend it with new evidence rather than replacing concrete rules with broader, less testable language.
