import { AppError } from "../../lib/errors.js";
import { hasRole, isAuth } from "../../middleware/auth-middleware.js";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: "Bearer fake-token",
      },
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe("isAuth", () => {
    it("should throw error if no token is provided", () => {
      mockRequest.headers.authorization = null;

      expect(() => isAuth(mockRequest, mockResponse, nextFunction)).toThrow(
        new AppError("No token provided", 401)
      );
    });

    it("should set user object and call next if token is valid", () => {
      const mockUser = { id: 1, email: "test@example.com", role: "USER" };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      isAuth(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should throw error if token is expired", () => {
      const error = new jwt.TokenExpiredError("Token expired", new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => isAuth(mockRequest, mockResponse, nextFunction)).toThrow(
        new AppError("Token expired", 401)
      );
    });

    it("should throw error if token is invalid", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      expect(() => isAuth(mockRequest, mockResponse, nextFunction)).toThrow(
        new AppError("Invalid token", 403)
      );
    });
  });

  describe("hasRole", () => {
    it("should throw error if user is not authenticated", () => {
      mockRequest.user = undefined;

      expect(() =>
        hasRole(Role.ADMIN)(mockRequest, mockResponse, nextFunction)
      ).toThrow(new AppError("User not authenticated", 401));
    });

    it("should throw error if user doesn't have required role", () => {
      mockRequest.user = { id: 1, email: "user@example.com", role: Role.USER };

      expect(() =>
        hasRole(Role.ADMIN)(mockRequest, mockResponse, nextFunction)
      ).toThrow(
        new AppError("You do not have permission to access this resource", 403)
      );
    });

    it("should call next if user has required role", () => {
      mockRequest.user = {
        id: 1,
        email: "admin@example.com",
        role: Role.ADMIN,
      };

      hasRole(Role.ADMIN)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
