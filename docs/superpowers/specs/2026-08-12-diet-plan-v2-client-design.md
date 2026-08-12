# Diet Plan V2 Client Design

## Goal

Render a trainee's real active diet plan using the stored Server version as the authoritative
contract discriminator. Preserve the existing V1 experience, introduce a focused read-only V2
experience, and remove mock and preview behavior that can make the Client appear to have real V2
data when it does not.

This milestone establishes truthful version-aware fetching and rendering. It intentionally does
not define category-level consumption because the current V2 contract contains macros per meal,
not per category.

## Approved Implementation Order

1. Remove obsolete V2 mock contracts, mock plans and catalogs, preview-only branches, fake populated
   states, and V1 serving assumptions presented as V2 behavior.
2. Fetch the trainee's active plan and render V1 or V2 according to the stored plan version.
3. Render the real V2 Server contract read-only.
4. Keep Smart Menu disabled in source and defer consumption behavior until its data contract is
   decided.
5. Preserve the existing WhatsApp prompt while recording its trainer-phone source as unresolved.

The cleanup step must preserve reusable visual components, icons, animation primitives, and the
approved header prompts. It must not remove the hydration prompt, vegetable prompt, or WhatsApp
prompt merely because their current content is hardcoded.

## Authoritative Contracts

The Client models the response as a discriminated union instead of a loose interface whose fields
are mostly optional:

```ts
interface IDietPlanV1 {
  version?: 1;
  meals: IMeal[];
  totalCalories?: number;
  freeCalories?: number;
  fatsPerDay?: number;
  veggiesPerDay?: number;
  customInstructions?: string[];
  supplements?: string[];
}

type DietV2MealCategory = "protein" | "carbs" | "fat" | "vegetables" | "addon";

interface DietV2PlanItem {
  name: string;
  catalogItemId?: string;
}

interface DietV2Category {
  category: DietV2MealCategory;
  items: DietV2PlanItem[];
}

interface DietV2MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietV2FreeCalories {
  calories: number;
  description: string;
}

interface DietV2Meal {
  _id?: string;
  name: string;
  categories: DietV2Category[];
  macros: DietV2MealMacros;
  freeCalories?: DietV2FreeCalories;
  supplements?: string[];
}

interface IDietPlanV2 {
  _id?: string;
  userId?: string;
  trainerId?: string;
  version: 2;
  meals: DietV2Meal[];
  highlights: string;
}

type AnyDietPlan = IDietPlanV1 | IDietPlanV2;
```

The obsolete Client-only V2 contract containing option units, quantities, estimated macros, and
preview metadata must be removed. It does not describe the persisted Server response.

## Version Resolution

The existing `GET /dietPlans/user?userId=<id>&populate=true` request remains the only active-plan
request. Startup prefetch, normal screen loading, and pull-to-refresh continue to share the same
React Query cache entry.

Version resolution follows these rules:

- `version === 2` selects V2.
- `version === 1` selects V1.
- a missing version selects V1 for legacy compatibility;
- any other version is unsupported and must produce a safe error state; and
- the trainer's configured default version never overrides an existing plan response in the
  Client.

The branch occurs once near `MyDietPlanScreen`. V1 and V2 child components receive their own
concrete plan types and do not repeatedly inspect a broad union.

```text
GET /dietPlans/user
        |
        +-- version missing or 1 --> existing V1 component tree
        |
        +-- version 2 ------------> focused V2 component tree
        |
        +-- any other value ------> safe error state
```

The API hook and query options must return `AnyDietPlan` rather than `any`. This change must retain
the current endpoint, query key, one-day stale time, 404 retry behavior, and user-ID enable guard.

## Screen Boundary

`MyDietPlanScreen` continues to own transport-level states:

- loading skeleton;
- pull-to-refresh;
- the existing plan-under-construction state for 404 or a valid response without meaningful plan
  content; and
- the existing error screen for network and Server failures.

After those states are resolved, it renders exactly one version-specific view. Existing V1
components and behavior remain available through a small `DietPlanV1View` boundary or an equivalent
focused wrapper. V2 data is never converted into the legacy serving-based shape.

## V2 Component Design

V2 components live under `frontend/src/components/DietPlanV2` and remain narrow in responsibility:

- `DietPlanV2View` orchestrates the real V2 screen.
- `DietPlanV2Header` renders daily targets calculated from the returned plan and preserves the
  hydration, vegetable, and WhatsApp prompts.
- `DietPlanV2Tabs` exposes My Meals and Highlights. The Smart Menu tab definition remains commented
  out with a concise explanation that its barcode/manual logging contract is deferred.
- `DietPlanV2MealsList` renders the plan's meals.
- `DietPlanV2MealCard` renders one expandable meal and its trainer-entered macros.
- `DietPlanV2CategoryRow` renders a category label and literal item snapshots joined by the exact
  separator string " / ".
- `DietPlanV2FreeCalories` renders a meal's free-calorie amount and description separately from food
  categories.
- `DietPlanV2Highlights` renders the plan-level plain string and a truthful empty state.

Saved meals use their Mongo `_id` as list keys. A deterministic index-based fallback may be used
only as defensive rendering for malformed or transitional responses; the Client must not invent and
persist a second `mealId` concept.

## Derived V2 Targets

Daily targets are derived from the real trainer-entered meal values:

```ts
dailyCalories = sum(meal.macros.calories);
dailyProtein = sum(meal.macros.protein);
dailyCarbs = sum(meal.macros.carbs);
dailyFat = sum(meal.macros.fat);
dailyFreeCalories = sum(meal.freeCalories?.calories ?? 0);
```

Free calories remain separate from meal calories in the data model and UI. The header may show both
the normal calorie target and the free-calorie allowance, but must not silently merge them unless
the existing approved visual label explicitly communicates that total.

V2 categories are display snapshots. Item text is rendered exactly as authored except for normal
outer trimming already performed by the Server. The Client does not parse quantities, units,
calories, or macros from names such as `100 grams Chicken breast`.

## State Isolation

The current daily-serving stores, reset hook, recorded-meal session, serving-limit calculations,
and menu-item lookups encode the V1 servings contract. They must run only for V1.

The first V2 milestone introduces no consumption store. In particular, it must not:

- divide meal macros evenly across categories;
- infer category macros from category names;
- update progress when a category is tapped;
- adapt V2 categories into `totalProtein`, `totalCarbs`, `totalFats`, or `totalVeggies`; or
- display progress values backed by V1 serving calorie constants.

This prevents a V2 plan from reading or mutating persisted V1 serving progress. It also leaves a
clean boundary for a later V2 consumption store once the macro source is approved.

## Cleanup Boundary

Cleanup is behaviorally important and precedes feature implementation. Remove or replace:

- the obsolete mock-era `frontend/src/interfaces/DietPlanV2.ts` definitions;
- mock plans, fake catalogs, preview toggles, preview-only rendering branches, and fake data fallbacks;
- V2 files whose only responsibility was making a static preview interactive;
- hardcoded food or macro values that are presented as trainer data; and
- imports and helpers made unreachable by those removals.

Preserve:

- the core visual language already approved for the diet screen;
- useful V2 icons and animation primitives;
- the hydration prompt;
- the vegetable prompt; and
- the WhatsApp prompt.

Do not revive the deleted prototype Smart Menu implementation. Historical code is reference
material, not production source.

## Highlights and Supplements

V2 `highlights` is a plan-level plain string. The Client renders it as plain text, preserving line
breaks where helpful. It must not pass arbitrary text through the legacy HTML renderer or imply
that V2 highlights are rich text.

Meal-level `supplements?: string[]` exists in the Server contract but its final product placement
remains uncertain and it is absent from the approved Client mock. This milestone preserves the
field in TypeScript but does not add a supplements tab or invent a new presentation.

## WhatsApp Prompt

The existing WhatsApp prompt remains visible. Its current environment-variable destination is not
considered the final implementation.

The following decision is deliberately unresolved:

- whether the destination is the head trainer or the trainee's assigned subtrainer; and
- which authenticated Server response or endpoint supplies that phone number.

Until that decision is made, this milestone must not invent a new ownership rule or a fake phone
number. The source should be marked clearly at the integration boundary for follow-up.

## Empty and Error States

- A 404 response shows the existing plan-under-construction state.
- A valid response without meaningful version-specific content also shows the pending state.
- Network and Server failures show the existing error screen and retry action.
- Unsupported versions show a safe error state rather than falling back to V1.
- A malformed V2 response must not be rendered as V1.
- Empty V2 categories are hidden.
- A meal with no visible category items may still show its name, macros, and free calories.
- Blank highlights render the V2 Highlights empty state.

Runtime guards should be small and targeted. They protect the version boundary and prevent unsafe
rendering; they do not duplicate the Server's full Joi schema in the Client.

## Testing

Use the repository's existing Vitest setup and `__tests__` convention for pure contract and
derivation logic. Tests must demonstrate:

- missing version resolves to V1;
- explicit version 1 resolves to V1;
- version 2 resolves to V2;
- an unsupported version is rejected;
- V2 macro totals sum meal values correctly;
- V2 free calories sum independently;
- literal category item names format with the exact separator string " / ";
- empty categories are excluded from display data;
- V1 content detection still recognizes legacy meals, instructions, and supplements;
- V2 content detection recognizes real meals and highlights; and
- V1-only daily tracking hooks are not mounted from the V2 branch.

The feature must also pass the repository TypeScript check and existing unit suite. Device-level
verification must cover initial loading, V1 rendering, V2 rendering, expansion/collapse, tab
switching, pull-to-refresh, long trainer-authored item strings, empty highlights, and RTL layout.

## Explicitly Deferred Work

- Category-level consumption and whether categories receive their own macro inputs.
- Whole-meal `I ate everything` consumption behavior.
- Any V2 consumed-progress visualization or persisted V2 daily state.
- Smart Menu search, manual logging, history, barcode scanning, and barcode product storage.
- Final supplement placement.
- Head-trainer versus assigned-subtrainer WhatsApp ownership and phone retrieval.
- Cross-application local persistence for unfinished Admin forms.

These are deferred product decisions, not permission to implement estimates or temporary fake
behavior.
