import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcrypt";

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const FEATURED_HALLS = [
  {
    name: "Royal Palm Banquet",
    description:
      "An elegant grand hall with crystal chandeliers and seating for large gatherings.",
    capacity: 800,
    images: ["/halls/royal-palm-banquet.jpg"],
    featured: true,
  },
  {
    name: "Emerald Garden Marquee",
    description: "A lush open-air marquee surrounded by manicured gardens and fountains.",
    capacity: 500,
    images: ["/halls/emerald-garden-marquee.jpg"],
    featured: true,
  },
  {
    name: "Pearl Continental Hall",
    description: "A modern air-conditioned venue with state-of-the-art lighting and sound.",
    capacity: 650,
    images: ["/halls/pearl-continental-hall.jpg"],
    featured: true,
  },
  {
    name: "Shalimar Grand",
    description: "Traditional Mughal-inspired architecture with sweeping arched ceilings.",
    capacity: 1000,
    images: ["/halls/shalimar-grand.jpg"],
    featured: true,
  },
  {
    name: "Crystal Court",
    description: "An intimate venue ideal for smaller, refined wedding celebrations.",
    capacity: 300,
    images: ["/halls/crystal-court.jpg"],
    featured: true,
  },
  {
    name: "Grand Marquee Lawns",
    description: "Expansive lawns with a covered stage and ample parking for guests.",
    capacity: 1200,
    images: ["/halls/grand-marquee-lawns.jpg"],
    featured: true,
  },
  {
    name: "Moonlight Hall",
    description: "A cozy evening venue with warm ambient lighting.",
    capacity: 250,
    images: ["/halls/moonlight-hall.jpg"],
    featured: false,
  },
  {
    name: "Riverside Pavilion",
    description: "A scenic waterfront pavilion for memorable daytime ceremonies.",
    capacity: 400,
    images: ["/halls/riverside-pavilion.jpg"],
    featured: false,
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-strong";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash, name: "Administrator", role: "ADMIN" },
  });
  console.log(`Seeded admin user: ${email}`);

  for (const hall of FEATURED_HALLS) {
    // Halls have no natural unique key; avoid duplicates on re-seed by name match.
    const existing = await prisma.hall.findFirst({ where: { name: hall.name } });
    if (existing) {
      await prisma.hall.update({ where: { id: existing.id }, data: hall });
    } else {
      await prisma.hall.create({ data: hall });
    }
  }
  console.log(`Seeded ${FEATURED_HALLS.length} halls`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
