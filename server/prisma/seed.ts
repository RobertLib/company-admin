import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Skipping seed data in production");
    return;
  }

  const hashedPassword = await bcrypt.hash("password", 12);

  const rob = await prisma.user.upsert({
    where: { email: "rob@hotmail.cz" },
    update: {},
    create: {
      email: "rob@hotmail.cz",
      name: "Rob",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@email.cz" },
    update: {},
    create: {
      email: "admin@email.cz",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@email.cz" },
    update: {},
    create: {
      email: "user@email.cz",
      name: "User",
      password: hashedPassword,
      role: "USER",
    },
  });

  const users = await prisma.user.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      email: `user${i + 1}@email.cz`,
      name: `User ${i + 1}`,
      password: hashedPassword,
      role: "USER",
    })),
    skipDuplicates: true,
  });

  console.log({ rob, admin, user, usersCount: users.count });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
