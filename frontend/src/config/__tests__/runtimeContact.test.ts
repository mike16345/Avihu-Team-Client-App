import { describe, expect, it, vi } from "vitest";
import { getTrainerPhoneNumber } from "../runtimeContact";

const { runtimeExtra } = vi.hoisted(() => ({
  runtimeExtra: { TRAINER_PHONE_NUMBER: undefined as string | undefined },
}));

vi.mock("expo-constants", () => ({ default: { expoConfig: { extra: runtimeExtra } } }));

describe("getTrainerPhoneNumber", () => {
  it("prefers the EAS runtime phone number over a local development value", () => {
    runtimeExtra.TRAINER_PHONE_NUMBER = "+15555550101";
    vi.stubEnv("EXPO_PUBLIC_TRAINER_PHONE_NUMBER", "+15555550100");

    expect(getTrainerPhoneNumber()).toBe("+15555550101");

    vi.unstubAllEnvs();
    runtimeExtra.TRAINER_PHONE_NUMBER = undefined;
  });
});
