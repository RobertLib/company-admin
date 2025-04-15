import { AppError } from "../../lib/errors.js";
import {
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resetPassword,
} from "../../services/auth-service.js";
import * as usersService from "../../services/users-service.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import transporter from "../../lib/transporter.js";

jest.mock("../../services/users-service");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("crypto");
jest.mock("../../lib/transporter", () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

describe("Auth Service", () => {
  const mockRequest = {
    dict: require("../../dictionaries/cs.json"),
  } as any;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test_secret";
    process.env.FRONTEND_URL = "http://localhost:3000";
    process.env.EMAIL_USER = "test@example.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("login", () => {
    it("should throw error if user is not found", async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        login(mockRequest, "nonexistent@email.cz", "password")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.auth.errors.invalidCredentials, 401)
      );
    });

    it("should throw error if password doesn't match", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
        password: "hashedPassword",
        role: "USER",
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        login(mockRequest, "user@email.cz", "wrongpassword")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.auth.errors.invalidCredentials, 401)
      );
    });

    it("should throw error if JWT_SECRET is not set", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
        password: "hashedPassword",
        role: "USER",
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      delete process.env.JWT_SECRET;

      await expect(
        login(mockRequest, "user@email.cz", "password")
      ).rejects.toThrow(new AppError("JWT_SECRET is not set", 500));

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should generate token with correct payload", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
        password: "hashedPassword",
        role: "USER",
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (usersService.updateUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mocked_token");
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => "mocked_refresh_token",
      });

      await login(mockRequest, "user@email.cz", "password");

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "user@email.cz", role: "USER" },
        "test_secret",
        { expiresIn: "15m" }
      );
    });
  });

  describe("register", () => {
    it("should register a new user and return tokens and user", async () => {
      const mockUser = {
        id: 1,
        email: "new@email.cz",
        name: "New User",
        password: "hashedPassword",
        role: "USER",
      };

      (usersService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (usersService.updateUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mocked_token");
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => "mocked_refresh_token",
      });

      const result = await register(
        mockRequest,
        "new@email.cz",
        "New User",
        "password"
      );

      expect(usersService.createUser).toHaveBeenCalledWith(mockRequest, {
        email: "new@email.cz",
        name: "New User",
        password: "password",
      });
      expect(usersService.updateUser).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken", "mocked_token");
      expect(result).toHaveProperty("refreshToken", "mocked_refresh_token");
      expect(result).toHaveProperty("user", mockUser);
    });
  });

  describe("forgotPassword", () => {
    it("should throw error if user not found", async () => {
      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        forgotPassword(mockRequest, "nonexistent@email.com")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.auth.errors.invalidEmail)
      );
    });

    it("should generate reset token and send email", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
      };

      (usersService.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => "reset_token",
      });
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed_token"),
      });

      await forgotPassword(mockRequest, "user@email.cz");

      expect(usersService.updateUser).toHaveBeenCalledWith(
        mockRequest,
        1,
        expect.objectContaining({
          resetPasswordToken: "hashed_token",
          resetPasswordTokenExpiry: expect.any(Date),
        })
      );

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: "test@example.com",
        to: "user@email.cz",
        subject: "Obnova hesla",
        text: expect.stringContaining(
          "http://localhost:3000/reset-password?token=reset_token"
        ),
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset user password", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
      };

      (usersService.getUserByResetToken as jest.Mock).mockResolvedValue(
        mockUser
      );

      await resetPassword(mockRequest, "newpassword", "reset_token");

      expect(usersService.updateUser).toHaveBeenCalledWith(mockRequest, 1, {
        password: "newpassword",
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      });
    });
  });

  describe("refreshAccessToken", () => {
    it("should generate new access token with refresh token", async () => {
      const mockUser = {
        id: 1,
        email: "user@email.cz",
        role: "USER",
      };

      (usersService.getUserByRefreshToken as jest.Mock).mockResolvedValue(
        mockUser
      );
      (jwt.sign as jest.Mock).mockReturnValue("new_access_token");

      const result = await refreshAccessToken(
        mockRequest,
        "valid_refresh_token"
      );

      expect(usersService.getUserByRefreshToken).toHaveBeenCalledWith(
        mockRequest,
        "valid_refresh_token"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "user@email.cz", role: "USER" },
        "test_secret",
        { expiresIn: "15m" }
      );
      expect(result).toHaveProperty("accessToken", "new_access_token");
    });
  });

  describe("logout", () => {
    it("should throw error if userId is not provided", async () => {
      await expect(logout(mockRequest, undefined)).rejects.toThrow(
        new AppError("User ID is required", 400)
      );
    });

    it("should invalidate refresh token", async () => {
      await logout(mockRequest, 1);

      expect(usersService.updateUser).toHaveBeenCalledWith(mockRequest, 1, {
        refreshToken: null,
        refreshTokenExpiry: null,
      });
    });
  });
});
