import { describe, expect, it } from "vitest";
import { isTenantLayoutDirectionSatisfied } from "../rtlPolicy";

describe("isTenantLayoutDirectionSatisfied", () => {
  it("requires native RTL when the tenant forces RTL", () => {
    const localization = { supportsRtl: true, forcesRtl: true };

    expect(isTenantLayoutDirectionSatisfied(localization, false)).toBe(false);
    expect(isTenantLayoutDirectionSatisfied(localization, true)).toBe(true);
  });

  it("requires native LTR when the tenant does not support RTL", () => {
    const localization = { supportsRtl: false, forcesRtl: false };

    expect(isTenantLayoutDirectionSatisfied(localization, true)).toBe(false);
    expect(isTenantLayoutDirectionSatisfied(localization, false)).toBe(true);
  });

  it("accepts the device-selected direction when RTL is supported but not forced", () => {
    const localization = { supportsRtl: true, forcesRtl: false };

    expect(isTenantLayoutDirectionSatisfied(localization, true)).toBe(true);
    expect(isTenantLayoutDirectionSatisfied(localization, false)).toBe(true);
  });
});
