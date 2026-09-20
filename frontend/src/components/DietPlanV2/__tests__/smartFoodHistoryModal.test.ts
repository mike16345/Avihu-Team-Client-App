import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const historyModalSource = readFileSync(
  path.join(process.cwd(), "src", "components", "DietPlanV2", "SmartFoodHistoryModal.tsx"),
  "utf8"
);

describe("SmartFoodHistoryModal RTL layout", () => {
  it.each(["dayTitle", "totalLabel", "entryName", "entryMeta"])(
    "anchors %s at logical text start",
    (styleName) => {
      expect(historyModalSource).toMatch(
        new RegExp(`style=\\{\\[[^\\]]*text\\.textStart[^\\]]*styles\\.${styleName}[^\\]]*\\]\\}`)
      );
    }
  );
});
