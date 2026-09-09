import { z } from "zod";

import releasePolicyFile from "./release-policy.json";
import {
  checkStatusSchema,
  type CheckResult,
  type PreflightCounts,
  type PreflightMode,
  type PreflightReport,
} from "./types";

const policyModeSchema = z.enum(["fast", "release", "eas"]);

const policyRuleSchema = z.object({
  check: z.string().min(1),
  status: checkStatusSchema,
  modes: z.array(policyModeSchema).min(1),
  reason: z.string().min(1).optional(),
  acknowledgement: z
    .object({
      reason: z.string().min(1),
      reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
});

export const releasePolicySchema = z.object({
  schemaVersion: z.literal(1),
  rules: z.array(policyRuleSchema),
});

export type ReleasePolicy = z.infer<typeof releasePolicySchema>;

export const releasePolicy: ReleasePolicy = releasePolicySchema.parse(releasePolicyFile);

export interface PolicyApplicationOptions {
  mode: PreflightMode;
  now?: Date;
  policy?: ReleasePolicy;
}

const isReviewExpired = (reviewDate: string, now: Date) => {
  const [year, month, day] = reviewDate.split("-").map(Number);
  return now.getTime() >= Date.UTC(year, month - 1, day);
};

const applyPolicyToResult = (
  result: CheckResult,
  options: PolicyApplicationOptions
): CheckResult => {
  if (result.status === "pass") {
    return result;
  }

  const policy = options.policy ?? releasePolicy;
  const rule = policy.rules.find(
    ({ check, modes }) => check === result.check && modes.includes(options.mode)
  );

  if (!rule) {
    return result;
  }

  const now = options.now ?? new Date();
  const acknowledgement = rule.acknowledgement;
  const expired = acknowledgement ? isReviewExpired(acknowledgement.reviewDate, now) : false;
  const status = expired ? "fail" : rule.status;
  const reason = acknowledgement?.reason ?? rule.reason;

  if (!reason) {
    return { ...result, status };
  }

  return {
    ...result,
    status,
    policy: {
      originalStatus: result.status,
      reason,
      ...(acknowledgement
        ? {
            acknowledged: true,
            reviewDate: acknowledgement.reviewDate,
            expired,
          }
        : {}),
    },
  };
};

const countResults = (results: readonly CheckResult[]): PreflightCounts =>
  results.reduce<PreflightCounts>(
    (counts, result) => ({ ...counts, [result.status]: counts[result.status] + 1 }),
    { pass: 0, warn: 0, fail: 0 }
  );

const isPreflightReport = (
  value: CheckResult | PreflightReport | readonly CheckResult[]
): value is PreflightReport => !Array.isArray(value) && "results" in value;

export function applyPolicy(result: CheckResult, options: PolicyApplicationOptions): CheckResult;
export function applyPolicy(
  results: readonly CheckResult[],
  options: PolicyApplicationOptions
): CheckResult[];
export function applyPolicy(
  report: PreflightReport,
  options: PolicyApplicationOptions
): PreflightReport;
export function applyPolicy(
  resultOrResults: CheckResult | PreflightReport | readonly CheckResult[],
  options: PolicyApplicationOptions
): CheckResult | CheckResult[] | PreflightReport {
  if (isPreflightReport(resultOrResults)) {
    const results = resultOrResults.results.map((result) => applyPolicyToResult(result, options));
    const counts = countResults(results);

    return {
      ...resultOrResults,
      results,
      counts,
      exitCode: counts.fail > 0 ? 1 : 0,
    };
  }

  if (!Array.isArray(resultOrResults)) {
    return applyPolicyToResult(resultOrResults as CheckResult, options);
  }

  return (resultOrResults as readonly CheckResult[]).map((result) =>
    applyPolicyToResult(result, options)
  );
}
