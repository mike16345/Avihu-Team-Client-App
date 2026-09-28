import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const TEXT_ARTIFACT_EXTENSIONS = new Set([
  ".html",
  ".json",
  ".log",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

export const redactArtifactSecrets = (root: string, secrets: readonly string[]) => {
  if (!existsSync(root)) return;
  const nonblankSecrets = secrets.filter((secret) => secret.length > 0);

  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
        continue;
      }
      if (!TEXT_ARTIFACT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;

      const original = readFileSync(entryPath, "utf8");
      const redacted = nonblankSecrets.reduce(
        (contents, secret) => contents.split(secret).join("[REDACTED]"),
        original
      );
      if (redacted !== original) writeFileSync(entryPath, redacted, "utf8");
    }
  };

  visit(root);
};
