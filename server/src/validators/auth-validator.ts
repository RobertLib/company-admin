import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import { validateUser } from "./users-validator.js";

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateUser(["email", "password"])(req, res, next);
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateUser(["email", "password", "confirmPassword"])(req, res, next);
};

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateUser(["email"])(req, res, next);
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.body ?? {};

  if (!token) {
    throw new AppError("Token is required");
  }

  validateUser(["password", "confirmPassword"])(req, res, next);
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body ?? {};

  if (!refreshToken) {
    throw new AppError("Refresh token is required");
  }

  next();
};
