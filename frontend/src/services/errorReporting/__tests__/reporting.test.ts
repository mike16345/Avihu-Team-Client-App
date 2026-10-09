import { beforeEach, describe, expect, it } from "vitest";
import { sanitizeDiagnostics, sanitizeSentryEvent, sanitizeSentryBreadcrumb } from "../sanitize";
import { reportError, setErrorReporter } from "../reportError";

describe("diagnostic sanitization", () => {
  it("retains Hebrew answers while removing nested credentials and signed queries", () => {
    const clean = sanitizeDiagnostics({
      answer: "כאב בברך",
      password: "PRIVATE",
      nested: {
        Authorization: "Bearer PRIVATE",
        refreshToken: "PRIVATE",
        url: "https://s3.example/photo?X-Amz-Signature=PRIVATE&format=jpg",
      },
    });
    expect(JSON.stringify(clean)).toContain("כאב בברך");
    expect(JSON.stringify(clean)).not.toContain("PRIVATE");
    expect(JSON.stringify(clean)).toContain("format=jpg");
  });
  it("handles circular objects, error causes, and throwing getters", () => {
    const original = new Error("read failed");
    const error = new Error("upload failed");
    Object.assign(error, { cause: original });
    const value: Record<string, unknown> = { error };
    value.circular = value;
    Object.defineProperty(value, "bad", {
      enumerable: true,
      get() {
        throw new Error("getter");
      },
    });
    const serialized = JSON.stringify(sanitizeDiagnostics(value));
    expect(serialized).toContain("read failed");
    expect(serialized).toContain("Circular");
    expect(serialized).toContain("Unreadable");
  });
  it("bounds UTF-8 bytes, depth and collections and marks truncation", () => {
    const large = { answer: "א".repeat(100000), rows: Array.from({ length: 150 }, (_, i) => i) };
    const serialized = JSON.stringify(sanitizeDiagnostics(large));
    expect(Buffer.byteLength(serialized, "utf8")).toBeLessThanOrEqual(65536);
    expect(serialized).toContain("truncated");
    let deep: unknown = "secretly deep";
    for (let i = 0; i < 20; i++) deep = { child: deep };
    expect(JSON.stringify(sanitizeDiagnostics(deep))).not.toContain("secretly deep");
    expect(JSON.stringify(sanitizeDiagnostics(large.rows))).not.toContain("149");
  });
  it("sanitizes SDK events and breadcrumbs including exception strings", () => {
    const event = sanitizeSentryEvent({
      exception: {
        values: [
          {
            type: "Error",
            value:
              "request https://s3.example/a?X-Amz-Credential=PRIVATE failed Authorization: Bearer PRIVATE",
          },
        ],
      },
      request: { headers: { Authorization: "PRIVATE" } },
    });
    const breadcrumb = sanitizeSentryBreadcrumb({
      message: "request https://s3.example/a?X-Amz-Signature=PRIVATE",
      data: { cookie: "PRIVATE" },
    });
    expect(JSON.stringify(event)).not.toContain("PRIVATE");
    expect(JSON.stringify(breadcrumb)).not.toContain("PRIVATE");
  });
});

describe("reporting boundary", () => {
  beforeEach(() => setErrorReporter(null));
  it("preserves original errors and captures each instance once", () => {
    const captured: Error[] = [];
    setErrorReporter((error) => {
      captured.push(error);
      return "event";
    });
    const error = new Error("failure");
    expect(reportError(error, { operation: "chat.send" })).toBe("event");
    expect(reportError(error, { operation: "chat.screen" })).toBeUndefined();
    expect(captured).toEqual([error]);
    reportError(new Error("failure"), { operation: "chat.send" });
    expect(captured).toHaveLength(2);
  });
  it("normalizes non-error throws with diagnostic context", () => {
    const captured: { error: Error; context: unknown }[] = [];
    setErrorReporter((error, context) => {
      captured.push({ error, context });
      return "id";
    });
    reportError({ reason: "bad response", token: "PRIVATE" }, { operation: "api.read" });
    expect(captured[0].error).toBeInstanceOf(Error);
    expect(JSON.stringify(captured[0].context)).toContain("bad response");
    expect(JSON.stringify(captured[0].context)).not.toContain("PRIVATE");
  });
  it("never throws or blocks the original flow when reporting fails", () => {
    expect(reportError(new Error("x"), { operation: "storage.read" })).toBeUndefined();
    setErrorReporter(() => {
      throw new Error("reporter offline");
    });
    expect(reportError(new Error("x"), { operation: "storage.read" })).toBeUndefined();
  });
});

it("redacts serialized credentials, Basic authorization and cookie text", () => {
  const value =
    '{"password":"JSON_PASSWORD_FIXTURE","refresh_token":"JSON_TOKEN_FIXTURE"} Authorization: Basic dXNlcjpTRUNSRVQ= Cookie: session=COOKIE_FIXTURE; preference=dark';
  const clean = JSON.stringify(sanitizeSentryEvent({ exception: { values: [{ value }] } }));
  const breadcrumb = JSON.stringify(sanitizeSentryBreadcrumb({ message: value }));
  for (const serialized of [clean, breadcrumb]) {
    for (const marker of [
      "JSON_PASSWORD_FIXTURE",
      "JSON_TOKEN_FIXTURE",
      "dXNlcjpTRUNSRVQ=",
      "COOKIE_FIXTURE",
    ])
      expect(serialized).not.toContain(marker);
  }
});
it("preserves SDK envelope and typed arrays when diagnostics are large", () => {
  const frames = Array.from({ length: 150 }, (_, i) => ({ filename: "app.ts", lineno: i }));
  const event = {
    exception: { values: [{ type: "Error", value: "failed", stacktrace: { frames } }] },
    contexts: { diagnostics: { answers: Array.from({ length: 100 }, () => "א".repeat(12000)) } },
    tags: { tenant: "avihu", operation: "form.submit" },
    event_id: "test-id",
    release: "2.4.1",
    dist: "1",
    debug_meta: {
      images: [{ type: "sourcemap" as const, debug_id: "debug-id", code_file: "app.hbc" }],
    },
  };
  const clean = sanitizeSentryEvent(event);
  expect(clean.event_id).toBe("test-id");
  expect(clean.release).toBe("2.4.1");
  expect(clean.tags).toEqual(event.tags);
  expect(clean.debug_meta).toEqual(event.debug_meta);
  expect(clean.exception.values[0].stacktrace.frames).toEqual(frames);
  expect(Buffer.byteLength(JSON.stringify(clean.contexts.diagnostics))).toBeLessThanOrEqual(65536);
  expect(JSON.stringify(clean.contexts.diagnostics)).toContain("truncated");
});
