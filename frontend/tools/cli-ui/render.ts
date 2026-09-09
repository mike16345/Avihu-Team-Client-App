export type CliStatus = "pass" | "warn" | "fail" | "info";

interface DecorationEnvironment {
  isTTY: boolean;
  noColor: boolean;
  ci: boolean;
}

const ANSI = {
  reset: "\u001B[0m",
  bold: "\u001B[1m",
  cyan: "\u001B[36m",
  green: "\u001B[32m",
  yellow: "\u001B[33m",
  red: "\u001B[31m",
} as const;

const STATUS_PRESENTATION: Record<CliStatus, { symbol: string; label: string; color: string }> = {
  pass: { symbol: "◇", label: "passed", color: ANSI.green },
  warn: { symbol: "▲", label: "warning", color: ANSI.yellow },
  fail: { symbol: "■", label: "failed", color: ANSI.red },
  info: { symbol: "◆", label: "ready", color: ANSI.cyan },
};

const decorate = (value: string, color: string, enabled: boolean) =>
  enabled ? `${color}${value}${ANSI.reset}` : value;

export const supportsDecoratedOutput = (
  environment: DecorationEnvironment = {
    isTTY: process.stdout.isTTY === true,
    noColor: process.env.NO_COLOR !== undefined,
    ci: process.env.CI !== undefined,
  }
) => environment.isTTY && !environment.noColor && !environment.ci;

export const renderHeader = (
  title: string,
  context?: string,
  decorated = supportsDecoratedOutput()
) => {
  const lines = [`┌  ${decorate(title, `${ANSI.bold}${ANSI.cyan}`, decorated)}`];
  if (context) {
    lines.push("│", `◆  ${decorate(context, ANSI.cyan, decorated)}`);
  }
  lines.push("│");
  return lines.join("\n");
};

export const renderStatusLine = (
  status: CliStatus,
  label: string,
  decorated = supportsDecoratedOutput()
) => {
  const presentation = STATUS_PRESENTATION[status];
  return `${decorate(presentation.symbol, presentation.color, decorated)}  ${label}  ${decorate(
    presentation.label,
    presentation.color,
    decorated
  )}`;
};

export const renderDetailLines = (
  details: readonly string[],
  options: { remediationIndex?: number } = {}
) =>
  details
    .flatMap((detail, index) => {
      const prefix = index === options.remediationIndex ? "→ " : "";
      const lines = detail.split("\n");
      return lines.map((line, lineIndex) => `│  ${lineIndex === 0 ? prefix : ""}${line}`);
    })
    .join("\n");

export const renderSummary = (
  counts: { pass: number; warn: number; fail: number },
  decorated = supportsDecoratedOutput()
) => {
  const parts = [`${counts.pass} passed`];
  if (counts.warn > 0) parts.push(`${counts.warn} ${counts.warn === 1 ? "warning" : "warnings"}`);
  if (counts.fail > 0) parts.push(`${counts.fail} failed`);
  if (counts.warn === 0 && counts.fail === 0) parts.push("ready");
  const color = counts.fail > 0 ? ANSI.red : counts.warn > 0 ? ANSI.yellow : ANSI.green;
  return `└  ${decorate(parts.join(" · "), color, decorated)}`;
};

export const renderError = (
  message: string,
  remediation?: string,
  decorated = supportsDecoratedOutput()
) => {
  const [summary, ...details] = message.split("\n");
  const lines = [`${decorate("■", ANSI.red, decorated)}  ${summary}`];
  if (details.length > 0) lines.push(renderDetailLines(details));
  if (remediation) lines.push("│", `└  → ${remediation}`);
  return lines.join("\n");
};
