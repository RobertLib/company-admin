import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import { Role } from "@prisma/client";

export const validateUser =
  (requiredFields: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { email, password, confirmPassword, role } = req.body ?? {};

    const fieldErrors: Record<string, string> = {};

    if (requiredFields.includes("email")) {
      if (!email || email.trim() === "") {
        fieldErrors.email = req.dict.user.errors.emailRequired;
      } else if (!email.match(/^.+@.+\..+$/)) {
        fieldErrors.email = req.dict.user.errors.invalidEmail;
      }
    }

    if (
      requiredFields.includes("role") &&
      !Object.values(Role).includes(role)
    ) {
      fieldErrors.role = req.dict.user.errors.invalidRole;
    }

    if (requiredFields.includes("password")) {
      if (!password || password.trim() === "") {
        fieldErrors.password = req.dict.user.errors.passwordRequired;
      } else if (password.length < 8) {
        fieldErrors.password = req.dict.user.errors.passwordTooShort;
      }
    }

    if (requiredFields.includes("confirmPassword")) {
      if (!confirmPassword || confirmPassword.trim() === "") {
        fieldErrors.confirmPassword =
          req.dict.user.errors.confirmPasswordRequired;
      } else if (password !== confirmPassword) {
        fieldErrors.confirmPassword = req.dict.user.errors.passwordsDoNotMatch;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new AppError(req.dict.form.errors.invalidForm, fieldErrors);
    }

    next();
  };
