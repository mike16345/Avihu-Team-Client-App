export default {
  repository: "Avihu Team Client App",
  outputDir: ".test-report",
  workflowPath: ".github/workflows/quality-checks.yml",
  email: {
    from: "Avihu CI <michaelgani815@gmail.com>",
    to: "michaelgani815@gmail.com",
  },
  suites: [
    {
      name: "Unit tests",
      framework: "vitest",
      cwd: "frontend",
      command: "npx",
      args: ["vitest", "run"],
    },
  ],
};
