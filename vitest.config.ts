import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],

    // Reporters: verbose in terminal, HTML + JSON saved to disk every run
    reporters: ["verbose", "html", "json"],
    outputFile: {
      html: "./tests/report/index.html",
      json: "./tests/report/results.json",
    },

    // Coverage via v8 — run with: npm run test:coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./tests/coverage",
      include: ["app/api/**/*.ts", "lib/**/*.ts"],
      exclude: ["**/*.d.ts", "**/node_modules/**"],
    },
  },
});
