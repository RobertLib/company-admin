import { AppError } from "../../lib/errors.js";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  getUserById,
  getUserByRefreshToken,
  getUserByResetToken,
  getUsers,
  updateUser,
} from "../../services/users-service.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../mocks/prisma.js";

jest.mock("bcrypt");
jest.mock("crypto");

describe("Users Service", () => {
  const mockRequest = {
    dict: require("../../dictionaries/cs.json"),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = { id: 1, email: "test@example.com", role: "USER" };
      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await getUserById(mockRequest, 1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        where: { id: 1 },
      });
    });

    it("should throw error when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(getUserById(mockRequest, 999)).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.userNotFound, 404)
      );
    });

    it("should throw error when user is deleted", async () => {
      const deletedUser = {
        id: 1,
        email: "deleted@example.com",
        deletedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(deletedUser as any);

      await expect(getUserById(mockRequest, 1)).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.accountDeactivated, 403)
      );
    });

    it("should throw error when id is invalid", async () => {
      await expect(getUserById(mockRequest, NaN)).rejects.toThrow(
        new AppError("Invalid user ID")
      );
    });
  });

  describe("createUser", () => {
    it("should create and return new user", async () => {
      const userData = {
        email: "new@example.com",
        password: "password123",
        name: "New User",
      };
      const hashedPassword = "hashed_password";
      const createdUser = {
        id: 1,
        email: userData.email,
        name: userData.name,
      };

      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(createdUser as any);

      const result = await createUser(mockRequest, userData);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: userData.email,
          name: userData.name,
        })
      );
      expect(result).not.toHaveProperty("password");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        where: { email: userData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        userData.password,
        expect.any(Number)
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: "USER",
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
    });

    it("should throw error if email is already taken", async () => {
      const userData = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 2,
        email: userData.email,
      } as any);

      await expect(createUser(mockRequest, userData)).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.emailAlreadyExists, 400)
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("getUsers", () => {
    it("should return users and total count", async () => {
      const mockUsers = [
        { id: 1, email: "user1@example.com", role: "USER" },
        { id: 2, email: "user2@example.com", role: "ADMIN" },
      ];

      prisma.$transaction.mockResolvedValue([mockUsers, 2]);

      const args = { where: { role: "USER" }, skip: 0, take: 10 };
      const result = await getUsers(args as any);

      expect(result).toEqual({ users: mockUsers, totalCount: 2 });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("findUserByEmail", () => {
    it("should return user when found by email", async () => {
      const mockUser = { id: 1, email: "test@example.com", role: "USER" };
      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await findUserByEmail(mockRequest, "test@example.com");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
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
        where: { email: "test@example.com" },
      });
    });

    it("should throw error when user is deleted", async () => {
      const deletedUser = {
        id: 1,
        email: "deleted@example.com",
        deletedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(deletedUser as any);

      await expect(
        findUserByEmail(mockRequest, "deleted@example.com")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.accountDeactivated, 403)
      );
    });

    it("should return null when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await findUserByEmail(
        mockRequest,
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });
  });

  describe("getUserByResetToken", () => {
    it("should return user when valid reset token is provided", async () => {
      const mockUser = { id: 1, email: "test@example.com", role: "USER" };
      const mockToken = "valid-token";
      const mockTokenHash = "hashed-token";

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockTokenHash),
      });

      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await getUserByResetToken(mockRequest, mockToken);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
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
          resetPasswordToken: mockTokenHash,
          resetPasswordTokenExpiry: {
            gt: expect.any(Date),
          },
        },
      });
    });

    it("should throw error when token is invalid or expired", async () => {
      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed-token"),
      });

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        getUserByResetToken(mockRequest, "invalid-token")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.invalidToken, 401)
      );
    });

    it("should throw error when user is deleted", async () => {
      const deletedUser = {
        id: 1,
        email: "deleted@example.com",
        deletedAt: new Date(),
      };

      (crypto.createHash as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("hashed-token"),
      });

      prisma.user.findUnique.mockResolvedValue(deletedUser as any);

      await expect(
        getUserByResetToken(mockRequest, "valid-token")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.accountDeactivated, 403)
      );
    });
  });

  describe("getUserByRefreshToken", () => {
    it("should return user when valid refresh token is provided", async () => {
      const mockUser = { id: 1, email: "test@example.com", role: "USER" };
      const mockToken = "valid-refresh-token";

      prisma.user.findFirst.mockResolvedValue(mockUser as any);

      const result = await getUserByRefreshToken(mockRequest, mockToken);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          refreshToken: mockToken,
          refreshTokenExpiry: {
            gt: expect.any(Date),
          },
        },
      });
    });

    it("should throw error when refresh token is invalid or expired", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        getUserByRefreshToken(mockRequest, "invalid-token")
      ).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.invalidRefreshToken, 401)
      );
    });
  });

  describe("updateUser", () => {
    it("should update user without password change", async () => {
      const userId = 1;
      const userData = {
        name: "Updated Name",
      };
      const existingUser = {
        id: userId,
        email: "test@example.com",
        name: "Original Name",
      };
      const updatedUser = { ...existingUser, name: userData.name };

      prisma.user.findUnique.mockResolvedValue(existingUser as any);
      prisma.user.update.mockResolvedValue(updatedUser as any);

      const result = await updateUser(mockRequest, userId, userData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          ...userData,
          password: undefined,
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
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should update user with password change", async () => {
      const userId = 1;
      const userData = {
        name: "Updated Name",
        password: "newPassword123",
      };
      const existingUser = {
        id: userId,
        email: "test@example.com",
        name: "Original Name",
      };
      const updatedUser = { ...existingUser, name: userData.name };
      const hashedPassword = "new_hashed_password";

      prisma.user.findUnique.mockResolvedValue(existingUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.update.mockResolvedValue(updatedUser as any);

      const result = await updateUser(mockRequest, userId, userData);

      expect(result).toEqual(updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          ...userData,
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
    });

    it("should throw error if email already exists for another user", async () => {
      const userId = 1;
      const newEmail = "taken@example.com";
      const userData = { email: newEmail };
      const existingUser = { id: userId, email: "original@example.com" };
      const userWithSameEmail = { id: 2, email: newEmail };

      prisma.user.findUnique
        .mockResolvedValueOnce(existingUser as any)
        .mockResolvedValueOnce(userWithSameEmail as any);

      await expect(updateUser(mockRequest, userId, userData)).rejects.toThrow(
        new AppError(mockRequest.dict.user.errors.emailAlreadyExists, 409)
      );
    });
  });

  describe("deleteUser", () => {
    it("should soft delete user", async () => {
      const userId = 1;
      const existingUser = { id: userId, email: "test@example.com" };
      const deletedUser = { ...existingUser, deletedAt: new Date() };

      prisma.user.findUnique.mockResolvedValue(existingUser as any);
      prisma.user.update.mockResolvedValue(deletedUser as any);

      const result = await deleteUser(mockRequest, userId);

      expect(result).toEqual(deletedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          deletedAt: expect.any(Date),
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
    });
  });
});
