import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getPreviousSelectionPath,
  readPreviousSelection,
  writePreviousSelection,
} from "../history";

const temporaryDirectories: string[] = [];

const createTemporaryRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "app-control-history-"));
  temporaryDirectories.push(root);
  return root;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("app-control history", () => {
  it("round-trips the previous structured selection", () => {
    const root = createTemporaryRoot();
    const selection = {
      action: "run" as const,
      tenantId: "avihu",
      environment: "development" as const,
      platform: "android" as const,
    };

    writePreviousSelection(selection, root);

    expect(readPreviousSelection(root)).toEqual(selection);
    expect(JSON.parse(readFileSync(getPreviousSelectionPath(root), "utf8"))).toEqual(selection);
  });

  it("ignores malformed or stale history", () => {
    const root = createTemporaryRoot();
    const path = getPreviousSelectionPath(root);
    writePreviousSelection(
      {
        action: "start",
        tenantId: "avihu",
        environment: "development",
      },
      root
    );
    writeFileSync(path, JSON.stringify({ action: "run", tenantId: "missing" }));

    expect(readPreviousSelection(root)).toBeNull();
  });
});
