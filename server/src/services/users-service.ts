import { Request } from "express";
import { AppError } from "../lib/errors.js";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

export const getUsers = async (args: Prisma.UserFindManyArgs) => {
  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      ...args,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    }),
    prisma.user.count({ where: args.where }),
  ]);

  return { users, totalCount };
};

export const getUserById = async (req: Request, id: number) => {
  if (isNaN(id)) {
    throw new AppError("Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    where: { id },
  });

  if (!user) {
    throw new AppError(req.dict.user.errors.userNotFound, 404);
  }

  if (user.deletedAt) {
    throw new AppError(req.dict.user.errors.accountDeactivated, 403);
  }

  return user;
};

export const findUserByEmail = async (req: Request, email: string) => {
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    where: { email },
  });

  if (user?.deletedAt) {
    throw new AppError(req.dict.user.errors.accountDeactivated, 403);
  }

  return user;
};

export const getUserByResetToken = async (req: Request, token: string) => {
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    where: {
      resetPasswordToken: resetTokenHash,
      resetPasswordTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(req.dict.user.errors.invalidToken, 401);
  }

  if (user?.deletedAt) {
    throw new AppError(req.dict.user.errors.accountDeactivated, 403);
  }

  return user;
};

export const getUserByRefreshToken = async (
  req: Request,
  refreshToken: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      refreshToken,
      refreshTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(req.dict.user.errors.invalidRefreshToken, 401);
  }

  return user;
};

export const createUser = async (
  req: Request,
  data: Prisma.UserCreateInput
) => {
  const existingUser = await findUserByEmail(req, data.email);
  if (existingUser) {
    throw new AppError(req.dict.user.errors.emailAlreadyExists, 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const newUser = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: data.role || "USER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return newUser;
};

export const updateUser = async (
  req: Request,
  id: number,
  data: Prisma.UserUpdateInput
) => {
  await getUserById(req, id);

  if (data.email) {
    const existingUser = await findUserByEmail(req, data.email as string);
    if (existingUser && existingUser.id !== id) {
      throw new AppError(req.dict.user.errors.emailAlreadyExists, 409);
    }
  }

  let hashedPassword;

  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password as string, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (req: Request, id: number) => {
  await getUserById(req, id);

  const deletedUser = await updateUser(req, id, {
    deletedAt: new Date(),
  });

  return deletedUser;
};
