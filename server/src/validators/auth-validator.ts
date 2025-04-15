import { Request, Response, NextFunction } from "express";
import { getDictionary } from "../dictionaries/index.js";
import { AppError } from "../lib/errors.js";

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const dict = getDictionary();

  const fieldErrors: Record<string, string> = {};

  if (!email || email.trim() === "") {
    fieldErrors.email = dict.auth.errors.emailRequired;
  } else if (!email.match(/^.+@.+\..+$/)) {
    fieldErrors.email = dict.auth.errors.invalidEmail;
  }

  if (!password || password.trim() === "") {
    fieldErrors.password = dict.auth.errors.passwordRequired;
  } else if (password.length < 8) {
    fieldErrors.password = dict.auth.errors.passwordTooShort;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(dict.form.errors.invalidForm, fieldErrors, 400);
  }

  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, confirmPassword } = req.body;

  const dict = getDictionary();

  const fieldErrors: Record<string, string> = {};

  if (!email || email.trim() === "") {
    fieldErrors.email = dict.auth.errors.emailRequired;
  } else if (!email.match(/^.+@.+\..+$/)) {
    fieldErrors.email = dict.auth.errors.invalidEmail;
  }

  if (!password || password.trim() === "") {
    fieldErrors.password = dict.auth.errors.passwordRequired;
  } else if (password.length < 8) {
    fieldErrors.password = dict.auth.errors.passwordTooShort;
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    fieldErrors.confirmPassword = dict.auth.errors.confirmPasswordRequired;
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = dict.auth.errors.passwordsDoNotMatch;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(dict.form.errors.invalidForm, fieldErrors, 400);
  }

  next();
};

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  const dict = getDictionary();

  const fieldErrors: Record<string, string> = {};

  if (!email || email.trim() === "") {
    fieldErrors.email = dict.auth.errors.emailRequired;
  } else if (!email.match(/^.+@.+\..+$/)) {
    fieldErrors.email = dict.auth.errors.invalidEmail;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(dict.form.errors.invalidForm, fieldErrors, 400);
  }

  next();
};

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, confirmPassword } = req.body;

  const dict = getDictionary();

  const fieldErrors: Record<string, string> = {};

  if (!password || password.trim() === "") {
    fieldErrors.password = dict.auth.errors.passwordRequired;
  } else if (password.length < 8) {
    fieldErrors.password = dict.auth.errors.passwordTooShort;
  }

  if (!confirmPassword || confirmPassword.trim() === "") {
    fieldErrors.confirmPassword = dict.auth.errors.confirmPasswordRequired;
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = dict.auth.errors.passwordsDoNotMatch;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(dict.form.errors.invalidForm, fieldErrors, 400);
  }

  next();
};
