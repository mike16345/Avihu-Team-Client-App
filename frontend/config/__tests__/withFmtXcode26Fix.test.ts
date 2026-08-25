import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const plugin = require("../../plugins/withFmtXcode26Fix.js") as {
  injectFmtXcode26Fix: (podfile: string) => string;
};

const podfile = `target 'ElevateCoach' do
  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
    )
  end
end
`;

describe("withFmtXcode26Fix", () => {
  it("adds the generated-pod workaround inside post_install exactly once", () => {
    const once = plugin.injectFmtXcode26Fix(podfile);
    const twice = plugin.injectFmtXcode26Fix(once);

    expect(twice).toBe(once);
    expect(once.match(/BEGIN fmt Xcode 26 workaround/g)).toHaveLength(1);
    expect(once.indexOf("post_install do |installer|")).toBeLessThan(
      once.indexOf("BEGIN fmt Xcode 26 workaround")
    );
    expect(once.indexOf("BEGIN fmt Xcode 26 workaround")).toBeLessThan(once.lastIndexOf("\n  end"));
  });

  it("fails prebuild clearly when the Expo Podfile template loses its post-install hook", () => {
    expect(() => plugin.injectFmtXcode26Fix("target 'ElevateCoach' do\nend\n")).toThrowError(
      "Unable to install the fmt Xcode 26 workaround"
    );
  });
});
