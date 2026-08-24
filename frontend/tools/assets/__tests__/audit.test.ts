import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditAssets } from "../audit";

const TENANT_ID = "avihu";

const writeFixtureFile = async (root: string, relativePath: string, contents = "asset") => {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, "utf8");
  return filePath;
};

const createCompleteManifest = () =>
  JSON.stringify({
    tenantId: TENANT_ID,
    source: { relativePath: "source/app-icon.png" },
    outputs: {
      appleIcon: { relativePath: "generated/apple-icon.png" },
      androidLegacyIcon: { relativePath: "generated/android-legacy-icon.png" },
      androidAdaptiveForeground: { relativePath: "generated/android-adaptive-foreground.png" },
      androidAdaptiveBackground: { relativePath: "generated/android-adaptive-background.png" },
      notificationIcon: { relativePath: "generated/notification-icon.png" },
      splash: { relativePath: "generated/splash.png" },
      runtimeLogo: { relativePath: "generated/runtime-logo.png" },
      applePreview: { relativePath: "generated/previews/apple.png" },
      androidCirclePreview: { relativePath: "generated/previews/android-circle.png" },
      androidSquirclePreview: { relativePath: "generated/previews/android-squircle.png" },
      notificationPreview: { relativePath: "generated/previews/notification.png" },
    },
  });

const generatedOutputPaths = [
  "config/tenants/assets/avihu/generated/apple-icon.png",
  "config/tenants/assets/avihu/generated/android-legacy-icon.png",
  "config/tenants/assets/avihu/generated/android-adaptive-foreground.png",
  "config/tenants/assets/avihu/generated/android-adaptive-background.png",
  "config/tenants/assets/avihu/generated/notification-icon.png",
  "config/tenants/assets/avihu/generated/splash.png",
  "config/tenants/assets/avihu/generated/runtime-logo.png",
  "config/tenants/assets/avihu/generated/previews/apple.png",
  "config/tenants/assets/avihu/generated/previews/android-circle.png",
  "config/tenants/assets/avihu/generated/previews/android-squircle.png",
  "config/tenants/assets/avihu/generated/previews/notification.png",
];

const cleanupCandidates = [
  "assets/proven-unused.png",
  "config/tenants/assets/avihu/generated/stale.png",
];

const nestedOpaqueLoaderCases = [
  {
    name: "a nested require call",
    source: "const image = require(getAssetPath());\n",
  },
  {
    name: "a nested path join require call",
    source: 'const image = require(path.join("../assets", name));\n',
  },
  {
    name: "a nested dynamic import call",
    source: "const image = import(resolveAsset(name));\n",
  },
  {
    name: "an unbalanced loader call",
    source: "const image = require(getAssetPath();\n",
  },
  {
    name: "a block-comment require call",
    source: "const image = require/* asset resolver */(getAssetPath());\n",
  },
  {
    name: "a block-comment dynamic import call",
    source: "const image = import/* asset resolver */(resolveAsset(name));\n",
  },
  {
    name: "a line-comment loader call",
    source: "const image = require // asset resolver\n(getAssetPath());\n",
  },
];

const templateInterpolationOpaqueLoaderCases = [
  {
    name: "a commented require call in an interpolation",
    source: "const value = `asset: ${require/* comment */(getAssetPath())}`;\n",
  },
  {
    name: "a require call in a nested template interpolation",
    source: "const value = `outer ${`middle ${`inner ${require(getAssetPath())}`}`}`;\n",
  },
  {
    name: "a require call after nested braces, strings, and comments",
    source:
      "const value = `outer ${(() => { const marker = '}'; /* } */ return require(getAssetPath()); })()}`;\n",
  },
  {
    name: "an opaque loader nested inside a stable-prefix loader",
    source: 'const value = `outer ${require("../assets/scoped/" + import(resolveAsset(name)))}`;\n',
  },
  {
    name: "a require call after a brace-bearing regular expression",
    source: 'const value = `outer ${/}/.test(name) ? require(getAssetPath()) : "safe"}`;\n',
  },
];

describe("auditAssets", () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(tmpdir(), "tenant-assets-audit-"));

    await Promise.all([
      writeFixtureFile(projectRoot, "assets/alias.png"),
      writeFixtureFile(projectRoot, "assets/relative.png"),
      writeFixtureFile(projectRoot, "assets/required.png"),
      writeFixtureFile(projectRoot, "assets/dynamic/a.png"),
      writeFixtureFile(projectRoot, "assets/dynamic/b.png"),
      writeFixtureFile(projectRoot, "assets/proven-unused.png"),
      writeFixtureFile(projectRoot, "dist/ignored-build-output.png"),
      writeFixtureFile(projectRoot, "src/alias.ts", 'import image from "@assets/alias.png";\n'),
      writeFixtureFile(
        projectRoot,
        "src/screens/relative.ts",
        'import image from "../../assets/relative.png";\n'
      ),
      writeFixtureFile(
        projectRoot,
        "src/required.ts",
        'const image = require("@assets/required.png");\n'
      ),
      writeFixtureFile(
        projectRoot,
        "src/dynamic.ts",
        "const image = `../assets/dynamic/${variant}.png`;\n"
      ),
      writeFixtureFile(
        projectRoot,
        "config/tenants/avihu.ts",
        'export const icon = "./config/tenants/assets/avihu/generated/configured.png";\n'
      ),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/source/app-icon.png"),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/generated/configured.png"),
      writeFixtureFile(projectRoot, "config/tenants/assets/avihu/generated/stale.png"),
      writeFixtureFile(
        projectRoot,
        "config/tenants/assets/avihu/generated/manifest.json",
        createCompleteManifest()
      ),
      ...generatedOutputPaths.map((relativePath) => writeFixtureFile(projectRoot, relativePath)),
    ]);
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("keeps statically referenced, tenant, and manifest assets while reporting dynamic paths", async () => {
    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID });
    const byPath = new Map(
      report.entries.map((entry) => [entry.relativePath, entry.classification])
    );

    expect(byPath.get("assets/alias.png")).toBe("used");
    expect(byPath.get("assets/relative.png")).toBe("used");
    expect(byPath.get("assets/required.png")).toBe("used");
    expect(byPath.get("assets/dynamic/a.png")).toBe("ambiguous");
    expect(byPath.get("assets/dynamic/b.png")).toBe("ambiguous");
    expect(byPath.get("assets/proven-unused.png")).toBe("proven-unused");
    expect(byPath.get("config/tenants/assets/avihu/source/app-icon.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/configured.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/apple-icon.png")).toBe("used");
    expect(byPath.get("config/tenants/assets/avihu/generated/stale.png")).toBe("stale-generated");
    expect(byPath.has("dist/ignored-build-output.png")).toBe(false);
  });

  it("removes only stale generated and proven-unused files after explicit confirmation", async () => {
    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
    await expect(readFile(path.join(projectRoot, "assets/dynamic/a.png"), "utf8")).resolves.toBe(
      "asset"
    );
    await expect(
      readFile(
        path.join(projectRoot, "config/tenants/assets/avihu/generated/apple-icon.png"),
        "utf8"
      )
    ).resolves.toBe("asset");
  });

  it("does not modify candidates in default report-only mode", async () => {
    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID });

    expect(report.deleted).toEqual([]);
    await expect(
      readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
    ).resolves.toBe("asset");
    await expect(
      readFile(path.join(projectRoot, "config/tenants/assets/avihu/generated/stale.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("does not modify candidates when interactive cleanup is declined", async () => {
    const report = await auditAssets({
      projectRoot,
      tenantId: TENANT_ID,
      clean: true,
      confirmCleanup: async () => false,
    });

    expect(report.deleted).toEqual([]);
    await expect(
      readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("retains static backtick asset literals during cleanup", async () => {
    await Promise.all([
      writeFixtureFile(projectRoot, "assets/backtick.png"),
      writeFixtureFile(projectRoot, "src/backtick.ts", "const image = `@assets/backtick.png`;\n"),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
    await expect(readFile(path.join(projectRoot, "assets/backtick.png"), "utf8")).resolves.toBe(
      "asset"
    );
  });

  it("retains concatenated loader candidates as ambiguous during cleanup", async () => {
    await Promise.all([
      writeFixtureFile(projectRoot, "assets/concatenated/a.png"),
      writeFixtureFile(projectRoot, "assets/concatenated/b.png"),
      writeFixtureFile(
        projectRoot,
        "src/concatenated.ts",
        'const image = require("../assets/concatenated/" + name + ".png");\n'
      ),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
    await expect(
      readFile(path.join(projectRoot, "assets/concatenated/a.png"), "utf8")
    ).resolves.toBe("asset");
    await expect(
      readFile(path.join(projectRoot, "assets/concatenated/b.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("blocks deletion when an opaque asset loader has no stable directory prefix", async () => {
    await Promise.all([
      writeFixtureFile(projectRoot, "assets/opaque.png"),
      writeFixtureFile(
        projectRoot,
        "src/opaque.ts",
        "const assetPath = getAssetPath();\nconst image = require(assetPath);\n"
      ),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
    await expect(readFile(path.join(projectRoot, "assets/opaque.png"), "utf8")).resolves.toBe(
      "asset"
    );
  });

  it.each(nestedOpaqueLoaderCases)("blocks deletion for $name", async ({ source }, caseIndex) => {
    const assetPath = `assets/nested-opaque-${caseIndex}.png`;
    await Promise.all([
      writeFixtureFile(projectRoot, assetPath),
      writeFixtureFile(projectRoot, `src/nested-opaque-${caseIndex}.ts`, source),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
    await expect(readFile(path.join(projectRoot, assetPath), "utf8")).resolves.toBe("asset");
  });

  it.each(templateInterpolationOpaqueLoaderCases)(
    "blocks deletion for $name",
    async ({ source }, caseIndex) => {
      await writeFixtureFile(
        projectRoot,
        `src/template-interpolation-opaque-${caseIndex}.ts`,
        source
      );

      const report = await auditAssets({
        projectRoot,
        tenantId: TENANT_ID,
        clean: true,
        yes: true,
      });

      expect(report.deleted).toEqual([]);
      await expect(
        readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
      ).resolves.toBe("asset");
    }
  );

  it("ignores loader-like text in template literal text, strings, and comments", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/template-literal-text.ts",
      'const value = `require(getAssetPath()) ${"import(resolveAsset(name))"} ${/* require(getAssetPath()) */ "safe"}`;\n'
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
  });

  it("ignores loader-like text in a regular expression inside an interpolation", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/template-regexp-text.ts",
      "const value = `matched: ${/require(getAssetPath())/.test(name)}`;\n"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
  });

  it("blocks deletion when a postfix non-null assertion precedes division around a loader", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/postfix-non-null-division.ts",
      "const value = `outer ${foo! / bar + require(getAssetPath()) / baz}`;"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
    await expect(
      readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("keeps a prefix logical-not regular expression inert", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/prefix-logical-not-regexp.ts",
      "const value = `outer ${! /require(getAssetPath())/.test(foo)}`;"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
  });

  it("blocks deletion when TypeScript type arguments make slash classification ambiguous", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/ambiguous-type-argument-division.ts",
      "const value = `outer ${foo<string> / bar + require(getAssetPath()) / baz}`;"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
    await expect(
      readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("does not treat JSX closing tags as malformed regular expressions", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/jsx-closing-tag.tsx",
      "export const Component = () => <View>דק' /</View>;\n"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
  });

  it("scans loader calls inside JSX expression containers", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/jsx-loader.tsx",
      "export const Component = () => <View>{require(getAssetPath())}</View>;\n"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
  });

  it("does not treat TSX generic arrow functions as JSX elements", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/generic-arrows.tsx",
      "const first = <T,>(value: T) => value;\nconst second = <T extends string>(value: T) => value;\n"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
  });

  it("blocks deletion for an unterminated template interpolation", async () => {
    await writeFixtureFile(
      projectRoot,
      "src/unterminated-template-interpolation.ts",
      "const value = `asset: ${getAssetPath()`;\n"
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual([]);
    await expect(
      readFile(path.join(projectRoot, "assets/proven-unused.png"), "utf8")
    ).resolves.toBe("asset");
  });

  it("retains native-module references and registered asset directories during cleanup", async () => {
    await Promise.all([
      writeFixtureFile(projectRoot, "assets/native-module.png"),
      writeFixtureFile(projectRoot, "assets/fonts/registered.ttf"),
      writeFixtureFile(
        projectRoot,
        "native-modules/asset-loader.ts",
        'import image from "../assets/native-module.png";\n'
      ),
      writeFixtureFile(
        projectRoot,
        "react-native.config.js",
        'module.exports = { assets: ["./assets/fonts"] };\n'
      ),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
    await expect(
      readFile(path.join(projectRoot, "assets/native-module.png"), "utf8")
    ).resolves.toBe("asset");
    await expect(
      readFile(path.join(projectRoot, "assets/fonts/registered.ttf"), "utf8")
    ).resolves.toBe("asset");
  });

  it("rejects a symlinked candidate that resolves outside approved asset roots", async () => {
    const outsideAsset = await writeFixtureFile(projectRoot, "outside.png");
    const linkPath = path.join(projectRoot, "assets/escaped.png");
    await symlink(outsideAsset, linkPath);

    await expect(auditAssets({ projectRoot, tenantId: TENANT_ID })).rejects.toThrow(
      "outside approved asset roots"
    );
  });

  it("retains Kotlin, Swift, plist, and XML native-module asset references during cleanup", async () => {
    await Promise.all([
      writeFixtureFile(projectRoot, "assets/native-kotlin.png"),
      writeFixtureFile(projectRoot, "assets/native-swift.png"),
      writeFixtureFile(projectRoot, "assets/native-plist.png"),
      writeFixtureFile(projectRoot, "assets/native-xml.png"),
      writeFixtureFile(
        projectRoot,
        "native-modules/android/Assets.kt",
        'val image = "../../assets/native-kotlin.png"\n'
      ),
      writeFixtureFile(
        projectRoot,
        "native-modules/ios/Assets.swift",
        'let image = "../../assets/native-swift.png"\n'
      ),
      writeFixtureFile(
        projectRoot,
        "native-modules/ios/Info.plist",
        "<string>../../assets/native-plist.png</string>\n"
      ),
      writeFixtureFile(
        projectRoot,
        "native-modules/android/assets.xml",
        "<string>../../assets/native-xml.png</string>\n"
      ),
    ]);

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID, clean: true, yes: true });

    expect(report.deleted).toEqual(cleanupCandidates);
    await expect(
      readFile(path.join(projectRoot, "assets/native-kotlin.png"), "utf8")
    ).resolves.toBe("asset");
    await expect(readFile(path.join(projectRoot, "assets/native-swift.png"), "utf8")).resolves.toBe(
      "asset"
    );
    await expect(readFile(path.join(projectRoot, "assets/native-plist.png"), "utf8")).resolves.toBe(
      "asset"
    );
    await expect(readFile(path.join(projectRoot, "assets/native-xml.png"), "utf8")).resolves.toBe(
      "asset"
    );
  });

  it("rejects an app asset root symlink that escapes the project", async () => {
    const outsideRoot = await mkdtemp(path.join(tmpdir(), "outside-assets-root-"));
    try {
      await writeFixtureFile(outsideRoot, "escaped.png");
      await rm(path.join(projectRoot, "assets"), { recursive: true, force: true });
      await symlink(outsideRoot, path.join(projectRoot, "assets"));

      await expect(auditAssets({ projectRoot, tenantId: TENANT_ID })).rejects.toThrow(
        "Approved asset root escapes the real project root"
      );
    } finally {
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("rejects a tenant asset root symlink that escapes the project", async () => {
    const outsideRoot = await mkdtemp(path.join(tmpdir(), "outside-tenant-assets-root-"));
    try {
      await rm(path.join(projectRoot, "config/tenants/assets/avihu"), {
        recursive: true,
        force: true,
      });
      await symlink(outsideRoot, path.join(projectRoot, "config/tenants/assets/avihu"));

      await expect(auditAssets({ projectRoot, tenantId: TENANT_ID })).rejects.toThrow(
        "Approved asset root escapes the real project root"
      );
    } finally {
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("rejects a tenant path that attempts to escape approved asset roots", async () => {
    await expect(auditAssets({ projectRoot, tenantId: "../../assets" })).rejects.toThrow(
      'Unknown tenant "../../assets"'
    );
  });

  it("keeps generated files ambiguous when their manifest is partial but nonempty", async () => {
    await writeFixtureFile(
      projectRoot,
      "config/tenants/assets/avihu/generated/manifest.json",
      JSON.stringify({
        source: { relativePath: "source/app-icon.png" },
        outputs: { appleIcon: { relativePath: "generated/apple-icon.png" } },
      })
    );

    const report = await auditAssets({ projectRoot, tenantId: TENANT_ID });

    expect(
      report.entries.find(
        (entry) => entry.relativePath === "config/tenants/assets/avihu/generated/stale.png"
      )?.classification
    ).toBe("ambiguous");
  });
});
