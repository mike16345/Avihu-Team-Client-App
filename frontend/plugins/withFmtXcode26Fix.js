const { withPodfile } = require("@expo/config-plugins");

const MARKER = "BEGIN fmt Xcode 26 workaround";

const renderWorkaround = (indent) => `${indent}  # ${MARKER}
${indent}  fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
${indent}  if File.exist?(fmt_base)
${indent}    fmt_source = File.read(fmt_base)
${indent}    fmt_patched = fmt_source.gsub(/^#\\s*define FMT_USE_CONSTEVAL 1$/, '#  define FMT_USE_CONSTEVAL 0')
${indent}    if fmt_patched != fmt_source
${indent}      File.chmod(0644, fmt_base)
${indent}      File.write(fmt_base, fmt_patched)
${indent}    end
${indent}  end
${indent}  # END fmt Xcode 26 workaround`;

const injectFmtXcode26Fix = (podfile) => {
  if (podfile.includes(MARKER)) {
    return podfile;
  }

  const postInstall = /^(\s*)post_install do \|installer\|\s*$/m;
  if (!postInstall.test(podfile)) {
    throw new Error(
      "Unable to install the fmt Xcode 26 workaround: Expo's Podfile has no post_install hook."
    );
  }

  return podfile.replace(postInstall, (match, indent) => `${match}\n${renderWorkaround(indent)}`);
};

const withFmtXcode26Fix = (config) =>
  withPodfile(config, (cfg) => {
    cfg.modResults.contents = injectFmtXcode26Fix(cfg.modResults.contents);
    return cfg;
  });

withFmtXcode26Fix.injectFmtXcode26Fix = injectFmtXcode26Fix;

module.exports = withFmtXcode26Fix;
