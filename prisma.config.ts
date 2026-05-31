import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Prisma 7 moves datasource connection URLs and the seed command out of
// schema.prisma into this config file.
//
// We read the URL via process.env directly (not Prisma's `env()`) so that commands
// like `prisma generate` still work before a .env is configured. Migration commands
// will fail clearly at run time if the URL is missing.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prefer the direct (non-pooled) URL for migrations; fall back to DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
