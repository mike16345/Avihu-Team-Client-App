import { failedTests, firstLine, formatDuration, testLocation, testTitle } from "./format.mjs";

export function renderTerminal(result) {
  const { counts, metadata } = result;
  const outputDirectory = metadata.outputDir ?? ".test-report";
  const lines = [
    `TESTS ${result.status === "passed" ? "PASSED" : "FAILED"} — ${metadata.repository}`,
    `Passed ${counts.passed} | Failed ${counts.failed} | Skipped ${counts.skipped} | Total ${counts.total} | ${formatDuration(result.durationMs)}`,
  ];

  if (result.status === "failed") {
    lines.push("", "FAILED");
    let failureNumber = 0;
    for (const { test } of failedTests(result)) {
      failureNumber += 1;
      lines.push(`${failureNumber}. ${testTitle(test) || "Unnamed test"}`);
      const location = testLocation(test);
      if (location) lines.push(`   ${location}`);
      const message = firstLine(test.failureMessage || test.stack);
      if (message) lines.push(`   ${message}`);
    }

    for (const suite of result.suites) {
      for (const error of suite.infrastructureErrors ?? []) {
        failureNumber += 1;
        lines.push(`${failureNumber}. ${suite.name} infrastructure failure`, `   ${firstLine(error)}`);
      }
    }
  }

  lines.push("", `Report: ${outputDirectory}/report.html`, `Raw logs: ${outputDirectory}/suites/`);
  return `${lines.join("\n")}\n`;
}
