import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*" -> "./*" path alias.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    // Unit tests for framework-agnostic domain logic under lib/
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
