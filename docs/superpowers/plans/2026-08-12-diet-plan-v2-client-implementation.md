# Diet Plan V2 Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch a trainee's real active diet plan, preserve the existing V1 experience, and render the stored V2 contract through a truthful read-only mobile UI with no preview or mock-plan behavior.

**Architecture:** Keep the existing active-plan endpoint and React Query cache, type its response as a strict V1/V2 union, and resolve the stored version once in `MyDietPlanScreen`. Move the legacy serving/reset behavior behind a V1-only view and give V2 a separate prop-driven component tree that derives display totals from trainer-entered meal macros without creating consumption state.

**Tech Stack:** Expo 53, React Native 0.79, React 19, TypeScript 5.8, TanStack Query 5, Zustand, React Native Reanimated, React Native SVG, Vitest.

## Global Constraints

- The stored plan version is authoritative: missing or `1` is V1, `2` is V2, and every other value is unsupported.
- Keep `GET /dietPlans/user?userId=<id>&populate=true`, the existing query key, one-day stale time, retry behavior, startup prefetch, and pull-to-refresh flow.
- Do not convert V2 data into legacy serving fields or run V1 serving/reset/session behavior for V2.
- V2 is read-only in this milestone. Do not add category tapping, `I ate everything`, consumed progress, or a V2 persistence store.
- Preserve the hydration, vegetable, and WhatsApp header prompts. Keep the current WhatsApp destination temporarily and mark its real trainer/subtrainer phone source as unresolved at the integration boundary.
- Keep Smart Menu commented out with a concise reason; do not restore its historical mock implementation.
- Render trainer-authored item names literally and join items within a category with `/`.
- Render V2 highlights as plain text, not HTML.
- Preserve `supplements?: string[]` in the V2 type without inventing a Client presentation.
- Keep V1 behavior and Hebrew/RTL presentation unchanged outside the cleanup needed to establish the version boundary.
- Follow `AGENTS.md`: focused files, path aliases, shared `Text`, theme/style hooks, no direct Axios outside the shared layer, and no opportunistic refactors.
- Use test-first development for new contract and derivation behavior.
- Baseline verification is `npm run typecheck` and `TZ=UTC npm run test:unit`. The unqualified unit command has one pre-existing New York timezone failure in `formPresets.test.ts`.

---

### Task 1: Remove Preview-Era Production Naming and Obsolete V2 Types

**Files:**

- Delete: `frontend/src/interfaces/DietPlanV2.ts`
- Rename: `frontend/src/components/DietPlan/DailyCalorieIntakeStyle1.tsx` to `frontend/src/components/DietPlan/DietPlanV1Summary.tsx`
- Modify: `frontend/src/components/DietPlan/DietPlanScreenHeader.tsx`
- Create: `frontend/src/components/DietPlan/DietPlanV1View.tsx`
- Modify: `frontend/src/screens/MyDietPlanScreen.tsx`

**Interfaces:**

- Produces: `DietPlanV1View: React.FC`, the only component that mounts `useDailyDietReset()` and composes the existing `DietPlanScreenHeader` plus `DietPlanContentTabs`.
- Produces: `DietPlanV1Summary: React.FC`, a behavior-preserving rename of the existing production summary card.
- Preserves: the three current prompt rows and the current V1 serving calculations.

- [ ] **Step 1: Record the cleanup baseline**

Run:

```bash
rg -n "DailyCalorieIntakeStyle1|@/interfaces/DietPlanV2|DietV2Plan|DietV2Option" frontend/src
npm run typecheck
```

Expected: the style name is used only by `DietPlanScreenHeader`, the obsolete V2 interface has no production consumers, and TypeScript exits `0`.

- [ ] **Step 2: Remove the unused mock-era contract and rename the V1 summary**

Delete `frontend/src/interfaces/DietPlanV2.ts`. Move the existing summary implementation without changing its rendered behavior:

```bash
mv frontend/src/components/DietPlan/DailyCalorieIntakeStyle1.tsx \
  frontend/src/components/DietPlan/DietPlanV1Summary.tsx
```

Rename the component declaration and default export from `DailyCalorieIntakeStyle1` to `DietPlanV1Summary`. Remove only dead implementation details proven unused by TypeScript or local search, such as an unused `MacroCol.color` property or unreachable styles. Do not remove the three prompt rows.

- [ ] **Step 3: Add a V1-only view boundary**

Create `frontend/src/components/DietPlan/DietPlanV1View.tsx`:

```tsx
import { View } from "react-native";
import { useDailyDietReset } from "@/hooks/useDailyDietReset";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanContentTabs from "./DietPlanContentTabs";
import DietPlanScreenHeader from "./DietPlanScreenHeader";

const DietPlanV1View = () => {
  const { spacing } = useStyles();
  useDailyDietReset();

  return (
    <View style={spacing.gap34}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default DietPlanV1View;
```

Update `DietPlanScreenHeader` to import `DietPlanV1Summary`.

- [ ] **Step 4: Make the current screen use the V1 boundary without changing behavior**

In `MyDietPlanScreen`, remove the direct `useDailyDietReset()` call and replace the direct header/tabs composition with `<DietPlanV1View />`. Keep the existing loading, pending, error, scrolling, and refresh code unchanged in this task.

- [ ] **Step 5: Verify cleanup**

Run:

```bash
rg -n "DailyCalorieIntakeStyle1|@/interfaces/DietPlanV2|DietV2Plan|DietV2Option" frontend/src
npm run typecheck
TZ=UTC npm run test:unit
```

Expected: `rg` finds no obsolete production references, TypeScript exits `0`, and all existing unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/interfaces/DietPlanV2.ts \
  frontend/src/components/DietPlan/DietPlanV1Summary.tsx \
  frontend/src/components/DietPlan/DietPlanScreenHeader.tsx \
  frontend/src/components/DietPlan/DietPlanV1View.tsx \
  frontend/src/screens/MyDietPlanScreen.tsx
git commit -m "refactor: isolate legacy diet plan view"
```

---

### Task 2: Add the Versioned Contract and Render the Real V2 Plan

**Files:**

- Modify: `frontend/src/interfaces/DietPlan.ts`
- Create: `frontend/src/interfaces/IDietPlanV2.ts`
- Create: `frontend/src/interfaces/DietPlanTypes.ts`
- Create: `frontend/src/components/DietPlanV2/dietPlanV2Utils.ts`
- Test: `frontend/src/components/DietPlanV2/__tests__/dietPlanV2Utils.test.ts`
- Modify: `frontend/src/hooks/api/useDietPlanApi.ts`
- Modify: `frontend/src/hooks/queries/useDietPlanQuery.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2View.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2Header.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2Tabs.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2MealsList.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2MealCard.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2CategoryRow.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2FreeCalories.tsx`
- Create: `frontend/src/components/DietPlanV2/DietPlanV2Highlights.tsx`
- Modify: `frontend/src/screens/MyDietPlanScreen.tsx`

**Interfaces:**

- Produces: `AnyDietPlan = IDietPlan | IDietPlanV2` from `interfaces/DietPlanTypes.ts`.
- Produces: `resolveDietPlanVersion(plan: unknown): 1 | 2 | null`; `null` means unsupported or malformed discriminator.
- Produces: `isDietPlanV2(plan: unknown): plan is IDietPlanV2`.
- Produces: `getDietPlanContentState(plan: AnyDietPlan): "empty" | "ready"`.
- Produces: `computeDietPlanV2Totals(plan: IDietPlanV2): DietPlanV2Totals`.
- Produces: `getVisibleDietV2Categories(meal: DietV2Meal): DietV2Category[]`.
- Produces: `formatDietV2CategoryItems(category: DietV2Category): string`.
- Consumes: `DietPlanV1View` from Task 1.

- [ ] **Step 1: Write failing contract and derivation tests**

Create `frontend/src/components/DietPlanV2/__tests__/dietPlanV2Utils.test.ts` with a real V2 fixture built inside the test file and these assertions:

```ts
import { describe, expect, it } from "vitest";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import {
  computeDietPlanV2Totals,
  formatDietV2CategoryItems,
  getDietPlanContentState,
  getVisibleDietV2Categories,
  isDietPlanV2,
  resolveDietPlanVersion,
} from "../dietPlanV2Utils";

const plan: IDietPlanV2 = {
  version: 2,
  highlights: "לשתות מים\nלהכין מראש",
  meals: [
    {
      _id: "meal-1",
      name: "ארוחה 1",
      categories: [
        {
          category: "protein",
          items: [{ name: "100 גרם חזה עוף" }, { name: "2 ביצים" }],
        },
        { category: "vegetables", items: [] },
      ],
      macros: { calories: 448, protein: 25, carbs: 45, fat: 12 },
      freeCalories: { calories: 150, description: "פרי / חטיף / כף ממרח" },
    },
    {
      _id: "meal-2",
      name: "ארוחה 2",
      categories: [{ category: "carbs", items: [{ name: "200 גרם אורז" }] }],
      macros: { calories: 590, protein: 40, carbs: 60, fat: 10 },
    },
  ],
};

describe("diet plan version resolution", () => {
  it("treats a missing version and explicit version 1 as V1", () => {
    expect(resolveDietPlanVersion({ meals: [] })).toBe(1);
    expect(resolveDietPlanVersion({ version: 1, meals: [] })).toBe(1);
  });

  it("selects V2 only for literal version 2", () => {
    expect(resolveDietPlanVersion(plan)).toBe(2);
  });

  it("rejects unsupported versions", () => {
    expect(resolveDietPlanVersion({ version: 3, meals: [] })).toBeNull();
  });

  it("rejects a malformed V2 payload at the V2 type boundary", () => {
    expect(isDietPlanV2({ version: 2, meals: [], highlights: "" })).toBe(true);
    expect(isDietPlanV2({ version: 2, meals: [{ name: "broken" }], highlights: "" })).toBe(false);
  });
});

describe("V2 display derivation", () => {
  it("sums meal macros and free calories without merging them", () => {
    expect(computeDietPlanV2Totals(plan)).toEqual({
      calories: 1038,
      protein: 65,
      carbs: 105,
      fat: 22,
      freeCalories: 150,
    });
  });

  it("keeps literal item text and joins it with slashes", () => {
    expect(formatDietV2CategoryItems(plan.meals[0].categories[0])).toBe(
      "100 גרם חזה עוף / 2 ביצים"
    );
  });

  it("hides categories without item names", () => {
    expect(getVisibleDietV2Categories(plan.meals[0]).map(({ category }) => category)).toEqual([
      "protein",
    ]);
  });

  it("detects meaningful V1 and V2 content", () => {
    expect(getDietPlanContentState({ meals: [] } as any)).toBe("empty");
    expect(getDietPlanContentState(plan)).toBe("ready");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "" })).toBe("empty");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "דגש" })).toBe("ready");
  });
});
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
npx vitest run src/components/DietPlanV2/__tests__/dietPlanV2Utils.test.ts
```

Expected: FAIL because `IDietPlanV2` and `dietPlanV2Utils` do not exist.

- [ ] **Step 3: Add the exact Client contracts**

Add `version?: 1`, optional `_id`, and optional `userId` to `IDietPlan` without changing its legacy meal fields.

Create `frontend/src/interfaces/IDietPlanV2.ts` with exactly:

```ts
export const DIET_V2_MEAL_CATEGORIES = ["protein", "carbs", "fat", "vegetables", "addon"] as const;
export type DietV2MealCategory = (typeof DIET_V2_MEAL_CATEGORIES)[number];

export interface DietV2PlanItem {
  name: string;
  catalogItemId?: string;
}

export interface DietV2Category {
  category: DietV2MealCategory;
  items: DietV2PlanItem[];
}

export interface DietV2MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietV2FreeCalories {
  calories: number;
  description: string;
}

export interface DietV2Meal {
  _id?: string;
  name: string;
  categories: DietV2Category[];
  macros: DietV2MealMacros;
  freeCalories?: DietV2FreeCalories;
  supplements?: string[];
}

export interface IDietPlanV2 {
  _id?: string;
  userId?: string;
  trainerId?: string;
  version: 2;
  meals: DietV2Meal[];
  highlights: string;
}
```

Do not add option quantities, units, item macros, preview flags, or consumption fields.

Create `frontend/src/interfaces/DietPlanTypes.ts` as the transport union boundary:

```ts
import type { IDietPlan } from "./DietPlan";
import type { IDietPlanV2 } from "./IDietPlanV2";

export type AnyDietPlan = IDietPlan | IDietPlanV2;
```

- [ ] **Step 4: Implement the tested pure helpers**

Create `dietPlanV2Utils.ts` with category labels and pure derivation functions. `resolveDietPlanVersion` must check that the input is a non-null object, treat only missing/`1` as V1, treat literal `2` as V2, and return `null` otherwise. `isDietPlanV2` must verify the literal discriminator, top-level meal array and highlights string, and each meal's name, category array, required finite macro numbers, optional free-calorie shape, and item-name strings before the screen casts or renders it. `computeDietPlanV2Totals` must reduce finite meal values and keep `freeCalories` separate. `getVisibleDietV2Categories` must remove empty/blank-only item lists without changing item order. `formatDietV2CategoryItems` must trim only for display filtering and join nonblank names with `/`.

Use these exact labels:

```ts
export const DIET_V2_CATEGORY_LABELS: Record<DietV2MealCategory, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
  addon: "תוספות",
};
```

For V1 content detection, meaningful content is any meal, nonblank legacy instruction, or nonblank legacy supplement. For V2, meaningful content is any meal or nonblank `highlights`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run src/components/DietPlanV2/__tests__/dietPlanV2Utils.test.ts
```

Expected: all new tests pass.

- [ ] **Step 6: Type the API and query without changing transport behavior**

Import `AnyDietPlan` from `interfaces/DietPlanTypes.ts` and change read return envelopes to `ApiResponse<AnyDietPlan>`. Keep V1 mutation signatures unchanged because the Client does not write V2. In `useDietPlanQuery`, use `UseQueryOptions<AnyDietPlan, unknown, AnyDietPlan, string[]>`, accept `getDietPlanByUserId: (userId: string) => Promise<AnyDietPlan>`, and preserve the existing query key and options exactly.

- [ ] **Step 7: Build the prop-driven V2 presentation**

All V2 components consume props and must not call `useDietPlanQuery`, legacy menu-item queries, V1 Zustand stores, `useDailyDietReset`, or `useRecordMeal`.

`DietPlanV2View` accepts `{ plan: IDietPlanV2 }`, computes totals once, and composes a header plus tabs inside the existing screen scroll context.

`DietPlanV2Header` accepts `{ totals: DietPlanV2Totals }` and renders:

- a calorie donut/summary with consumed value fixed truthfully at `0` because consumption is deferred;
- target calories from `totals.calories`;
- protein, carbohydrates, and fat as `0 / target` bars;
- the separate free-calorie allowance when greater than zero; and
- the existing hydration, vegetable, and WhatsApp prompts.

Keep the current WhatsApp URL construction temporarily and place this exact comment immediately above its helper or press handler:

```ts
// Product question: Decide whether WhatsApp targets the head trainer or assigned subtrainer,
// then source that phone number from an authenticated Server response.
```

Do not add a fake fallback phone number.

`DietPlanV2Tabs` accepts `{ plan: IDietPlanV2 }`, defaults to `"הארוחות שלי"`, and exposes only:

```ts
const tabs: TabItem[] = [
  { label: "דגשים", value: "דגשים", content: <DietPlanV2Highlights highlights={plan.highlights} /> },
  { label: "הארוחות שלי", value: "הארוחות שלי", content: <DietPlanV2MealsList meals={plan.meals} /> },
  // Smart Menu stays disabled until barcode/manual logging has a real Server contract.
  // { label: "תפריט חכם", value: "תפריט חכם", content: <DietPlanV2SmartMenu /> },
];
```

Do not import or create `DietPlanV2SmartMenu`.

`DietPlanV2MealCard` must:

- use `meal._id ?? `diet-v2-meal-${index}`` only as its React key at the list boundary;
- default the first meal to expanded and later meals to collapsed;
- show the saved meal name, falling back visually to `ארוחה ${index + 1}` only when blank;
- show calories, protein, carbs, and fat from `meal.macros`;
- show a `+ N קק״ל חופשי` badge when present;
- render only visible categories;
- render free calories as a separate block with both calories and description; and
- contain no completion/category action buttons.

`DietPlanV2CategoryRow` renders the label from `DIET_V2_CATEGORY_LABELS` and the formatted literal item line. `DietPlanV2Highlights` splits no domain data and renders the plain string with preserved line breaks; blank text shows `אין דגשים`. `DietPlanV2FreeCalories` renders nothing when absent and otherwise shows `קלוריות חופשיות · N קק״ל` plus the saved description.

Keep files below the repository's 350–400 line guidance by sharing only small, stable visual primitives. Reuse `dietV2Icons.tsx`, `Tabs`, `Collapsible`, shared `Text`, and `useGlobalStyles` rather than restoring preview components.

- [ ] **Step 8: Add the authoritative screen branch**

In `MyDietPlanScreen`:

1. Keep query/loading/refresh/error handling at the screen.
2. Resolve the version once with `resolveDietPlanVersion(data)`.
3. Render `ErrorScreen` with `new Error("גרסת תפריט התזונה אינה נתמכת")` before content detection when the discriminator is unsupported.
4. For version 2, render the same safe error state when `isDietPlanV2(data)` is false.
5. Use `getDietPlanContentState(data)` only after the version/type boundary is valid.
6. Render the pending state for 404 or valid empty content.
7. Render `<DietPlanV1View />` for V1.
8. Render `<DietPlanV2View plan={data} />` only after `isDietPlanV2` narrows the response.

Do not read the trainer's configured default version in this screen.

- [ ] **Step 9: Verify the integrated vertical slice**

Run:

```bash
npx prettier --check \
  src/interfaces/DietPlan.ts \
  src/interfaces/IDietPlanV2.ts \
  src/interfaces/DietPlanTypes.ts \
  "src/components/DietPlanV2/**/*.{ts,tsx}" \
  src/hooks/api/useDietPlanApi.ts \
  src/hooks/queries/useDietPlanQuery.tsx \
  src/screens/MyDietPlanScreen.tsx
npm run typecheck
TZ=UTC npm run test:unit
rg -n "dietV2MockPlan|mockFoodCatalog|Preview|DietV2Option|manualPrimaryGrams|cloudSourced" src/components/DietPlan src/components/DietPlanV2 src/interfaces src/screens/MyDietPlanScreen.tsx
```

Expected: formatting, TypeScript, and all unit tests pass; `rg` finds no preview/mock contract artifacts.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/interfaces/DietPlan.ts \
  frontend/src/interfaces/IDietPlanV2.ts \
  frontend/src/interfaces/DietPlanTypes.ts \
  frontend/src/components/DietPlanV2 \
  frontend/src/hooks/api/useDietPlanApi.ts \
  frontend/src/hooks/queries/useDietPlanQuery.tsx \
  frontend/src/screens/MyDietPlanScreen.tsx
git commit -m "feat: render versioned diet plans in client"
```

---

### Task 3: Validate State Isolation and Device-Facing Edge Cases

**Files:**

- Modify if required by failing verification only: files changed in Tasks 1–2
- Update: `AGENTS.md` only if implementation establishes a repeated pattern in at least three places

**Interfaces:**

- Consumes: the completed V1/V2 screen boundary and prop-driven V2 component tree.
- Produces: verified behavior with no additional product scope.

- [ ] **Step 1: Audit dependency isolation**

Run:

```bash
rg -n "useDietServingsStore|useDailyDietReset|useRecordMeal|useMenuItemsQuery|useFoodGroupQuery" \
  frontend/src/components/DietPlanV2
rg -n "DietPlanV2" frontend/src/store frontend/src/hooks/useDailyDietReset.ts frontend/src/hooks/useRecordMeal.tsx
```

Expected: no V1 tracking or menu-item dependency exists in the V2 component tree, and V1 stores/hooks do not import V2 types.

- [ ] **Step 2: Verify representative data shapes through focused tests**

Extend the existing V2 utility test only if missing coverage is revealed. Required cases are:

- one meal with a missing `_id` remains valid display data;
- long literal item strings are returned unchanged except outer trimming;
- a meal with empty categories but macros/free calories is still meaningful;
- blank-only V2 highlights are empty when there are no meals; and
- malformed/unsupported version values never resolve to V1.

Run the focused test after each added case and observe it fail before changing production code.

- [ ] **Step 3: Run final automated verification**

Run:

```bash
npx prettier --check "src/**/*.{ts,tsx}" docs/superpowers/specs/2026-08-12-diet-plan-v2-client-design.md \
  docs/superpowers/plans/2026-08-12-diet-plan-v2-client-implementation.md
npm run typecheck
TZ=UTC npm run test:unit
git diff --check
```

Expected: every command exits `0`.

- [ ] **Step 4: Perform device-level verification when the configured simulator is available**

Using real or API-fixture responses rather than in-app mock plans, verify:

1. an unversioned V1 plan renders the unchanged V1 screen;
2. a V2 response renders only the V2 screen;
3. V2 meal cards expand and collapse smoothly in RTL;
4. category items appear in authored order separated by `/`;
5. meal macros and free calories match the response exactly;
6. Highlights renders plain multiline text and its empty state;
7. pull-to-refresh remains usable;
8. a 404 shows the pending state; and
9. an unsupported version shows an error instead of V1.

If the environment cannot supply both real response versions, record the missing device checks in the task report rather than adding mock data to production source.

- [ ] **Step 5: Commit verification-driven fixes, if any**

If verification required source changes, stage the scoped source and test paths, then verify the staged diff before committing:

```bash
git add frontend/src/components/DietPlan \
  frontend/src/components/DietPlanV2 \
  frontend/src/hooks/api/useDietPlanApi.ts \
  frontend/src/hooks/queries/useDietPlanQuery.tsx \
  frontend/src/interfaces/DietPlan.ts \
  frontend/src/interfaces/IDietPlanV2.ts \
  frontend/src/interfaces/DietPlanTypes.ts \
  frontend/src/screens/MyDietPlanScreen.tsx
git diff --cached --check
git commit -m "fix: harden versioned diet plan rendering"
```

If no source changes were required, do not create an empty commit.
