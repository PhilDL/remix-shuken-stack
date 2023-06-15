import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || "rachel@remix.run";

  const adminPermission = await prisma.permission.upsert({
    where: {
      name: "admin",
    },
    create: {
      name: "admin",
    },
    update: {},
  });
  const adminRole = await prisma.role.upsert({
    where: {
      name: "admin",
    },
    create: {
      name: "admin",
      permissions: {
        connect: {
          id: adminPermission.id,
        },
      },
    },
    update: {
      permissions: {
        connect: {
          id: adminPermission.id,
        },
      },
    },
  });

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
        roles: { connect: { id: adminRole.id } },
      },
    });
  }
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        title: "Shuken App",
      },
    });
    console.log(`Creating settings table. 🌱`);
  }
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
