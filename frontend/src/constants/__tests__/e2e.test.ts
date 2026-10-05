import { describe, expect, it } from "vitest";

import { E2E_TEST_IDS } from "../e2e";

const REQUIRED_TEST_IDS = [
  "loginRoot",
  "loginEmail",
  "loginEmailError",
  "loginPassword",
  "loginPasswordError",
  "loginSubmit",
  "forgotPasswordOpen",
  "forgotPasswordRoot",
  "forgotPasswordEmail",
  "forgotPasswordEmailError",
  "forgotPasswordSubmit",
  "forgotPasswordBack",
  "otpInput",
  "otpError",
  "otpSubmit",
  "toastError",
  "environmentBadge",
  "homeRoot",
  "homeWeightWindow",
  "notificationOpen",
  "notificationModal",
  "tabHome",
  "tabWorkout",
  "workoutRoot",
  "tabDiet",
  "dietRoot",
  "tabChat",
  "chatRoot",
  "chatInput",
  "chatSend",
  "tabArticles",
  "articlesRoot",
  "articlesHeading",
  "profileOpen",
  "profileRoot",
  "profileDetails",
  "profileBack",
  "logout",
] as const;

describe("E2E_TEST_IDS", () => {
  it("exposes every selector required by the mobile smoke suite", () => {
    expect(Object.keys(E2E_TEST_IDS).sort()).toEqual([...REQUIRED_TEST_IDS].sort());
  });

  it("uses unique, stable kebab-case values", () => {
    const values = Object.values(E2E_TEST_IDS);

    expect(new Set(values).size).toBe(values.length);
    values.forEach((value) => expect(value).toMatch(/^e2e-[a-z]+(?:-[a-z]+)*$/));
  });
});
