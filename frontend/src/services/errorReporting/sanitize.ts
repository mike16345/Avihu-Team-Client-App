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
      /([?&](?:X-Amz-(?:Signature|Credential|Security-Token)|access_token|refresh_token|token|api_key|signature)=)[^&\s"']*/gi,
      "$1[redacted]"
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+/gi, "Bearer [redacted]")
    .replace(
      /\b(password|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*[^\s,;"']+/gi,
      "$1=[redacted]"
    );
  for (const secret of knownSecrets) clean = clean.split(secret).join("[redacted]");
  return clean;
};

export const sanitizeDiagnostics = (value: unknown): unknown => {
  const ancestors = new WeakSet<object>();
  let remaining = 48000;
  const visit = (input: unknown, depth: number): unknown => {
    if (remaining <= 0 || depth > MAX_DEPTH) return TRUNCATED;
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
      for (const key of keys.slice(0, MAX_ENTRIES)) {
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
          Object.defineProperty(result, key, { value: next, enumerable: true, configurable: true });
      }
      if (keys.length > MAX_ENTRIES || remaining <= 0) {
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
    if (utf8Bytes(JSON.stringify(result)) <= MAX_BYTES) return result;
    return { _truncated: true, summary: "Diagnostic context exceeded 64 KiB" };
  } catch {
    return { _unreadable: true };
  }
};

export const sanitizeSentryEvent = <T>(event: T): T => sanitizeDiagnostics(event) as T;
export const sanitizeSentryBreadcrumb = <T>(breadcrumb: T): T =>
  sanitizeDiagnostics(breadcrumb) as T;
