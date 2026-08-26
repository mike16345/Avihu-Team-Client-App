import {
  renderDetailLines,
  renderHeader,
  renderStatusLine,
  renderSummary,
  supportsDecoratedOutput,
} from "../cli-ui/render";
import type { CheckResult, CheckStatus, PreflightReport } from "./types";

const STATUS_ORDER: CheckStatus[] = ["pass", "warn", "fail"];

const CHECK_LABELS: Readonly<Record<string, string>> = {
  "tenant.config": "Tenant configuration",
  "tenant.environment": "Tenant environment",
  "project.typescript": "TypeScript",
  "tests.unit": "Unit tests",
  "expo.install": "Expo dependencies",
  assets: "Tenant assets",
  "expo.config": "Expo configuration",
  "native.drift": "Native configuration",
};

const WORD_LABELS: Readonly<Record<string, string>> = {
  aab: "AAB",
  android: "Android",
  doctor: "Doctor",
  eas: "EAS",
  expo: "Expo",
  ios: "iOS",
  javascript: "JavaScript",
  r8: "R8",
  typescript: "TypeScript",
};

const formatCheckLabel = (check: string) => {
  const exactLabel = CHECK_LABELS[check];
  if (exactLabel) return exactLabel;
  return check
    .split(/[.-]/u)
    .map((word, index) => {
      const knownLabel = WORD_LABELS[word.toLowerCase()];
      if (knownLabel) return knownLabel;
      return index === 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word;
    })
    .join(" ");
};

const compactWarningDetails = (details: readonly string[]) => {
  if (details.length <= 4) return [...details];
  const log = details.find((detail) => detail.startsWith("Full sanitized log:"));
  const regularDetails = log ? details.filter((detail) => detail !== log) : [...details];
  const visibleDetails = regularDetails.slice(0, 2);
  const hiddenCount = regularDetails.length - visibleDetails.length;
  return [
    ...visibleDetails,
    `… ${hiddenCount} more ${hiddenCount === 1 ? "detail" : "details"}${
      log ? " in sanitized log" : ""
    }`,
    ...(log ? [log] : []),
  ];
};

const formatExpandedResult = (result: CheckResult, decorated: boolean) => {
  const lines = [renderStatusLine(result.status, formatCheckLabel(result.check), decorated)];
  const resultDetails =
    result.status === "warn"
      ? compactWarningDetails(result.details ?? [])
      : [...(result.details ?? [])];
  const details = [result.summary, ...resultDetails];
  if (result.policy) details.push(`Policy: ${result.policy.reason}`);
  if (details.length > 0) lines.push(renderDetailLines(details));
  if (result.remediation) {
    lines.push(renderDetailLines([result.remediation], { remediationIndex: 0 }));
  }
  return lines.join("\n");
};

export const renderHuman = (report: PreflightReport, decorated = supportsDecoratedOutput()) => {
  const lines = [
    renderHeader("Tenant preflight", `${report.tenant} · ${report.environment}`, decorated),
  ];

  for (const status of STATUS_ORDER) {
    const results = report.results.filter((result) => result.status === status);
    if (results.length === 0) continue;
    if (status !== "pass") lines.push("│");
    lines.push(
      ...results.map((result) =>
        status === "pass"
          ? renderStatusLine("pass", formatCheckLabel(result.check), decorated)
          : formatExpandedResult(result, decorated)
      )
    );
  }

  lines.push("│", renderSummary(report.counts, decorated));
  return lines.join("\n");
};
