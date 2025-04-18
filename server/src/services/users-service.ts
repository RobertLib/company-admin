import prisma from "../lib/prisma.js";

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
  });

  return users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};
