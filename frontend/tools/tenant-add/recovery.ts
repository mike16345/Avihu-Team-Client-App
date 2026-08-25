import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { tenantIdSchema } from "../../config/tenants/schema";

export const tenantRecoverySchema = z
  .object({
    schemaVersion: z.literal(1),
    tenantId: tenantIdSchema,
    owner: tenantIdSchema,
    slug: tenantIdSchema,
    projectId: z.string().uuid(),
    updateUrl: z.string().url(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type TenantRecovery = z.infer<typeof tenantRecoverySchema>;

const recoveryPath = (root: string, tenantId: string) => {
  const parsed = tenantIdSchema.safeParse(tenantId);
  if (!parsed.success) throw new Error(`Invalid tenant ID for recovery: ${tenantId}`);
  const id = parsed.data;
  return path.join(root, "recovery", `${id}.json`);
};

export const writeTenantRecovery = async (root: string, input: TenantRecovery) => {
  const recovery = tenantRecoverySchema.parse(input);
  const target = recoveryPath(root, recovery.tenantId);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(recovery, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  await rename(temporary, target);
};

export const readTenantRecovery = async (
  root: string,
  tenantId: string
): Promise<TenantRecovery | null> => {
  const target = recoveryPath(root, tenantId);
  try {
    await access(target);
  } catch {
    return null;
  }
  return tenantRecoverySchema.parse(JSON.parse(await readFile(target, "utf8")));
};

export const removeTenantRecovery = async (root: string, tenantId: string) => {
  await rm(recoveryPath(root, tenantId), { force: true });
};
