import type { PreflightReport } from "./types";

const ESC = "\u001b";
const BEL = "\u0007";
const ST = "\u009c";
const STRING_CONTROL_STARTS = new Set(["]", "P", "^", "_"]);

const findCsiEnd = (value: string, start: number) => {
  for (let index = start; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0x40 && code <= 0x7e) {
      return index + 1;
    }
  }

  return null;
};

const findStringControlEnd = (value: string, start: number) => {
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === BEL || value[index] === ST) {
      return index + 1;
    }

    if (value[index] === ESC && value[index + 1] === "\\") {
      return index + 2;
    }
  }

  return null;
};

const removeAnsi = (value: string) => {
  let output = "";

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === ESC) {
      const next = value[index + 1];

      if (next === "[") {
        const end = findCsiEnd(value, index + 2);

        if (end) {
          index = end - 1;
          continue;
        }
      }

      if (next && STRING_CONTROL_STARTS.has(next)) {
        const end = findStringControlEnd(value, index + 2);

        if (end) {
          index = end - 1;
          continue;
        }
      }

      if (next === "\\") {
        index += 1;
      }

      continue;
    }

    if (character === "\u009b") {
      const end = findCsiEnd(value, index + 1);

      if (end) {
        index = end - 1;
      }

      continue;
    }

    if (character === "\u009d") {
      const end = findStringControlEnd(value, index + 1);

      if (end) {
        index = end - 1;
      }

      continue;
    }

    if (character === ST) {
      continue;
    }

    output += character;
  }

  return output;
};

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
