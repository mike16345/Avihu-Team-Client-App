/* eslint-disable @typescript-eslint/no-var-requires */
const {
  withInfoPlist,
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PLUGIN_DIR = __dirname;
const NATIVE_ROOT = path.join(PLUGIN_DIR, "..");
const IOS_SRC = path.join(NATIVE_ROOT, "ios");
const ANDROID_SRC = path.join(NATIVE_ROOT, "android");

const LIVE_STEPS_PACKAGE_SUFFIX = "livesteps";

function getAndroidAppPackage(config) {
  return config.android?.package || "com.avihuteam.avihuteam";
}

function getLiveStepsPackage(config) {
  return `${getAndroidAppPackage(config)}.${LIVE_STEPS_PACKAGE_SUFFIX}`;
}

function getAndroidJavaSubpath(config) {
  return `app/src/main/java/${getLiveStepsPackage(config).replace(/\./g, "/")}`;
}

function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    throw new Error(`Live steps native template is missing: ${from}`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function patchAndroidSource(filePath, appPackage, liveStepsPackage) {
  let body = fs.readFileSync(filePath, "utf8");
  body = body.replace(/^package\s+[\w.]+/m, `package ${liveStepsPackage}`);
  body = body.replace(/import\s+[\w.]+\.R/m, `import ${appPackage}.R`);
  fs.writeFileSync(filePath, body);
}

// ─── iOS: Info.plist — flip Live Activities on ───────────────────────────
const withLiveActivityInfoPlist = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.NSSupportsLiveActivities = true;
    return cfg;
  });

// ─── iOS: bump Podfile deployment target to 16.1 ─────────────────────────
const withIOSDeploymentTarget = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      if (!fs.existsSync(podfile)) return cfg;
      let body = fs.readFileSync(podfile, "utf8");
      const match = body.match(/platform :ios, '(\d+(?:\.\d+)?)'/);
      if (match) {
        const current = parseFloat(match[1]);
        if (current < 16.1) {
          body = body.replace(match[0], "platform :ios, '16.1'");
          fs.writeFileSync(podfile, body);
        }
      }
      return cfg;
    },
  ]);

// ─── iOS: drop the bridge files into the main app target folder ──────────
const withIOSBridgeFiles = (config) =>
  withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const candidates = fs
        .readdirSync(root)
        .filter((d) => {
          const full = path.join(root, d);
          return (
            fs.statSync(full).isDirectory() &&
            !d.startsWith(".") &&
            d !== "Pods" &&
            d !== "build"
          );
        });
      // Main app folder = first one that contains an Info.plist or AppDelegate
      const appDir = candidates.find((d) => {
        const inside = fs.readdirSync(path.join(root, d));
        return inside.some((f) => /AppDelegate|Info\.plist/.test(f));
      }) || candidates[0];
      if (!appDir) return cfg;

      const target = path.join(root, appDir);
      copyFile(path.join(IOS_SRC, "RNLiveSteps.swift"), path.join(target, "RNLiveSteps.swift"));
      copyFile(path.join(IOS_SRC, "RNLiveSteps.m"), path.join(target, "RNLiveSteps.m"));
      copyFile(
        path.join(IOS_SRC, "StepsActivityAttributes.swift"),
        path.join(target, "StepsActivityAttributes.swift")
      );
      return cfg;
    },
  ]);

// ─── Android: copy Kotlin sources + res ──────────────────────────────────
const withAndroidSources = (config) =>
  withDangerousMod(config, [
    "android",
    async (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const appPackage = getAndroidAppPackage(cfg);
      const liveStepsPackage = getLiveStepsPackage(cfg);
      const javaDir = path.join(root, getAndroidJavaSubpath(cfg));

      copyFile(path.join(ANDROID_SRC, "LiveStepsService.kt"), path.join(javaDir, "LiveStepsService.kt"));
      copyFile(path.join(ANDROID_SRC, "LiveStepsModule.kt"), path.join(javaDir, "LiveStepsModule.kt"));
      copyFile(path.join(ANDROID_SRC, "LiveStepsPackage.kt"), path.join(javaDir, "LiveStepsPackage.kt"));
      patchAndroidSource(path.join(javaDir, "LiveStepsService.kt"), appPackage, liveStepsPackage);
      patchAndroidSource(path.join(javaDir, "LiveStepsModule.kt"), appPackage, liveStepsPackage);
      patchAndroidSource(path.join(javaDir, "LiveStepsPackage.kt"), appPackage, liveStepsPackage);

      copyDir(path.join(ANDROID_SRC, "res"), path.join(root, "app/src/main/res"));
      return cfg;
    },
  ]);

// ─── Android: register LiveStepsPackage in MainApplication ───────────────
const withAndroidPackageRegistration = (config) =>
  withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    const importLine = `import ${getLiveStepsPackage(cfg)}.LiveStepsPackage`;

    if (!src.includes(importLine)) {
      // Insert after the package declaration
      src = src.replace(
        /(package\s+[\w.]+\s*\n)/,
        `$1\n${importLine}\n`
      );
    }

    if (!src.includes("LiveStepsPackage()")) {
      // Most modern Expo templates use: PackageList(this).packages.apply { ... }
      // Try the .apply { } pattern first
      const applyPattern = /(PackageList\(this\)\.packages\.apply\s*\{)/;
      if (applyPattern.test(src)) {
        src = src.replace(applyPattern, "$1\n            add(LiveStepsPackage())");
      } else {
        // Fallback: Java-style return list
        src = src.replace(
          /(packages\.add\([^)]+\);[^}]*)/,
          `$1\n    packages.add(new LiveStepsPackage());`
        );
      }
    }

    cfg.modResults.contents = src;
    return cfg;
  });

// ─── Android: permissions + service in Manifest ──────────────────────────
const withAndroidManifestEntries = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const serviceFqn = `${getLiveStepsPackage(cfg)}.LiveStepsService`;

    if (!manifest["uses-permission"]) manifest["uses-permission"] = [];
    const wanted = [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
    ];
    for (const name of wanted) {
      const exists = manifest["uses-permission"].some(
        (p) => p.$ && p.$["android:name"] === name
      );
      if (!exists) {
        manifest["uses-permission"].push({ $: { "android:name": name } });
      }
    }

    const app = manifest.application && manifest.application[0];
    if (app) {
      if (!app.service) app.service = [];
      const existingService = app.service.find(
        (service) => service.$ && service.$["android:name"] === serviceFqn
      );
      if (existingService) {
        existingService.$["android:exported"] = "false";
        existingService.$["android:foregroundServiceType"] = "dataSync";
      } else {
        app.service.push({
          $: {
            "android:name": serviceFqn,
            "android:exported": "false",
            "android:foregroundServiceType": "dataSync",
          },
        });
      }
    }

    return cfg;
  });

// ─── Compose all mods ────────────────────────────────────────────────────
const withLiveStepsActivity = (config) => {
  config = withLiveActivityInfoPlist(config);
  config = withIOSDeploymentTarget(config);
  config = withIOSBridgeFiles(config);
  config = withAndroidSources(config);
  config = withAndroidPackageRegistration(config);
  config = withAndroidManifestEntries(config);
  return config;
};

module.exports = withLiveStepsActivity;
