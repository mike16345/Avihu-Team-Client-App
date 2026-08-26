import {
  renderDetailLines,
  renderHeader,
  renderStatusLine,
  supportsDecoratedOutput,
} from "../cli-ui/render";
import type { AssetAuditReport } from "./audit";
import type { CheckResult } from "./types";

export const renderAssetGenerated = (
  tenantId: string,
  count: number,
  manifestPath: string,
  decorated = supportsDecoratedOutput()
) =>
  [
    renderHeader("Tenant assets", tenantId, decorated),
    renderStatusLine("pass", "Asset generation", decorated),
    renderDetailLines([`Manifest: ${manifestPath}`]),
    "│",
    `└  ${count} assets generated · ready`,
  ].join("\n");

export const renderAssetChecks = (
  tenantId: string,
  results: readonly CheckResult[],
  decorated = supportsDecoratedOutput()
) => {
  const failures = results.filter((result) => !result.ok);
  const passCount = results.length - failures.length;
  const lines = [renderHeader("Asset validation", tenantId, decorated)];
  if (passCount > 0) {
    lines.push(
      renderStatusLine("pass", `${passCount} asset check${passCount === 1 ? "" : "s"}`, decorated)
    );
  }
  for (const result of failures) {
    lines.push(renderStatusLine("fail", result.name, decorated));
    lines.push(renderDetailLines([result.message]));
  }
  lines.push(
    "│",
    `└  ${passCount} passed${failures.length > 0 ? ` · ${failures.length} failed` : " · ready"}`
  );
  return lines.join("\n");
};

export const renderAssetAudit = (
  report: AssetAuditReport,
  decorated = supportsDecoratedOutput()
) => {
  const lines = [renderHeader("Asset audit", report.tenantId, decorated)];
  for (const entry of report.entries) {
    const status = entry.classification === "used" ? "pass" : "warn";
    lines.push(renderStatusLine(status, entry.relativePath, decorated));
    if (status === "warn") lines.push(renderDetailLines([entry.reason]));
  }
  if (report.deleted.length > 0) {
    lines.push("│", renderDetailLines([`Removed: ${report.deleted.join(", ")}`]));
  }
  const summary = Object.entries(report.summary)
    .filter(([, count]) => count > 0)
    .map(([classification, count]) => `${count} ${classification.replaceAll("-", " ")}`);
  if (report.deleted.length > 0) summary.push(`${report.deleted.length} removed`);
  lines.push("│", `└  ${summary.join(" · ") || "No assets found"}`);
  return lines.join("\n");
};
