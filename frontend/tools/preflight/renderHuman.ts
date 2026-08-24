import type { CheckResult, CheckStatus, PreflightReport } from "./types";

const STATUS_ORDER: CheckStatus[] = ["pass", "warn", "fail"];

const formatResult = (result: CheckResult) => {
  const lines = [`- [${result.check}] ${result.summary}`];

  if (result.details) {
    lines.push(...result.details.map((detail) => `  ${detail}`));
  }

  if (result.policy) {
    lines.push(`  Policy: ${result.policy.reason}`);
  }

  if (result.status !== "pass" && result.remediation) {
    lines.push(`  Remediation: ${result.remediation}`);
  }

  return lines.join("\n");
};

export const renderHuman = (report: PreflightReport) => {
  const sections = STATUS_ORDER.map((status) => {
    const results = report.results.filter((result) => result.status === status);
    const heading = `${status.toUpperCase()} (${results.length})`;

    if (results.length === 0) {
      return heading;
    }

    return `${heading}\n${results.map(formatResult).join("\n")}`;
  });

  return [
    `Preflight: ${report.tenant} / ${report.environment}`,
    `Timestamp: ${report.timestamp}`,
    ...sections,
    `Exit code: ${report.exitCode}`,
  ].join("\n");
};
