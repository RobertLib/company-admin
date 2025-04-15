import express from "express";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../validators/auth-validator.js";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../services/auth-service.js";

const router = express.Router();

router.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);
  res.send(result);
});

router.post("/register", validateRegister, async (req, res) => {
  const { email, name, password } = req.body;
  const result = await register(email, name, password);
  res.send(result);
});

router.post("/forgot-password", validateForgotPassword, async (req, res) => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  res.send(result);
});

router.post("/reset-password", validateResetPassword, async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPassword(token, password);
  res.send(result);
});

export default router;
