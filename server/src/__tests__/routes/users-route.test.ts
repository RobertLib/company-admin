import express from "express";
import { getDictionary } from "../../dictionaries/index.js";
import * as usersService from "../../services/users-service.js";
import request from "supertest";
import usersRoute from "../../routes/users-route.js";

jest.mock("../../middleware/auth-middleware.js", () => ({
  isAuth: (req: any, res: any, next: any) => {
    req.user = { id: 1, email: "test@example.com", role: "ADMIN" };
    next();
  },
  hasRole: () => (req: any, res: any, next: any) => {
    next();
  },
}));

jest.mock("../../services/users-service");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.dict = getDictionary();
  next();
});
app.use("/api/v1/users", usersRoute);

describe("Users Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return user data when found", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      (usersService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get("/api/v1/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(usersService.getUserById).toHaveBeenCalledWith(
        expect.anything(),
        1
      );
    });

    it("should return 404 when user not found", async () => {
      (usersService.getUserById as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: "User not found",
      });

      const response = await request(app).get("/api/v1/users/999");

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/users", () => {
    it("should return list of users", async () => {
      const mockUsers = [
        { id: 1, email: "user1@example.com", name: "User One" },
        { id: 2, email: "user2@example.com", name: "User Two" },
      ];
      const mockResult = {
        data: mockUsers,
        meta: { total: 2, page: 1, limit: 20 },
      };

      (usersService.getUsers as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).get("/api/v1/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(usersService.getUsers).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { id: "desc" },
        where: {
          name: undefined,
          email: undefined,
          role: undefined,
          deletedAt: null,
        },
      });
    });

    it("should apply pagination, sorting and filtering parameters", async () => {
      const mockUsers = [
        { id: 3, email: "filtered@example.com", name: "Filtered User" },
      ];
      const mockResult = {
        data: mockUsers,
        meta: { total: 1, page: 2, limit: 10 },
      };

      (usersService.getUsers as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).get(
        "/api/v1/users?page=2&limit=10&sortBy=email&order=asc&name=filtered&role=ADMIN"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(usersService.getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          orderBy: { email: "asc" },
          where: expect.objectContaining({
            name: expect.any(Object),
            role: "ADMIN",
          }),
        })
      );
    });
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        email: "new@example.com",
        name: "New User",
        password: "password123",
        confirmPassword: "password123",
        role: "USER",
      };
      const createdUser = {
        id: 3,
        email: "new@example.com",
        name: "New User",
        role: "USER",
      };

      (usersService.createUser as jest.Mock).mockResolvedValue(createdUser);

      const response = await request(app).post("/api/v1/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(usersService.createUser).toHaveBeenCalledWith(expect.anything(), {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
      });
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    it("should update an existing user", async () => {
      const updatedData = {
        email: "updated@example.com",
        name: "Updated User",
        role: "ADMIN",
      };
      const updatedUser = {
        id: 1,
        ...updatedData,
      };

      (usersService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch("/api/v1/users/1")
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(usersService.updateUser).toHaveBeenCalledWith(
        expect.anything(),
        1,
        {
          email: updatedData.email,
          name: updatedData.name,
          password: undefined,
          role: updatedData.role,
        }
      );
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete a user", async () => {
      const deletedUser = {
        id: 1,
        email: "deleted@example.com",
        name: "Deleted User",
      };

      (usersService.deleteUser as jest.Mock).mockResolvedValue(deletedUser);

      const response = await request(app).delete("/api/v1/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(deletedUser);
      expect(usersService.deleteUser).toHaveBeenCalledWith(
        expect.anything(),
        1
      );
    });
  });
});
