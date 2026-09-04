import { access, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { tenantFeatureDefaultsSchema } from "../../config/tenants/features";
import { tenantIdSchema, tenantNativeCapabilitiesSchema } from "../../config/tenants/schema";
import { THEME_PRESET_IDS } from "../../config/tenants/themePresets";

const themeSelectionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("preset"), presetId: z.enum(THEME_PRESET_IDS) }).strict(),
  z.object({ kind: z.literal("recipe-file"), path: z.string().min(1) }).strict(),
]);

const draftAnswersSchema = z
  .object({
    mode: z.enum(["local", "repository"]).optional(),
    id: tenantIdSchema.optional(),
    displayName: z.string().trim().min(1).optional(),
    logoPath: z.string().optional(),
    expoOwner: tenantIdSchema.optional(),
    identifierBase: z.string().min(1).optional(),
    themeSelection: themeSelectionSchema.optional(),
    supportsRtl: z.boolean().optional(),
    forcesRtl: z.boolean().optional(),
    featureDefaults: tenantFeatureDefaultsSchema.optional(),
    nativeCapabilities: tenantNativeCapabilitiesSchema.optional(),
  })
  .strict();

export const tenantAddDraftSchema = z
  .object({
    schemaVersion: z.literal(1),
    tenantId: tenantIdSchema,
    updatedAt: z.string().datetime(),
    answers: draftAnswersSchema,
  })
  .strict()
  .superRefine((draft, context) => {
    if (draft.answers.id && draft.answers.id !== draft.tenantId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers", "id"],
        message: "Draft tenant ID must match its answers",
      });
    }
  });

export type TenantAddDraft = z.infer<typeof tenantAddDraftSchema>;

const draftPath = (root: string, tenantId: string) =>
  path.join(root, "drafts", `${tenantIdSchema.parse(tenantId)}.json`);

export const writeTenantDraft = async (root: string, input: TenantAddDraft) => {
  const draft = tenantAddDraftSchema.parse(input);
  const target = draftPath(root, draft.tenantId);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(draft, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  await rename(temporary, target);
};

export const readTenantDraft = async (
  root: string,
  tenantId: string
): Promise<TenantAddDraft | null> => {
  const target = draftPath(root, tenantId);
  try {
    await access(target);
  } catch {
    return null;
  }
  return tenantAddDraftSchema.parse(JSON.parse(await readFile(target, "utf8")));
};

export const listTenantDrafts = async (root: string): Promise<TenantAddDraft[]> => {
  const directory = path.join(root, "drafts");
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch {
    return [];
  }
  const drafts = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => readTenantDraft(root, entry.slice(0, -".json".length)))
  );
  return drafts.filter((draft): draft is TenantAddDraft => draft !== null);
};

export const removeTenantDraft = async (root: string, tenantId: string) => {
  await rm(draftPath(root, tenantId), { force: true });
};
