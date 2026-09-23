import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";
import { getTenant } from "../../config/tenants/registry";
import { TENANT_ENVIRONMENTS } from "../../config/tenants/types";
import type { AppSelection } from "./types";

const platformSchema = z.enum(["android", "ios"]);
const environmentSchema = z.enum(TENANT_ENVIRONMENTS);
const baseSelectionSchema = z.object({
  tenantId: z.string().min(1),
  environment: environmentSchema,
});

const appSelectionSchema = z.discriminatedUnion("action", [
  baseSelectionSchema.extend({ action: z.literal("start") }).strict(),
  baseSelectionSchema
    .extend({
      action: z.literal("run"),
      platform: platformSchema,
      device: z.string().min(1).optional(),
    })
    .strict(),
  baseSelectionSchema
    .extend({
      action: z.literal("install"),
      platform: platformSchema,
      binaryPath: z.string().min(1),
      device: z.string().min(1).optional(),
    })
    .strict(),
  baseSelectionSchema
    .extend({ action: z.literal("preflight"), mode: z.enum(["fast", "release"]) })
    .strict(),
  baseSelectionSchema
    .extend({ action: z.literal("assets"), operation: z.enum(["generate", "audit"]) })
    .strict(),
  baseSelectionSchema
    .extend({
      action: z.literal("build"),
      platform: platformSchema,
      profile: environmentSchema,
      usePackageScript: z.boolean().optional(),
    })
    .strict(),
  baseSelectionSchema
    .extend({
      action: z.literal("submit"),
      platform: platformSchema,
      profile: environmentSchema,
    })
    .strict(),
  baseSelectionSchema
    .extend({ action: z.literal("update"), updateMessage: z.string().min(1).optional() })
    .strict(),
]);

export const getPreviousSelectionPath = (projectRoot = process.cwd()): string =>
  join(projectRoot, ".app-control", "last-selection.json");

export const readPreviousSelection = (projectRoot = process.cwd()): AppSelection | null => {
  try {
    const parsed = appSelectionSchema.parse(
      JSON.parse(readFileSync(getPreviousSelectionPath(projectRoot), "utf8"))
    ) as AppSelection;
    getTenant(parsed.tenantId);
    return parsed;
  } catch {
    return null;
  }
};

export const writePreviousSelection = (
  selection: AppSelection,
  projectRoot = process.cwd()
): void => {
  const path = getPreviousSelectionPath(projectRoot);
  const temporaryPath = `${path}.tmp`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(temporaryPath, `${JSON.stringify(selection, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, path);
};
