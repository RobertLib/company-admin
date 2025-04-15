import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as { id: number; email: string; role: Role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expired", 401);
    } else {
      throw new AppError("Invalid token", 403);
    }
  }
};

export const hasRole =
  (role: Role) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    if (req.user.role !== role) {
      throw new AppError(
        "You do not have permission to access this resource",
        403
      );
    }

    next();
  };
