import type { Breadcrumb, Event } from "@sentry/react-native";

const MAX_BYTES = 65536;
const MAX_DEPTH = 8;
const MAX_ENTRIES = 100;
const TRUNCATED = "[truncated]";
const secretKey =
  /^(password|passwd|authorization|proxyauthorization|cookie|setcookie|apikey|xapikey|apitoken|token|accesstoken|refreshtoken|idtoken|secret|clientsecret|sentryauthtoken)$/i;
let knownSecrets: string[] = [];

export const setReportingSecrets = (values: readonly (string | null | undefined)[]): void => {
  knownSecrets = values.filter(
    (value): value is string => typeof value === "string" && value.length >= 6
  );
};

const utf8Bytes = (text: string): number => {
  let bytes = 0;
  for (const character of text) {
    const code = character.codePointAt(0)!;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
};

export const sanitizeText = (text: string): string => {
  let clean = text
    .replace(
      /(["'](?:password|passwd|authorization|proxy-authorization|cookie|set-cookie|api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret)["']\s*:\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/gi,
      '$1"[redacted]"'
    )
    .replace(
      /\b((?:Proxy-)?Authorization)\s*[:=]\s*(?:Basic|Bearer)\s+[A-Za-z0-9=._~+\/-]+/gi,
      "$1: [redacted]"
    )
    .replace(/\b(?:Set-Cookie|Cookie)\s*[:=][^\r\n]*/gi, "Cookie: [redacted]")
    .replace(
      /([?&](?:X-Amz-(?:Signature|Credential|Security-Token)|access_token|refresh_token|token|api_key|signature)=)[^&\s"']*/gi,
      "$1[redacted]"
    )
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9=._~+\/-]+/gi, "$1 [redacted]")
    .replace(
      /\b(password|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*[^\s,;"']+/gi,
      "$1=[redacted]"
    );
  for (const secret of knownSecrets) clean = clean.split(secret).join("[redacted]");
  return clean;
};

const sanitizeValue = (value: unknown, bounded: boolean): unknown => {
  const ancestors = new WeakSet<object>();
  let remaining = bounded ? 48000 : Infinity;
  const visit = (input: unknown, depth: number): unknown => {
    if (remaining <= 0 || depth > (bounded ? MAX_DEPTH : 32)) return TRUNCATED;
    if (input === undefined) return undefined;
    if (input === null || typeof input === "boolean" || typeof input === "number") {
      remaining -= 8;
      return input;
    }
    if (typeof input === "string") {
      const clean = sanitizeText(input);
      const limit = Math.min(12000, remaining);
      let result = "";
      let bytes = 0;
      for (const character of clean) {
        const cost = utf8Bytes(JSON.stringify(character).slice(1, -1));
        if (bytes + cost > limit) break;
        result += character;
        bytes += cost;
      }
      remaining -= bytes + 2;
      return result.length < clean.length ? result + TRUNCATED : result;
    }
    if (typeof input !== "object") return String(input);
    if (ancestors.has(input)) return "[Circular]";
    ancestors.add(input);
    try {
      if (input instanceof Date) return input.toISOString();
      const result: Record<string, unknown> = {};
      let keys = Object.keys(input);
      if (input instanceof Error)
        keys = [...new Set(["name", "message", "stack", "cause", ...keys])];
      const array: unknown[] = [];
      for (const key of keys.slice(0, bounded ? MAX_ENTRIES : keys.length)) {
        if (remaining <= 0) break;
        remaining -= utf8Bytes(key) + 4;
        let next: unknown;
        if (secretKey.test(key.replace(/[-_\s]/g, ""))) next = "[redacted]";
        else {
          try {
            next = visit(Reflect.get(input, key), depth + 1);
          } catch {
            next = "[Unreadable]";
          }
        }
        if (Array.isArray(input)) array.push(next);
        else
          Object.defineProperty(result, key, {
            value: next,
            writable: true,
            enumerable: true,
            configurable: true,
          });
      }
      if ((bounded && keys.length > MAX_ENTRIES) || remaining <= 0) {
        if (Array.isArray(input)) array.push(TRUNCATED);
        else result._truncated = true;
      }
      return Array.isArray(input) ? array : result;
    } catch {
      return "[Unreadable]";
    } finally {
      ancestors.delete(input);
    }
  };
  try {
    const result = visit(value, 0);
    if (!bounded || utf8Bytes(JSON.stringify(result)) <= MAX_BYTES) return result;
    return { _truncated: true, summary: "Diagnostic context exceeded 64 KiB" };
  } catch {
    return { _unreadable: true };
  }
};

export const sanitizeDiagnostics = (value: unknown): unknown => sanitizeValue(value, true);

// SDK envelopes and schema-constrained arrays must retain their structure for ingestion
// and symbolication. Only diagnostic bags share the size/collection budget.
export const sanitizeSentryEvent = <T extends Event>(event: T): T => {
  const clean = sanitizeValue(event, false) as T;
  if (event.extra) clean.extra = sanitizeDiagnostics(event.extra) as Event["extra"];
  if (event.contexts?.diagnostics && clean.contexts) {
    clean.contexts.diagnostics = sanitizeDiagnostics(event.contexts.diagnostics) as NonNullable<
      Event["contexts"]
    >[string];
  }
  return clean;
};
export const sanitizeSentryBreadcrumb = <T extends Breadcrumb>(breadcrumb: T): T => {
  const clean = sanitizeValue(breadcrumb, false) as T;
  if (breadcrumb.data) clean.data = sanitizeDiagnostics(breadcrumb.data) as Breadcrumb["data"];
  return clean;
};
