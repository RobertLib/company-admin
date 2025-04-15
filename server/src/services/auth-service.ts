import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../lib/errors.js";
import {
  createUser,
  findUserByEmail,
  getUserByRefreshToken,
  getUserByResetToken,
  updateUser,
} from "./users-service.js";
import transporter from "../lib/transporter.js";

const generateToken = (payload: any, expiresIn: any = "15m") => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not set", 500);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

export const login = async (req: Request, email: string, password: string) => {
  const user = await findUserByEmail(req, email);

  if (!user) {
    throw new AppError(req.dict.auth.errors.invalidCredentials, 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError(req.dict.auth.errors.invalidCredentials, 401);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  await updateUser(req, user.id, {
    refreshToken,
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
};

export const register = async (
  req: Request,
  email: string,
  name: string,
  password: string
) => {
  const user = await createUser(req, {
    email,
    name,
    password,
  });

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  await updateUser(req, user.id, {
    refreshToken,
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { accessToken, refreshToken, user };
};

export const forgotPassword = async (req: Request, email: string) => {
  const user = await findUserByEmail(req, email);

  if (!user) {
    throw new AppError(req.dict.auth.errors.invalidEmail);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await updateUser(req, user.id, {
    resetPasswordToken: resetTokenHash,
    resetPasswordTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: req.dict.auth.forgotPassword.emailSubject,
    text: `${req.dict.auth.forgotPassword.emailText}: ${resetLink}`,
  });

  return { success: true };
};

export const resetPassword = async (
  req: Request,
  password: string,
  token: string
) => {
  const user = await getUserByResetToken(req, token);

  await updateUser(req, user.id, {
    password,
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null,
  });

  return { success: true };
};

export const refreshAccessToken = async (
  req: Request,
  refreshToken: string
) => {
  const user = await getUserByRefreshToken(req, refreshToken);

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);

  return { accessToken };
};

export const logout = async (req: Request, userId?: number) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  await updateUser(req, userId, {
    refreshToken: null,
    refreshTokenExpiry: null,
  });

  return { success: true };
};
