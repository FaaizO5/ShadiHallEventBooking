import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the session accessor so we can drive role-based authorization.
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));
// next/navigation redirect throws (as it does at runtime) so we can assert on it.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

import { assertAdmin, assertUser, AuthorizationError } from "@/lib/guards";

beforeEach(() => mockAuth.mockReset());

describe("server-side authorization (Principle II, SC-004)", () => {
  it("assertAdmin denies a regular USER", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "USER" } });
    await expect(assertAdmin()).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("assertAdmin denies an unauthenticated visitor", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(assertAdmin()).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("assertAdmin allows an ADMIN", async () => {
    mockAuth.mockResolvedValue({ user: { id: "a1", role: "ADMIN" } });
    await expect(assertAdmin()).resolves.toMatchObject({ role: "ADMIN" });
  });

  it("assertUser denies an unauthenticated visitor", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(assertUser()).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("assertUser allows any signed-in user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "USER" } });
    await expect(assertUser()).resolves.toMatchObject({ id: "u1" });
  });
});
