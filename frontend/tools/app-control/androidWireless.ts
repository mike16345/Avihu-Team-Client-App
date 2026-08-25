import { spawnSync } from "node:child_process";

export interface AdbResult {
  status: number;
  stdout: string;
  stderr: string;
}

export type AdbRunner = (args: string[], env?: Record<string, string>) => AdbResult;

export interface AndroidWirelessNormalization {
  normalized: boolean;
  endpoints: string[];
}

const DISABLE_MDNS_ENV = { ADB_MDNS_AUTO_CONNECT: "0" };

const endpointHost = (endpoint: string): string => {
  const bracketedIpv6 = /^\[([^\]]+)\]:\d+$/.exec(endpoint);
  if (bracketedIpv6) {
    return bracketedIpv6[1];
  }

  return endpoint.replace(/:\d+$/, "");
};

const parseConnectEndpoints = (output: string): string[] => {
  const byHost = new Map<string, string>();

  for (const line of output.split(/\r?\n/)) {
    const [, serviceType, endpoint] = line.split("\t");
    if (serviceType !== "_adb-tls-connect._tcp" || !endpoint) {
      continue;
    }

    const value = endpoint.trim();
    if (value) {
      const host = endpointHost(value);
      if (!byHost.has(host)) {
        byHost.set(host, value);
      }
    }
  }

  return [...byHost.values()];
};

const assertSuccess = (result: AdbResult, message: string): void => {
  if (result.status === 0) {
    return;
  }

  const detail = result.stderr.trim() || result.stdout.trim() || "ADB command failed";
  throw new Error(`${message}: ${detail}`);
};

export const runAdb: AdbRunner = (args, env) => {
  const result = spawnSync("adb", args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.error?.message ?? result.stderr ?? "",
  };
};

export const normalizeAndroidWirelessDevices = (
  executeAdb: AdbRunner = runAdb
): AndroidWirelessNormalization => {
  const attached = executeAdb(["devices", "-l"], undefined);
  assertSuccess(attached, "Could not inspect Android devices");

  if (!attached.stdout.includes("._adb-tls-connect._tcp")) {
    return { normalized: false, endpoints: [] };
  }

  const discovered = executeAdb(["mdns", "services"], undefined);
  assertSuccess(discovered, "Could not resolve wireless Android devices");
  const endpoints = parseConnectEndpoints(discovered.stdout);
  if (endpoints.length === 0) {
    throw new Error(
      "Wireless Android device was detected, but ADB did not provide its IP address. " +
        "Open Wireless debugging on the phone and pair it again."
    );
  }

  assertSuccess(
    executeAdb(["kill-server"], DISABLE_MDNS_ENV),
    "Could not restart Android debugging"
  );
  assertSuccess(
    executeAdb(["start-server"], DISABLE_MDNS_ENV),
    "Could not restart Android debugging"
  );

  for (const endpoint of endpoints) {
    assertSuccess(
      executeAdb(["connect", endpoint], DISABLE_MDNS_ENV),
      `Could not reconnect Android device at ${endpoint}`
    );
  }

  return { normalized: true, endpoints };
};
