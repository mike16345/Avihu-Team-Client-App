export const E2E_APP_ID = "com.avihuteam.avihuteam";
export const E2E_ARTIFACT_DIR = ".maestro-artifacts";
export const E2E_FLOW_DIR = ".maestro";
export const E2E_REQUIRED_ENVIRONMENT = "preview";
export const E2E_TEST_API_STAGE = "/test";

export interface E2EConfig {
  appId: string;
  apiUrl: URL;
  artifactDir: string;
  flowDir: string;
  email?: string;
  password?: string;
}

const requiredValue = (
  processEnv: Readonly<Record<string, string | undefined>>,
  name: string
) => {
  const value = processEnv[name]?.trim();
  if (!value) throw new Error(`${name} is required`);

  return value;
};

export const resolveE2EConfig = (
  processEnv: Readonly<Record<string, string | undefined>>,
  options: { requireCredentials?: boolean } = {}
): E2EConfig => {
  const environment = requiredValue(processEnv, "APP_ENV");
  if (environment !== E2E_REQUIRED_ENVIRONMENT) {
    throw new Error(`APP_ENV must be ${E2E_REQUIRED_ENVIRONMENT}`);
  }

  const appId = processEnv.MAESTRO_APP_ID?.trim() || E2E_APP_ID;
  if (appId !== E2E_APP_ID) throw new Error(`MAESTRO_APP_ID must be ${E2E_APP_ID}`);

  const apiUrlValue = requiredValue(processEnv, "E2E_API_URL");
  let apiUrl: URL;

  try {
    apiUrl = new URL(apiUrlValue);
  } catch {
    throw new Error("E2E_API_URL must be a valid URL");
  }

  const apiPath = apiUrl.pathname.replace(/\/$/, "");
  if (apiPath !== E2E_TEST_API_STAGE) {
    throw new Error("E2E_API_URL must target the /test API stage");
  }

  const config: E2EConfig = {
    appId,
    apiUrl,
    artifactDir: E2E_ARTIFACT_DIR,
    flowDir: E2E_FLOW_DIR,
  };

  if (!options.requireCredentials) return config;

  return {
    ...config,
    email: requiredValue(processEnv, "MAESTRO_E2E_EMAIL"),
    password: requiredValue(processEnv, "MAESTRO_E2E_PASSWORD"),
  };
};
