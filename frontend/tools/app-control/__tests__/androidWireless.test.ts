import { describe, expect, it, vi } from "vitest";
import { normalizeAndroidWirelessDevices } from "../androidWireless";

type Result = { status: number; stdout: string; stderr: string };

const ok = (stdout = ""): Result => ({ status: 0, stdout, stderr: "" });

describe("normalizeAndroidWirelessDevices", () => {
  it("leaves normal USB, emulator, and explicit IP transports untouched", () => {
    const runAdb = vi.fn(() =>
      ok(`List of devices attached
R58M123456 device product:phone model:Phone device:phone transport_id:1
emulator-5554 device product:sdk model:sdk device:emu transport_id:2
192.168.1.151:42511 device product:phone model:Phone device:phone transport_id:3
`)
    );

    expect(normalizeAndroidWirelessDevices(runAdb)).toEqual({ normalized: false, endpoints: [] });
    expect(runAdb).toHaveBeenCalledOnce();
    expect(runAdb).toHaveBeenCalledWith(["devices", "-l"], undefined);
  });

  it("replaces duplicate mDNS transports with one explicit endpoint per phone", () => {
    const calls: Array<{ args: string[]; env?: Record<string, string> }> = [];
    const runAdb = vi.fn((args: string[], env?: Record<string, string>): Result => {
      calls.push({ args, env });
      if (args[0] === "devices") {
        return ok(`List of devices attached
adb-RFGYB1ELTPW-ihT621 (2)._adb-tls-connect._tcp device product:pa1quew model:SM_S931U1 device:pa1q transport_id:23
emulator-5554 device product:sdk model:sdk device:emu transport_id:1
`);
      }
      if (args[0] === "mdns") {
        return ok(`List of discovered mdns services
adb-RFGYB1ELTPW-ihT621 (2)\t_adb-tls-connect._tcp\t192.168.1.151:42511
adb-RFGYB1ELTPW-ihT621\t_adb-tls-connect._tcp\t192.168.1.151:44877
another-phone\t_adb-tls-connect._tcp\t192.168.1.152:37123
`);
      }
      return ok();
    });

    expect(normalizeAndroidWirelessDevices(runAdb)).toEqual({
      normalized: true,
      endpoints: ["192.168.1.151:42511", "192.168.1.152:37123"],
    });
    expect(calls).toEqual([
      { args: ["devices", "-l"], env: undefined },
      { args: ["mdns", "services"], env: undefined },
      { args: ["kill-server"], env: { ADB_MDNS_AUTO_CONNECT: "0" } },
      { args: ["start-server"], env: { ADB_MDNS_AUTO_CONNECT: "0" } },
      { args: ["connect", "192.168.1.151:42511"], env: { ADB_MDNS_AUTO_CONNECT: "0" } },
      { args: ["connect", "192.168.1.152:37123"], env: { ADB_MDNS_AUTO_CONNECT: "0" } },
    ]);
  });

  it("fails without restarting ADB when an attached mDNS transport cannot be resolved", () => {
    const runAdb = vi
      .fn()
      .mockReturnValueOnce(ok("adb-phone._adb-tls-connect._tcp device\n"))
      .mockReturnValueOnce(ok("List of discovered mdns services\n"));

    expect(() => normalizeAndroidWirelessDevices(runAdb)).toThrowError(
      "Wireless Android device was detected, but ADB did not provide its IP address"
    );
    expect(runAdb).toHaveBeenCalledTimes(2);
  });

  it("reports a failed explicit wireless connection", () => {
    const runAdb = vi
      .fn()
      .mockReturnValueOnce(ok("adb-phone._adb-tls-connect._tcp device\n"))
      .mockReturnValueOnce(ok("phone\t_adb-tls-connect._tcp\t192.168.1.151:42511\n"))
      .mockReturnValueOnce(ok())
      .mockReturnValueOnce(ok())
      .mockReturnValueOnce({ status: 1, stdout: "", stderr: "connection refused" });

    expect(() => normalizeAndroidWirelessDevices(runAdb)).toThrowError(
      "Could not reconnect Android device at 192.168.1.151:42511: connection refused"
    );
  });
});
