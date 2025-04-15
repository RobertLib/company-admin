import express from "express";
import {
  validateForgotPassword,
  validateLogin,
  validateRefreshToken,
  validateRegister,
  validateResetPassword,
} from "../validators/auth-validator.js";
import {
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
} from "../services/auth-service.js";
import { isAuth } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body ?? {};
  const result = await login(req, email, password);
  res.send(result);
});

router.post("/register", validateRegister, async (req, res) => {
  const { email, name, password } = req.body ?? {};
  const result = await register(req, email, name, password);
  res.send(result);
});

router.post("/forgot-password", validateForgotPassword, async (req, res) => {
  const { email } = req.body ?? {};
  const result = await forgotPassword(req, email);
  res.send(result);
});

router.post("/reset-password", validateResetPassword, async (req, res) => {
  const { password, token } = req.body ?? {};
  const result = await resetPassword(req, password, token);
  res.send(result);
});

router.post("/refresh-token", validateRefreshToken, async (req, res) => {
  const { refreshToken } = req.body ?? {};
  const result = await refreshAccessToken(req, refreshToken);
  res.send(result);
});

router.post("/logout", isAuth, async (req, res) => {
  const result = await logout(req, req.user?.id);
  res.send(result);
});

export default router;
