import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "./auth";

export interface SessionUser {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
}

/**
 * Require a signed-in user. Redirects unauthenticated visitors to /login (FR-023).
 * Use in protected pages.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user as SessionUser;
}

/**
 * Require an admin. Redirects non-admins. Use in admin-only pages.
 * (Server actions use `assertAdmin` to throw instead of redirect.)
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

/** Throwing variant for server actions (Constitution Principle II). */
export class AuthorizationError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function assertUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new AuthorizationError("You must be signed in");
  return session.user as SessionUser;
}

export async function assertAdmin(): Promise<SessionUser> {
  const user = await assertUser();
  if (user.role !== "ADMIN") throw new AuthorizationError("Admin access required");
  return user;
}
