import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = __dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@assets": path.resolve(rootDir, "assets"),
    },
  },
  test: {
    dir: "src",
    environment: "node",
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.expo/**"],
    restoreMocks: true,
  },
});
