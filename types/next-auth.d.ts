import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Augment NextAuth types so `session.user.id` and `session.user.role` are typed,
// and the JWT carries `id` + `role`.
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
