const { withMainActivity } = require("@expo/config-plugins");

const DELEGATE_IMPORT =
  "import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate";

const ON_CREATE_BLOCK = `  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    HealthConnectPermissionDelegate.setPermissionDelegate(this)
  }
`;

const addImport = (contents) => {
  if (contents.includes(DELEGATE_IMPORT)) return contents;

  const imports = [
    contents.includes("import android.os.Bundle") ? null : "import android.os.Bundle",
    DELEGATE_IMPORT,
  ]
    .filter(Boolean)
    .join("\n");

  return contents.replace(/(package\s+[\w.]+\s*\n)/, `$1\n${imports}\n`);
};

const addDelegateToExistingOnCreate = (contents) => {
  if (contents.includes("HealthConnectPermissionDelegate.setPermissionDelegate(this)")) {
    return contents;
  }

  return contents.replace(
    /(override fun onCreate\(savedInstanceState: Bundle\?\)\s*\{[\s\S]*?super\.onCreate\([^\n]+\)\s*\n)/,
    `$1    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n`
  );
};

const addOnCreate = (contents) => {
  if (contents.includes("override fun onCreate(savedInstanceState: Bundle?)")) {
    return addDelegateToExistingOnCreate(contents);
  }

  const delegateMarker = "  override fun createReactActivityDelegate()";
  if (contents.includes(delegateMarker)) {
    return contents.replace(delegateMarker, `${ON_CREATE_BLOCK}\n${delegateMarker}`);
  }

  return contents.replace(/\n}\s*$/, `\n${ON_CREATE_BLOCK}}\n`);
};

const withHealthConnectPermissionDelegate = (config) =>
  withMainActivity(config, (cfg) => {
    let contents = cfg.modResults.contents;
    contents = addImport(contents);
    contents = addOnCreate(contents);
    cfg.modResults.contents = contents;
    return cfg;
  });

module.exports = withHealthConnectPermissionDelegate;
