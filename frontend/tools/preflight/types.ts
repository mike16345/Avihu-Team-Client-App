import { z } from "zod";

export const CHECK_STATUSES = ["pass", "warn", "fail"] as const;

export const checkStatusSchema = z.enum(CHECK_STATUSES);

export type CheckStatus = z.infer<typeof checkStatusSchema>;

export const checkResultSchema = z.object({
  status: checkStatusSchema,
  check: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(z.string()).optional(),
  remediation: z.string().min(1).optional(),
  policy: z
    .object({
      originalStatus: checkStatusSchema,
      reason: z.string().min(1),
      acknowledged: z.boolean().optional(),
      reviewDate: z.string().optional(),
      expired: z.boolean().optional(),
    })
    .optional(),
});

export type CheckResult = z.infer<typeof checkResultSchema>;

export interface PreflightContext {
  tenant: string;
  environment: string;
  timestamp?: string;
  [key: string]: unknown;
}

export type CheckRunner<TContext extends PreflightContext = PreflightContext> = ((
  context: Readonly<TContext>
) => CheckResult | Promise<CheckResult>) & {
  check?: string;
  id?: string;
};

export interface CheckDefinition<TContext extends PreflightContext = PreflightContext> {
  check: string;
  run: CheckRunner<TContext>;
}

export type CheckInput<TContext extends PreflightContext = PreflightContext> =
  CheckRunner<TContext> | CheckDefinition<TContext>;

export interface PreflightCounts {
  pass: number;
  warn: number;
  fail: number;
}

export interface PreflightReport {
  schemaVersion: 1;
  tenant: string;
  environment: string;
  timestamp: string;
  counts: PreflightCounts;
  results: CheckResult[];
  exitCode: 0 | 1;
}

export type PreflightMode = "fast" | "release" | "eas";
