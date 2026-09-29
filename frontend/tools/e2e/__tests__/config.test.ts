import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { E2E_APP_ID, E2E_ARTIFACT_DIR, E2E_FLOW_DIR, resolveE2EConfig } from "../config";

const baseEnvironment = {
  APP_ENV: "preview",
  E2E_API_URL: "https://example.execute-api.amazonaws.com/test/",
  MAESTRO_APP_ID: "com.avihuteam.avihuteam",
};

describe("resolveE2EConfig", () => {
  it("accepts the Avihu preview app and test API stage", () => {
    const config = resolveE2EConfig(baseEnvironment);

    expect(config).toEqual({
      appId: E2E_APP_ID,
      apiUrl: new URL(baseEnvironment.E2E_API_URL),
      artifactDir: E2E_ARTIFACT_DIR,
      flowDir: E2E_FLOW_DIR,
    });
  });

  it("rejects production APP_ENV", () => {
    expect(() => resolveE2EConfig({ ...baseEnvironment, APP_ENV: "production" })).toThrow(
      "APP_ENV must be preview"
    );
  });

  it("rejects an API URL outside the test stage", () => {
    expect(() =>
      resolveE2EConfig({
        ...baseEnvironment,
        E2E_API_URL: "https://example.execute-api.amazonaws.com/prod/",
      })
    ).toThrow("E2E_API_URL must target the /test API stage");
  });

  it("rejects an unexpected app identifier", () => {
    expect(() =>
      resolveE2EConfig({ ...baseEnvironment, MAESTRO_APP_ID: "com.example.production" })
    ).toThrow(`MAESTRO_APP_ID must be ${E2E_APP_ID}`);
  });

  it("does not require credentials for anonymous flows", () => {
    expect(resolveE2EConfig(baseEnvironment)).not.toHaveProperty("email");
    expect(resolveE2EConfig(baseEnvironment)).not.toHaveProperty("password");
  });

  it("requires nonblank credentials for authenticated flows", () => {
    const secretEmail = "private-e2e@example.com";
    const secretPassword = "do-not-print-this";

    const missingPassword = () =>
      resolveE2EConfig(
        {
          ...baseEnvironment,
          MAESTRO_E2E_EMAIL: secretEmail,
          MAESTRO_E2E_PASSWORD: " ",
        },
        { requireCredentials: true }
      );

    expect(missingPassword).toThrow("MAESTRO_E2E_PASSWORD is required");

    try {
      missingPassword();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(secretEmail);
      expect(message).not.toContain(secretPassword);
    }

    expect(
      resolveE2EConfig(
        {
          ...baseEnvironment,
          MAESTRO_E2E_EMAIL: secretEmail,
          MAESTRO_E2E_PASSWORD: secretPassword,
        },
        { requireCredentials: true }
      )
    ).toMatchObject({ email: secretEmail, password: secretPassword });
  });
});

describe("E2E build command", () => {
  it("provides tenant identity before EAS evaluates app.config", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["build:android:e2e"]).toMatch(/^APP_TENANT=avihu APP_ENV=preview /);
  });
});

describe("local E2E commands", () => {
  it("loads the client-owned local E2E environment file", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["e2e:preflight"]).toBe(
      "dotenv -e .env.e2e.local -- tsx tools/e2e/cli.ts --preflight-only"
    );
    expect(packageJson.scripts["e2e:android"]).toBe(
      "dotenv -e .env.e2e.local -- tsx tools/e2e/cli.ts"
    );
  });
});
