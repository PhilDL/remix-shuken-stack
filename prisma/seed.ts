import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || "rachel@remix.run";

  // cleanup the existing database
  const user = await prisma.user.findUnique({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  if (!user) {
    const hashedPassword = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "racheliscool",
      10
    );

    await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
        role: "admin",
      },
    });
    console.log(`Database has been seeded. 🌱`);
  } else {
    console.log("User already exists. 🌱");
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
