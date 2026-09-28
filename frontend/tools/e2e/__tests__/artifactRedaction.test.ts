import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { redactArtifactSecrets } from "../artifactRedaction";

const temporaryDirectories: string[] = [];

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) =>
    rmSync(directory, { recursive: true, force: true })
  );
});

describe("redactArtifactSecrets", () => {
  it("scrubs exact credential values from nested Maestro text artifacts", () => {
    const root = mkdtempSync(join(tmpdir(), "mobile-e2e-redaction-"));
    temporaryDirectories.push(root);
    const nested = join(root, "debug", ".maestro", "tests", "run");
    mkdirSync(nested, { recursive: true });
    const logPath = join(nested, "maestro.log");
    const reportPath = join(root, "report.html");
    const email = ["private", "example.invalid"].join("@");
    const password = ["private", "password"].join("-");
    writeFileSync(logPath, `email=${email} password=${password}`);
    writeFileSync(reportPath, `<p>${email}</p>`);

    redactArtifactSecrets(root, [email, password]);

    expect(readFileSync(logPath, "utf8")).toBe("email=[REDACTED] password=[REDACTED]");
    expect(readFileSync(reportPath, "utf8")).toBe("<p>[REDACTED]</p>");
  });
});
