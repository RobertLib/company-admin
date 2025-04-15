import express from "express";
import { getDictionary } from "../../dictionaries/index.js";
import * as authService from "../../services/auth-service.js";
import authRoute from "../../routes/auth-route.js";
import request from "supertest";

jest.mock("../../middleware/auth-middleware.js", () => ({
  isAuth: (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
}));

jest.mock("../../services/auth-service");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.dict = getDictionary();
  next();
});
app.use("/api/v1", authRoute);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/login", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/v1/login")
        .send({ password: "password" });

      expect(response.status).toBe(400);
      expect(response.body).toBeTruthy();
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/v1/login")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toBeTruthy();
    });

    it("should return 200 and user data on successful login", async () => {
      const mockLoginResult = {
        accessToken: "test-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", role: "USER" },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      const response = await request(app)
        .post("/api/v1/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLoginResult);
    });
  });

  describe("POST /api/v1/register", () => {
    it("should return 200 and user data on successful registration", async () => {
      const mockRegisterResult = {
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          role: "USER",
        },
      };

      (authService.register as jest.Mock).mockResolvedValue(mockRegisterResult);

      const response = await request(app).post("/api/v1/register").send({
        email: "test@example.com",
        name: "Test User",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRegisterResult);
    });
  });

  describe("POST /api/v1/forgot-password", () => {
    it("should return 200 on successful forgot password request", async () => {
      const mockResult = { success: true };
      (authService.forgotPassword as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/v1/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("POST /api/v1/reset-password", () => {
    it("should return 200 on successful password reset", async () => {
      const mockResult = { success: true };
      (authService.resetPassword as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).post("/api/v1/reset-password").send({
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
        token: "valid-reset-token-format",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("POST /api/v1/refresh-token", () => {
    it("should return 200 and new tokens on successful token refresh", async () => {
      const mockResult = { accessToken: "new-access-token" };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post("/api/v1/refresh-token")
        .send({ refreshToken: "old-refresh-token" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("POST /api/v1/logout", () => {
    it("should return 200 on successful logout", async () => {
      const mockResult = { success: true };
      (authService.logout as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).post("/api/v1/logout");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });
});
