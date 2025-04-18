import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getDictionary } from "../dictionaries/index.js";
import { AppError } from "../lib/errors.js";
import prisma from "../lib/prisma.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const login = async (email: string, password: string) => {
  const dict = getDictionary();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(dict.auth.errors.invalidCredentials, 401);
  }

  if (user.deletedAt) {
    throw new AppError(dict.auth.errors.accountDeactivated, 403);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new AppError(dict.auth.errors.invalidCredentials, 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError(dict.auth.errors.missingSecret, 500);
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, user: userWithoutPassword, success: true };
};

export const register = async (
  email: string,
  name: string,
  password: string
) => {
  const dict = getDictionary();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(dict.auth.errors.emailTaken, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "USER",
    },
  });

  if (!process.env.JWT_SECRET) {
    throw new AppError(dict.auth.errors.missingSecret, 500);
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, user: userWithoutPassword, success: true };
};

export const forgotPassword = async (email: string) => {
  const dict = getDictionary();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.deletedAt) {
    throw new AppError(dict.auth.errors.invalidEmail, 400);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError(dict.auth.errors.missingSecret, 500);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetPasswordToken: token,
      resetPasswordTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: dict.auth.forgotPassword.emailSubject,
    text: `${dict.auth.forgotPassword.emailText}: ${resetLink}`,
  });

  return { success: true };
};

export const resetPassword = async (token: string, password: string) => {
  const dict = getDictionary();

  let decoded;

  if (!process.env.JWT_SECRET) {
    throw new AppError(dict.auth.errors.missingSecret, 500);
  }

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
    };
  } catch (jwtError) {
    if (jwtError instanceof jwt.TokenExpiredError) {
      throw new AppError(dict.auth.errors.tokenExpired, 401);
    }

    throw new AppError(dict.auth.errors.invalidToken, 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
      resetPasswordToken: token,
      resetPasswordTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(dict.auth.errors.invalidToken, 401);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
  });

  return { success: true };
};
