import { prisma } from "./prisma";

export async function getHalls(opts?: { featured?: boolean; take?: number }) {
  return prisma.hall.findMany({
    where: opts?.featured !== undefined ? { featured: opts.featured } : undefined,
    orderBy: { createdAt: "asc" },
    take: opts?.take,
  });
}

export async function getHall(id: string) {
  return prisma.hall.findUnique({ where: { id } });
}
