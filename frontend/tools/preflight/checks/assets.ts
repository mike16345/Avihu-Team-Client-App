import { createProcessCheck, type ProcessPreflightContext } from "../processCheck";
import type { CheckDefinition } from "../types";

export const createAssetsCheck = (tenantId: string): CheckDefinition<ProcessPreflightContext> =>
  createProcessCheck({
    check: "assets",
    command: "npm",
    args: ["run", "assets:check", "--", "--tenant", tenantId],
    successSummary: "Tenant assets passed generated-platform validation",
    failureSummary: "Tenant assets failed generated-platform validation",
    remediation: `Run npm run assets:generate -- --tenant ${tenantId}, inspect the previews, and rerun preflight.`,
  });
