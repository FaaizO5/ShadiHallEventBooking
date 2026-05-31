"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/errors";

// Register a new account. Always assigns role USER (FR-013); admins are seeded.
export async function registerAction(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input", code: "VALIDATION" };
  }
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists", code: "CONFLICT" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { email, passwordHash, name: parsed.data.name, role: "USER" },
  });
  return { ok: true };
}
