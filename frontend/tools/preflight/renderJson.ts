import type { PreflightReport } from "./types";

const ANSI_ESCAPE_PATTERN =
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

const removeAnsi = (value: string) => value.replace(ANSI_ESCAPE_PATTERN, "");

const sanitizeForJson = (value: unknown): unknown => {
  if (typeof value === "string") {
    return removeAnsi(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForJson);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [removeAnsi(key), sanitizeForJson(child)])
    );
  }

  return value;
};

export const renderJson = (report: PreflightReport) =>
  `${JSON.stringify(sanitizeForJson(report), null, 2)}\n`;
